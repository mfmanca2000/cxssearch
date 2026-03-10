import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getAuthorizationUrl } from '@/lib/oauth'
import { randomBytes } from 'crypto'

export async function GET() {
  const state   = randomBytes(16).toString('hex')
  const session = await getSession()
  session.oauthState = state
  await session.save()

  return NextResponse.redirect(getAuthorizationUrl(state))
}
