import { type SessionOptions, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { AuthUser } from '@/types'

export interface SessionData {
  user?: AuthUser
  isLoggedIn: boolean
  oauthState?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'changeme-at-least-32-chars-long!!',
  cookieName: 'cxssearch_session',
  cookieOptions: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
