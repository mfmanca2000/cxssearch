import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM (
         SELECT DISTINCT ON (tag) tag, question_count, source
         FROM (
           SELECT unnest(tags) AS tag, COUNT(*)::int AS question_count, 'tag'::text AS source
           FROM qa_questions GROUP BY tag
           UNION ALL
           SELECT skill AS tag, COUNT(DISTINCT dn)::int AS question_count, 'skill'::text AS source
           FROM user_skills GROUP BY skill
         ) combined
         ORDER BY tag, CASE WHEN source = 'tag' THEN 0 ELSE 1 END
       ) deduped
       ORDER BY question_count DESC
       LIMIT 100`,
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[qa/tags]', err)
    return NextResponse.json([])
  }
}
