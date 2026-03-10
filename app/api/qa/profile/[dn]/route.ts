import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dn: string }> },
) {
  const { dn: rawDn } = await params
  const dn = decodeURIComponent(rawDn)

  try {
    const [questionsResult, answersResult, tagsResult] = await Promise.all([
      query(
        `SELECT q.id, q.title, q.status, q.tags, q.created_at,
                COALESCE(SUM(v.value), 0) AS vote_score
         FROM qa_questions q
         LEFT JOIN qa_votes v ON v.target_type = 'question' AND v.target_id = q.id
         WHERE q.author_dn = $1
         GROUP BY q.id
         ORDER BY q.created_at DESC
         LIMIT 10`,
        [dn],
      ),
      query(
        `SELECT a.id, a.question_id, a.is_accepted, a.created_at,
                q.title AS question_title,
                COALESCE(SUM(v.value), 0) AS vote_score
         FROM qa_answers a
         JOIN qa_questions q ON q.id = a.question_id
         LEFT JOIN qa_votes v ON v.target_type = 'answer' AND v.target_id = a.id
         WHERE a.author_dn = $1
         GROUP BY a.id, q.title
         ORDER BY a.created_at DESC
         LIMIT 10`,
        [dn],
      ),
      query(
        `SELECT unnest(tags) AS tag, COUNT(*) AS cnt
         FROM qa_questions WHERE author_dn = $1
         GROUP BY tag ORDER BY cnt DESC LIMIT 5`,
        [dn],
      ),
    ])

    return NextResponse.json({
      questions: questionsResult.rows,
      answers:   answersResult.rows,
      top_tags:  tagsResult.rows.map((r: any) => r.tag),
    })
  } catch (err) {
    console.error('[qa/profile]', err)
    return NextResponse.json({ questions: [], answers: [], top_tags: [] })
  }
}
