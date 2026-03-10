import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

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
    const { value } = await request.json()
    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: 'Value must be 1 or -1' }, { status: 400 })
    }

    const a = await query('SELECT author_dn FROM qa_answers WHERE id = $1', [id])
    if (a.rows[0]?.author_dn === session.user.dn) {
      return NextResponse.json({ error: 'Cannot vote on your own answer' }, { status: 400 })
    }

    await query(
      `INSERT INTO qa_votes (voter_dn, target_type, target_id, value)
       VALUES ($1, 'answer', $2, $3)
       ON CONFLICT (voter_dn, target_type, target_id)
       DO UPDATE SET value = EXCLUDED.value`,
      [session.user.dn, id, value],
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
