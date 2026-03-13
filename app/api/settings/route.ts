import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export interface UserSettings {
  email_notifications: boolean
}

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await query(
    'SELECT email_notifications FROM user_settings WHERE dn = $1',
    [session.user.dn],
  )

  const settings: UserSettings = {
    email_notifications: rows[0]?.email_notifications ?? false,
  }
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (typeof body.email_notifications !== 'boolean') {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await query(
    `INSERT INTO user_settings (dn, email_notifications, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (dn) DO UPDATE SET email_notifications = $2, updated_at = NOW()`,
    [session.user.dn, body.email_notifications],
  )

  return NextResponse.json({ ok: true })
}
