import { NextResponse } from 'next/server'
import { ldapGetUsers } from '@/lib/ldap'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // base may be empty string (dept-tree root = all users) or a dept-code prefix / LDAP DN
  const base = searchParams.get('base') ?? ''

  try {
    const users = await ldapGetUsers(base)
    return NextResponse.json(users)
  } catch (err) {
    console.error('[api/users]', err)
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
