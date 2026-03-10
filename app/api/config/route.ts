import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    baseDN:   process.env.LDAP_BASE_DN || 'DC=company,DC=com',
    mockMode: process.env.MOCK_MODE === 'true',
    cacheTTL: Number(process.env.CACHE_TTL ?? 300),
  })
}
