/**
 * GET /api/qa/experts
 *
 * LDAP-first expert directory.
 * Every user is potentially an expert — their AD title + department establish
 * baseline domains, and any user-defined skills (user_skills table) are included.
 * Q&A activity augments the score but is never a gate.
 *
 * Query params:
 *   ?tag=<string>   filter to users whose title, department, or skills match the tag
 *   ?dept=<string>  filter to users in a given department (exact, case-insensitive)
 *   ?q=<string>     free-text search across name + title + department + skills
 */
import { NextResponse } from 'next/server'
import { ldapGetUsers, getNeliSkills } from '@/lib/ldap'
import { query } from '@/lib/db'
import { getAllMockSkills, seedMockSkills } from '@/lib/mockSkillsStore'
import { mockUsers, mockSkills } from '@/lib/mockData'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const BASE_DN = process.env.LDAP_BASE_DN ?? ''

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag  = searchParams.get('tag')?.trim().toLowerCase()
  const dept = searchParams.get('dept')?.trim().toLowerCase()
  const q    = searchParams.get('q')?.trim().toLowerCase()

  try {
    // 1. Load all users from LDAP (in-process cache, usually instant)
    const users = await ldapGetUsers(BASE_DN)

    // 2. Load all user skills
    let skillsMap: Map<string, string[]>
    if (MOCK_MODE) {
      seedMockSkills(mockUsers, mockSkills)
      skillsMap = getAllMockSkills()
    } else {
      skillsMap = getNeliSkills() ?? new Map()
    }

    // 3. Load Q&A stats per user (across all tags) in one query
    const statsResult = MOCK_MODE ? null : await query(`
      SELECT
        a.author_dn,
        COUNT(*)                                     AS answer_count,
        COUNT(*) FILTER (WHERE a.is_accepted = TRUE) AS accepted_count,
        COALESCE(SUM(v.value), 0)                    AS net_votes
      FROM qa_answers a
      LEFT JOIN qa_votes v ON v.target_type = 'answer' AND v.target_id = a.id
      GROUP BY a.author_dn
    `)
    const statsMap = new Map<string, { answer_count: number; accepted_count: number; net_votes: number }>()
    for (const row of (statsResult?.rows ?? [])) {
      statsMap.set(row.author_dn, {
        answer_count:   Number(row.answer_count),
        accepted_count: Number(row.accepted_count),
        net_votes:      Number(row.net_votes),
      })
    }

    // 4. Build expert list — apply filters
    const experts = []
    for (const user of users) {
      const skills  = skillsMap.get(user.dn) ?? []
      const stats   = statsMap.get(user.dn)
      const titleLc = user.title.toLowerCase()
      const deptLc  = user.department.toLowerCase()
      const nameLc  = user.cn.toLowerCase()
      const skillsLc = skills.map((s) => s.toLowerCase())

      // --- Filter: department ---
      if (dept && deptLc !== dept && !deptLc.includes(dept)) continue

      // --- Filter: tag (matches title, dept, or any skill) ---
      if (tag) {
        const titleMatch = titleLc.includes(tag)
        const deptMatch  = deptLc.includes(tag)
        const skillMatch = skillsLc.some((s) => s.includes(tag))
        if (!titleMatch && !deptMatch && !skillMatch) continue
      }

      // --- Filter: free-text (name, title, dept, skills) ---
      if (q) {
        const haystack = [nameLc, titleLc, deptLc, ...skillsLc].join(' ')
        if (!haystack.includes(q)) continue
      }

      // 5. Compute score
      let score = 0
      // AD profile signals
      if (user.title)      score += 10
      if (user.department) score += 5
      score += skills.length * 8   // each self-declared skill = strong signal
      // Q&A signals (bonus, not required)
      if (stats) {
        score += stats.answer_count   * 5
        score += stats.accepted_count * 20
        score += stats.net_votes      * 2
      }

      experts.push({
        dn:             user.dn,
        username:       user.username,
        cn:             user.cn,
        title:          user.title,
        department:     user.department,
        mail:           user.mail,
        phone:          user.phone,
        mobile:         user.mobile,
        office:         user.office,
        photo:          user.photo,
        manager:        user.manager,
        skills,
        score,
        answer_count:   stats?.answer_count   ?? 0,
        accepted_count: stats?.accepted_count ?? 0,
      })
    }

    // Sort by score desc, then name asc
    experts.sort((a, b) => b.score - a.score || a.cn.localeCompare(b.cn))

    return NextResponse.json(experts.slice(0, 100))
  } catch (err) {
    console.error('[qa/experts]', err)
    return NextResponse.json([])
  }
}
