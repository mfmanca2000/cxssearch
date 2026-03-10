import type { AuthUser } from '@/types'

// ─── Env ─────────────────────────────────────────────────────────────────────

const env = {
  clientId:         process.env.OAUTH_CLIENT_ID!,
  clientSecret:     process.env.OAUTH_CLIENT_SECRET!,
  authorizationUrl: process.env.OAUTH_AUTHORIZATION_URL!,
  tokenUrl:         process.env.OAUTH_TOKEN_URL!,
  userInfoUrl:      process.env.OAUTH_USERINFO_URL!,
  redirectUri:      process.env.OAUTH_REDIRECT_URI!,
  logoutUrl:        process.env.OAUTH_LOGOUT_URL ?? '',
  // OAuth2 scopes are space-separated; support comma-separated in env too
  scope: (process.env.OAUTH_SCOPE ?? 'openid profile email').replace(/,/g, ' '),
}

// ─── Build authorization URL ──────────────────────────────────────────────────

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     env.clientId,
    redirect_uri:  env.redirectUri,
    scope:         env.scope,
    state,
  })
  return `${env.authorizationUrl}?${params.toString()}`
}

// ─── Handle callback: exchange code + fetch userinfo ─────────────────────────

export async function handleCallback(callbackUrl: URL, expectedState: string): Promise<AuthUser> {
  // 1. Verify state (CSRF protection)
  const returnedState = callbackUrl.searchParams.get('state')
  if (returnedState !== expectedState) {
    throw new Error('OAuth state mismatch')
  }

  const code = callbackUrl.searchParams.get('code')
  if (!code) throw new Error('No code in callback URL')

  // 2. Exchange authorization code for tokens (Basic auth as required by Spring/UAA)
  const creds    = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString('base64')
  const tokenRes = await fetch(env.tokenUrl, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${creds}`,
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: env.redirectUri,
    }).toString(),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`)
  }

  const tokens = await tokenRes.json() as { access_token: string; token_type: string }

  // 3. Fetch user info
  const userInfoRes = await fetch(env.userInfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userInfoRes.ok) {
    const text = await userInfoRes.text()
    throw new Error(`UserInfo failed (${userInfoRes.status}): ${text}`)
  }

  const userinfo = await userInfoRes.json() as Record<string, unknown>
  console.log('[oauth] userinfo claims:', userinfo)

  return mapToAuthUser(userinfo)
}

// ─── Logout URL ───────────────────────────────────────────────────────────────

export function getSsoLogoutUrl(postLogoutRedirectUri: string): string | null {
  if (!env.logoutUrl) return null
  const params = new URLSearchParams({ redirect: postLogoutRedirectUri })
  return `${env.logoutUrl}?${params.toString()}`
}

// ─── Map OIDC claims → AuthUser ───────────────────────────────────────────────

function firstAttr(attrs: unknown, key: string): string {
  if (!attrs || typeof attrs !== 'object') return ''
  const val = (attrs as Record<string, unknown>)[key]
  if (Array.isArray(val)) return String(val[0] ?? '')
  return String(val ?? '')
}

function mapToAuthUser(claims: Record<string, unknown>): AuthUser {
  const sub      = String(claims.sub ?? '')
  const username = String(claims.preferred_username ?? claims.user_name ?? sub)
  const fullName = [claims.given_name, claims.family_name].filter(Boolean).join(' ')
  const cn       = String((claims.name ?? fullName) || username)
  const attrs    = claims.user_attributes

  return {
    dn:         `uid=${sub}`,
    cn,
    username,
    mail:       String(claims.email ?? ''),
    title:      String(claims.title ?? ''),
    department: firstAttr(attrs, 'department') || String(claims.department ?? ''),
    phone:      String(claims.phone_number ?? ''),
    mobile:     firstAttr(attrs, 'mobile_number'),
    office:     firstAttr(attrs, 'office'),
  }
}
