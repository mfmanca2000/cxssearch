import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSsoLogoutUrl } from '@/lib/oauth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  session.destroy()

  const appUrl    = new URL(request.url).origin
  const logoutUrl = getSsoLogoutUrl(appUrl)

  return NextResponse.json(logoutUrl ? { logoutUrl } : { success: true })
}
