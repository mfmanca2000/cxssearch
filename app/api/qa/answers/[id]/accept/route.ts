import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { computeExpertScores } from '@/lib/qa/experts'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    // Only question author can accept an answer
    const ans = await query(
      `SELECT a.question_id FROM qa_answers a
       JOIN qa_questions q ON q.id = a.question_id
       WHERE a.id = $1 AND q.author_dn = $2`,
      [id, session.user.dn],
    )
    if (ans.rows.length === 0) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }
    const questionId = ans.rows[0].question_id

    // Unaccept all answers on this question, then accept the chosen one
    await query('UPDATE qa_answers SET is_accepted = FALSE WHERE question_id = $1', [questionId])
    await query('UPDATE qa_answers SET is_accepted = TRUE, updated_at = NOW() WHERE id = $1', [id])
    await query("UPDATE qa_questions SET status = 'answered', updated_at = NOW() WHERE id = $1", [questionId])

    // Async expert score recompute (fire-and-forget)
    const tagsResult = await query('SELECT tags FROM qa_questions WHERE id = $1', [questionId])
    const tags: string[] = tagsResult.rows[0]?.tags ?? []
    for (const tag of tags) {
      computeExpertScores(tag).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
