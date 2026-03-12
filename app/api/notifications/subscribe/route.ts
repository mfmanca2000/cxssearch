import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { endpoint, keys } = body as { endpoint: string; keys: { p256dh: string; auth: string } }

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await query(
    `INSERT INTO push_subscriptions (user_dn, endpoint, p256dh, auth, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (endpoint) DO UPDATE SET user_dn = $1, p256dh = $3, auth = $4, updated_at = NOW()`,
    [session.user.dn, endpoint, keys.p256dh, keys.auth],
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { endpoint } = body as { endpoint: string }

  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })

  await query(
    'DELETE FROM push_subscriptions WHERE user_dn = $1 AND endpoint = $2',
    [session.user.dn, endpoint],
  )

  return NextResponse.json({ ok: true })
}
