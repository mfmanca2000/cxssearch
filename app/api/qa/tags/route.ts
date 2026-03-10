import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT unnest(tags) AS tag, COUNT(*) AS question_count
       FROM qa_questions
       GROUP BY tag
       ORDER BY question_count DESC
       LIMIT 50`,
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[qa/tags]', err)
    return NextResponse.json([])
  }
}
