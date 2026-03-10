/**
 * Expert score computation for a given tag.
 * Signals and weights (from plan):
 *   AD title contains tag         → +15
 *   AD department contains tag    → +10
 *   Each answer on tagged Q       → +5
 *   Each accepted answer on tagged Q → +20
 *   Net upvotes on answers to tagged Qs → +2/vote
 *   Each question asked with tag  → -1
 */
import { query } from '@/lib/db'
import { ldapGetUsers } from '@/lib/ldap'

const STALE_MINUTES = 10

export async function computeExpertScores(tag: string): Promise<void> {
  // Check if we need to recompute
  const staleness = await query(
    `SELECT MAX(updated_at) AS last FROM qa_expert_scores WHERE tag = $1`,
    [tag],
  )
  const last = staleness.rows[0]?.last
  if (last) {
    const ageMinutes = (Date.now() - new Date(last).getTime()) / 60000
    if (ageMinutes < STALE_MINUTES) return
  }

  // Pull all users from LDAP/mock (uses cached result)
  const BASE_DN = process.env.LDAP_BASE_DN ?? ''
  const users = await ldapGetUsers(BASE_DN)

  // Pull answer stats per user for this tag
  const statsResult = await query(
    `SELECT
       a.author_dn,
       COUNT(*)                                     AS answer_count,
       COUNT(*) FILTER (WHERE a.is_accepted = TRUE) AS accepted_count,
       COALESCE(SUM(v.value), 0)                    AS net_votes
     FROM qa_answers a
     JOIN qa_questions q ON q.id = a.question_id
     LEFT JOIN qa_votes v ON v.target_type = 'answer' AND v.target_id = a.id
     WHERE $1 = ANY(q.tags)
     GROUP BY a.author_dn`,
    [tag],
  )

  const statsMap = new Map<string, { answer_count: number; accepted_count: number; net_votes: number }>()
  for (const row of statsResult.rows) {
    statsMap.set(row.author_dn, {
      answer_count:   Number(row.answer_count),
      accepted_count: Number(row.accepted_count),
      net_votes:      Number(row.net_votes),
    })
  }

  const questionResult = await query(
    `SELECT author_dn, COUNT(*) AS asked_count
     FROM qa_questions WHERE $1 = ANY(tags)
     GROUP BY author_dn`,
    [tag],
  )
  const askedMap = new Map<string, number>()
  for (const row of questionResult.rows) {
    askedMap.set(row.author_dn, Number(row.asked_count))
  }

  const tagLower = tag.toLowerCase()

  for (const user of users) {
    let score = 0

    if (user.title.toLowerCase().includes(tagLower)) score += 15
    if (user.department.toLowerCase().includes(tagLower)) score += 10

    const stats = statsMap.get(user.dn)
    if (stats) {
      score += stats.answer_count   * 5
      score += stats.accepted_count * 20
      score += stats.net_votes      * 2
    }

    const asked = askedMap.get(user.dn) ?? 0
    score -= asked * 1

    if (score > 0 || stats) {
      await query(
        `INSERT INTO qa_expert_scores (dn, username, tag, score, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (dn, tag) DO UPDATE
         SET score = EXCLUDED.score, updated_at = NOW()`,
        [user.dn, user.username, tag, score],
      )
    }
  }
}
