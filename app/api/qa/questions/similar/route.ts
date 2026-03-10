import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')?.trim()

  if (!title || title.length < 5) {
    return NextResponse.json([])
  }

  try {
    const result = await query(
      `SELECT id, title, status, created_at,
              ts_rank(to_tsvector('english', title || ' ' || body), query) AS rank
       FROM qa_questions,
            plainto_tsquery('english', $1) query
       WHERE to_tsvector('english', title || ' ' || body) @@ query
       ORDER BY rank DESC
       LIMIT 5`,
      [title],
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[qa/questions/similar]', err)
    return NextResponse.json([])
  }
}
