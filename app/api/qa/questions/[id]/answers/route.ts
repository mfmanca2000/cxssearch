import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const result = await query(
      `SELECT a.*,
              COALESCE(SUM(v.value), 0) AS vote_score
       FROM qa_answers a
       LEFT JOIN qa_votes v ON v.target_type = 'answer' AND v.target_id = a.id
       WHERE a.question_id = $1
       GROUP BY a.id
       ORDER BY a.is_accepted DESC, vote_score DESC, a.created_at ASC`,
      [id],
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const { body } = await request.json()
    if (!body?.trim()) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const result = await query(
      `INSERT INTO qa_answers (question_id, author_dn, author_cn, author_title, body)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, session.user.dn, session.user.cn, session.user.title, body.trim()],
    )
    return NextResponse.json({ id: result.rows[0].id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
