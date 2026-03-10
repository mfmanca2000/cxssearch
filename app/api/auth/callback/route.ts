import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { handleCallback } from '@/lib/oauth'
import { ldapResolveUser } from '@/lib/ldap'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  const appUrl = new URL(request.url).origin

  if (error) {
    console.error('[oauth/callback] SSO error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${appUrl}?auth_error=${encodeURIComponent(error)}`)
  }

  const session = await getSession()
  const expectedState = session.oauthState

  if (!expectedState) {
    console.error('[oauth/callback] No state in session — possible CSRF or expired session')
    return NextResponse.redirect(`${appUrl}?auth_error=invalid_state`)
  }

  try {
    const user = await handleCallback(new URL(request.url), expectedState)

    // Replace the synthetic uid=<sub> DN with the real directory DN.
    // Match on username (sAMAccountName / account_name) first, then email.
    const resolved = await ldapResolveUser(user.username, user.mail)
    if (resolved) {
      user.dn         = resolved.dn
      user.cn         = resolved.cn
      user.username   = resolved.username
      user.title      = user.title      || resolved.title
      user.department = user.department || resolved.department
      user.phone      = user.phone      || resolved.phone
      user.mobile     = user.mobile     || resolved.mobile
      user.office     = user.office     || resolved.office
    } else {
      console.warn('[oauth/callback] Could not resolve directory DN for user', user.username, user.mail)
    }

    session.oauthState = undefined
    session.user       = user
    session.isLoggedIn = true
    await session.save()

    return NextResponse.redirect(appUrl)
  } catch (err) {
    console.error('[oauth/callback]', err)
    return NextResponse.redirect(`${appUrl}?auth_error=token_exchange_failed`)
  }
}
