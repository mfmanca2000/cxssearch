/**
 * Server-side push notification helpers.
 * Uses web-push to deliver to all registered endpoints for a user/team.
 */
import webPush from 'web-push'
import { query } from '@/lib/db'
import { ldapGetUsers } from '@/lib/ldap'

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? '',
)

export interface PushPayload {
  title: string
  body: string
  url: string
}

async function sendToSubscription(
  id: number,
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload,
): Promise<void> {
  try {
    await webPush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(payload),
    )
  } catch (err: any) {
    // 410 Gone or 404 Not Found → stale subscription, remove it
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      await query('DELETE FROM push_subscriptions WHERE id = $1', [id]).catch(console.error)
    } else {
      throw err
    }
  }
}

export async function sendPushToUser(userDn: string, payload: PushPayload): Promise<void> {
  const { rows } = await query(
    'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_dn = $1',
    [userDn],
  )
  await Promise.allSettled(
    rows.map((r: any) => sendToSubscription(r.id, r.endpoint, r.p256dh, r.auth, payload)),
  )
}

export async function sendPushToTeam(targetOu: string, payload: PushPayload): Promise<void> {
  const users = await ldapGetUsers(targetOu)
  const dns = users.map((u) => u.dn).filter(Boolean)
  if (!dns.length) return

  const { rows } = await query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_dn = ANY($1)`,
    [dns],
  )
  await Promise.allSettled(
    rows.map((r: any) => sendToSubscription(r.id, r.endpoint, r.p256dh, r.auth, payload)),
  )
}
