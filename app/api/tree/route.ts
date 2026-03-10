import { NextResponse } from 'next/server'
import { ldapGetTree } from '@/lib/ldap'

export async function GET() {
  try {
    const tree = await ldapGetTree()
    return NextResponse.json(tree)
  } catch (err) {
    console.error('[api/tree]', err)
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
