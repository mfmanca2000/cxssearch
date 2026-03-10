import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    // Increment view count
    await query('UPDATE qa_questions SET view_count = view_count + 1 WHERE id = $1', [id])

    const result = await query(
      `SELECT q.*,
              COALESCE(SUM(v.value), 0) AS vote_score,
              COUNT(DISTINCT a.id)       AS answer_count
       FROM qa_questions q
       LEFT JOIN qa_votes v   ON v.target_type = 'question' AND v.target_id = q.id
       LEFT JOIN qa_answers a ON a.question_id = q.id
       WHERE q.id = $1
       GROUP BY q.id`,
      [id],
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const { title, body, tags, status } = await request.json()

    // Only allow author to edit
    const check = await query('SELECT author_dn FROM qa_questions WHERE id = $1', [id])
    if (check.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (check.rows[0].author_dn !== session.user.dn) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates: string[] = []
    const vals: any[] = []

    if (title !== undefined) { vals.push(title); updates.push(`title = $${vals.length}`) }
    if (body  !== undefined) { vals.push(body);  updates.push(`body = $${vals.length}`) }
    if (tags  !== undefined) { vals.push(tags);  updates.push(`tags = $${vals.length}`) }
    if (status !== undefined) { vals.push(status); updates.push(`status = $${vals.length}`) }

    if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    vals.push(id)
    updates.push(`updated_at = NOW()`)
    await query(
      `UPDATE qa_questions SET ${updates.join(', ')} WHERE id = $${vals.length}`,
      vals,
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const check = await query('SELECT author_dn FROM qa_questions WHERE id = $1', [id])
    if (check.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (check.rows[0].author_dn !== session.user.dn) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM qa_questions WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
