import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { getMockSkills, addMockSkill, removeMockSkill, seedMockSkills } from '@/lib/mockSkillsStore'
import { mockUsers, mockSkills } from '@/lib/mockData'
import { getNeliSkills } from '@/lib/ldap'

const MOCK_MODE = process.env.MOCK_MODE === 'true'

// GET /api/profile/skills?dn=<dn>  — fetch skills for any user (public)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dn = searchParams.get('dn')?.trim()
  if (!dn) return NextResponse.json({ error: 'dn required' }, { status: 400 })

  if (MOCK_MODE) {
    seedMockSkills(mockUsers, mockSkills)
    return NextResponse.json(getMockSkills(dn))
  }

  try {
    const result = await query(
      `SELECT skill FROM user_skills WHERE dn = $1 ORDER BY skill`,
      [dn],
    )
    const dbSkills: string[] = result.rows.map((r: any) => r.skill as string)
    const neliSkills: string[] = getNeliSkills()?.get(dn) ?? []
    const merged = [...new Set([...neliSkills, ...dbSkills])].sort()
    return NextResponse.json(merged)
  } catch (err) {
    console.error('[profile/skills GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/profile/skills  body: { skill: string }  — add a skill (own profile only)
export async function POST(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const skill = typeof body?.skill === 'string' ? body.skill.trim() : ''
  if (!skill || skill.length > 100) {
    return NextResponse.json({ error: 'Invalid skill' }, { status: 400 })
  }

  if (MOCK_MODE) {
    addMockSkill(session.user.dn, skill)
    return NextResponse.json({ ok: true })
  }

  try {
    await query(
      `INSERT INTO user_skills (dn, skill) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [session.user.dn, skill],
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile/skills POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/profile/skills  body: { skill: string }  — remove a skill (own profile only)
export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const skill = typeof body?.skill === 'string' ? body.skill.trim() : ''
  if (!skill) return NextResponse.json({ error: 'Invalid skill' }, { status: 400 })

  if (MOCK_MODE) {
    removeMockSkill(session.user.dn, skill)
    return NextResponse.json({ ok: true })
  }

  try {
    await query(
      `DELETE FROM user_skills WHERE dn = $1 AND skill = $2`,
      [session.user.dn, skill],
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile/skills DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
