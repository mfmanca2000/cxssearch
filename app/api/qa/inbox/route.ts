import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

/** Derive a user's immediate OU from their DN (strip the leading CN=… component). */
function ouFromDn(dn: string): string {
  const idx = dn.indexOf(',')
  return idx === -1 ? '' : dn.slice(idx + 1)
}

const PERSONAL_Q = `
  SELECT
    q.id, q.title, q.body, q.tags, q.status, q.author_cn, q.author_title,
    q.created_at, q.updated_at,
    COALESCE(SUM(v.value), 0) AS vote_score,
    COUNT(DISTINCT a.id)      AS answer_count,
    dq.notified_at
  FROM qa_directed_questions dq
  JOIN qa_questions q  ON q.id = dq.question_id
  LEFT JOIN qa_votes v ON v.target_type = 'question' AND v.target_id = q.id
  LEFT JOIN qa_answers a ON a.question_id = q.id
  WHERE dq.target_dn = $1
  GROUP BY q.id, dq.notified_at
  ORDER BY q.created_at DESC`

const TEAM_Q = `
  SELECT
    q.id, q.title, q.body, q.tags, q.status, q.author_cn, q.author_title,
    q.created_at, q.updated_at,
    COALESCE(SUM(v.value), 0) AS vote_score,
    COUNT(DISTINCT a.id)      AS answer_count
  FROM qa_directed_teams dt
  JOIN qa_questions q  ON q.id = dt.question_id
  LEFT JOIN qa_votes v ON v.target_type = 'question' AND v.target_id = q.id
  LEFT JOIN qa_answers a ON a.question_id = q.id
  WHERE $1 = dt.target_ou OR $1 LIKE '%,' || dt.target_ou
  GROUP BY q.id
  ORDER BY q.created_at DESC`

/**
 * GET /api/qa/inbox
 * Returns { personal: { questions, unread }, team: { questions, unread } }
 */
export async function GET() {
  const session = await getSession()
  if (!session.user) {
    return NextResponse.json(
      { personal: { questions: [], unread: 0 }, team: { questions: [], unread: 0 } },
      { status: 401 },
    )
  }

  const teamOu = ouFromDn(session.user.dn)

  try {
    const [personalRes, teamRes, lastReadRes] = await Promise.all([
      query(PERSONAL_Q, [session.user.dn]),
      teamOu ? query(TEAM_Q, [teamOu]) : Promise.resolve({ rows: [] }),
      teamOu
        ? query(
            'SELECT last_read_at FROM qa_team_inbox_reads WHERE user_dn = $1 AND team_ou = $2',
            [session.user.dn, teamOu],
          )
        : Promise.resolve({ rows: [] }),
    ])

    const personalQuestions = personalRes.rows
    const personalUnread    = personalQuestions.filter((q: any) => !q.notified_at).length

    const lastReadAt: Date | null = lastReadRes.rows[0]?.last_read_at ?? null
    const teamQuestions    = teamRes.rows
    const teamUnread       = teamQuestions.filter(
      (q: any) => !lastReadAt || new Date(q.created_at) > lastReadAt,
    ).length

    return NextResponse.json({
      personal: { questions: personalQuestions, unread: personalUnread },
      team:     { questions: teamQuestions,     unread: teamUnread, teamOu },
    })
  } catch (err) {
    console.error('[qa/inbox GET]', err)
    return NextResponse.json({
      personal: { questions: [], unread: 0 },
      team:     { questions: [], unread: 0, teamOu },
    })
  }
}

/**
 * POST /api/qa/inbox?scope=personal|team
 * Marks the given scope as read.
 */
export async function POST(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scope = new URL(request.url).searchParams.get('scope') ?? 'personal'

  try {
    if (scope === 'team') {
      const teamOu = ouFromDn(session.user.dn)
      if (teamOu) {
        await query(
          `INSERT INTO qa_team_inbox_reads (user_dn, team_ou, last_read_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_dn, team_ou) DO UPDATE SET last_read_at = NOW()`,
          [session.user.dn, teamOu],
        )
      }
    } else {
      await query(
        `UPDATE qa_directed_questions SET notified_at = NOW()
         WHERE target_dn = $1 AND notified_at IS NULL`,
        [session.user.dn],
      )
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[qa/inbox POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
