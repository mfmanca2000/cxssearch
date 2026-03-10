import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ldapBindUser } from '@/lib/ldap'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await ldapBindUser(username, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const session = await getSession()
    session.user      = user
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json(user)
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
