'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { computeExpertScores } from '@/lib/qa/experts'
import { sendPushToUser, sendPushToTeam } from '@/lib/notifications'

function requireAuth() {
  return getSession().then((s) => {
    if (!s.isLoggedIn || !s.user) throw new Error('Unauthorized')
    return s.user
  })
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function postQuestion(data: {
  title: string
  body: string
  tags: string[]
  org_scope_dn?: string
  directed_dns?: string[]
  directed_team_ous?: string[]
}): Promise<number> {
  const user = await requireAuth()

  const result = await query(
    `INSERT INTO qa_questions (author_dn, author_cn, author_title, title, body, tags, org_scope_dn)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [user.dn, user.cn, user.title, data.title, data.body, data.tags, data.org_scope_dn ?? ''],
  )
  const questionId = result.rows[0].id

  if (data.directed_dns?.length) {
    for (const dn of data.directed_dns) {
      await query(
        'INSERT INTO qa_directed_questions (question_id, target_dn) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [questionId, dn],
      )
    }
  }

  if (data.directed_team_ous?.length) {
    for (const ou of data.directed_team_ous) {
      await query(
        'INSERT INTO qa_directed_teams (question_id, target_ou) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [questionId, ou],
      )
    }
  }

  // Fire-and-forget push notifications to directed recipients
  const pushPayload = {
    title: `New question: ${data.title.slice(0, 80)}`,
    body: user.cn,
    url: `/qa/questions/${questionId}`,
  }
  for (const dn of data.directed_dns ?? []) sendPushToUser(dn, pushPayload).catch(console.error)
  for (const ou of data.directed_team_ous ?? []) sendPushToTeam(ou, pushPayload).catch(console.error)

  revalidatePath('/qa')
  redirect(`/qa/questions/${questionId}`)
}

export async function updateQuestion(
  id: number,
  data: { title?: string; body?: string; tags?: string[] },
) {
  const user = await requireAuth()
  const check = await query('SELECT author_dn FROM qa_questions WHERE id = $1', [id])
  if (!check.rows.length || check.rows[0].author_dn !== user.dn) throw new Error('Forbidden')

  const updates: string[] = ['updated_at = NOW()']
  const vals: any[] = []

  if (data.title !== undefined) { vals.push(data.title); updates.push(`title = $${vals.length}`) }
  if (data.body  !== undefined) { vals.push(data.body);  updates.push(`body = $${vals.length}`) }
  if (data.tags  !== undefined) { vals.push(data.tags);  updates.push(`tags = $${vals.length}`) }

  vals.push(id)
  await query(`UPDATE qa_questions SET ${updates.join(', ')} WHERE id = $${vals.length}`, vals)

  revalidatePath(`/qa/questions/${id}`)
  revalidatePath('/qa')
}

// ─── Answers ─────────────────────────────────────────────────────────────────

export async function postAnswer(questionId: number, body: string) {
  const user = await requireAuth()
  if (!body?.trim()) throw new Error('Body is required')

  await query(
    'INSERT INTO qa_answers (question_id, author_dn, author_cn, author_title, body) VALUES ($1,$2,$3,$4,$5)',
    [questionId, user.dn, user.cn, user.title, body.trim()],
  )

  revalidatePath(`/qa/questions/${questionId}`)
}

export async function updateAnswer(answerId: number, body: string) {
  const user = await requireAuth()
  const check = await query('SELECT author_dn, question_id FROM qa_answers WHERE id = $1', [answerId])
  if (!check.rows.length || check.rows[0].author_dn !== user.dn) throw new Error('Forbidden')

  await query('UPDATE qa_answers SET body = $1, updated_at = NOW() WHERE id = $2', [body, answerId])
  revalidatePath(`/qa/questions/${check.rows[0].question_id}`)
}

export async function acceptAnswer(answerId: number) {
  const user = await requireAuth()

  const ans = await query(
    `SELECT a.question_id FROM qa_answers a
     JOIN qa_questions q ON q.id = a.question_id
     WHERE a.id = $1 AND q.author_dn = $2`,
    [answerId, user.dn],
  )
  if (!ans.rows.length) throw new Error('Forbidden')
  const questionId = ans.rows[0].question_id

  await query('UPDATE qa_answers SET is_accepted = FALSE WHERE question_id = $1', [questionId])
  await query('UPDATE qa_answers SET is_accepted = TRUE, updated_at = NOW() WHERE id = $1', [answerId])
  await query("UPDATE qa_questions SET status = 'answered', updated_at = NOW() WHERE id = $1", [questionId])

  const tagsResult = await query('SELECT tags FROM qa_questions WHERE id = $1', [questionId])
  const tags: string[] = tagsResult.rows[0]?.tags ?? []
  for (const tag of tags) {
    computeExpertScores(tag).catch(console.error)
  }

  revalidatePath(`/qa/questions/${questionId}`)
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export async function voteQuestion(questionId: number, value: 1 | -1) {
  const user = await requireAuth()
  const q = await query('SELECT author_dn FROM qa_questions WHERE id = $1', [questionId])
  if (q.rows[0]?.author_dn === user.dn) throw new Error('Cannot vote on own question')

  await query(
    `INSERT INTO qa_votes (voter_dn, target_type, target_id, value) VALUES ($1,'question',$2,$3)
     ON CONFLICT (voter_dn, target_type, target_id) DO UPDATE SET value = EXCLUDED.value`,
    [user.dn, questionId, value],
  )
  revalidatePath(`/qa/questions/${questionId}`)
  revalidatePath('/qa')
}

export async function voteAnswer(answerId: number, value: 1 | -1) {
  const user = await requireAuth()
  const a = await query('SELECT author_dn, question_id FROM qa_answers WHERE id = $1', [answerId])
  if (a.rows[0]?.author_dn === user.dn) throw new Error('Cannot vote on own answer')

  await query(
    `INSERT INTO qa_votes (voter_dn, target_type, target_id, value) VALUES ($1,'answer',$2,$3)
     ON CONFLICT (voter_dn, target_type, target_id) DO UPDATE SET value = EXCLUDED.value`,
    [user.dn, answerId, value],
  )
  revalidatePath(`/qa/questions/${a.rows[0].question_id}`)
}
