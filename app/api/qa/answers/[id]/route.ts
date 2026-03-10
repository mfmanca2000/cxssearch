import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

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
    const { body } = await request.json()
    if (!body?.trim()) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const check = await query('SELECT author_dn FROM qa_answers WHERE id = $1', [id])
    if (check.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (check.rows[0].author_dn !== session.user.dn) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query(
      'UPDATE qa_answers SET body = $1, updated_at = NOW() WHERE id = $2',
      [body.trim(), id],
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const check = await query('SELECT author_dn FROM qa_answers WHERE id = $1', [id])
    if (check.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (check.rows[0].author_dn !== session.user.dn) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM qa_answers WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
