import { query } from '@/lib/db'
import type { AuthUser, User } from '@/types'

/**
 * Upsert the authenticated SSO user so they appear in people search.
 * Called from the OAuth callback after a successful login.
 */
export async function upsertSsoUser(user: AuthUser): Promise<void> {
  await query(
    `INSERT INTO sso_users (dn, username, cn, mail, title, department, phone, mobile, office, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (dn) DO UPDATE SET
       username   = EXCLUDED.username,
       cn         = EXCLUDED.cn,
       mail       = EXCLUDED.mail,
       title      = EXCLUDED.title,
       department = EXCLUDED.department,
       phone      = EXCLUDED.phone,
       mobile     = EXCLUDED.mobile,
       office     = EXCLUDED.office,
       updated_at = NOW()`,
    [user.dn, user.username, user.cn, user.mail, user.title, user.department,
     user.phone, user.mobile, user.office],
  )
}

/** Return all SSO users as User objects (AD-specific fields default to empty). */
export async function getSsoUsers(): Promise<User[]> {
  const { rows } = await query(
    'SELECT dn, username, cn, mail, title, department, phone, mobile, office FROM sso_users ORDER BY cn',
  )
  return rows.map((r) => ({
    dn:         r.dn,
    cn:         r.cn,
    username:   r.username,
    mail:       r.mail,
    title:      r.title,
    department: r.department,
    phone:      r.phone,
    mobile:     r.mobile,
    office:     r.office,
    city:       '',
    country:    '',
    company:    '',
    manager:    '',
    photo:      null,
  }))
}
