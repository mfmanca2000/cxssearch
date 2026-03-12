import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag      = searchParams.get('tag')
  const status   = searchParams.get('status')
  const search   = searchParams.get('search')?.trim() || null
  const page     = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit    = 20
  const offset   = (page - 1) * limit

  try {
    let sql = `
      SELECT
        q.*,
        COALESCE(SUM(v.value), 0) AS vote_score,
        COUNT(DISTINCT a.id)       AS answer_count
      FROM qa_questions q
      LEFT JOIN qa_votes v   ON v.target_type = 'question' AND v.target_id = q.id
      LEFT JOIN qa_answers a ON a.question_id = q.id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (tag) {
      params.push(tag)
      conditions.push(`$${params.length} = ANY(q.tags)`)
    }
    if (status) {
      params.push(status)
      conditions.push(`q.status = $${params.length}`)
    }
    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(q.title ILIKE $${params.length} OR q.body ILIKE $${params.length})`)
    }

    if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`

    const sort = searchParams.get('sort') ?? 'newest'
    const orderBy = search
      ? `CASE WHEN q.title ILIKE $${params.length} THEN 0 ELSE 1 END, q.created_at DESC`
      : ({ newest: 'q.created_at DESC', votes: 'vote_score DESC, q.created_at DESC', active: 'q.updated_at DESC, q.created_at DESC' }[sort] ?? 'q.created_at DESC')
    sql += ` GROUP BY q.id ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[qa/questions GET]', err)
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, body, tags, org_scope_dn, directed_dns } = await request.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO qa_questions (author_dn, author_cn, author_title, title, body, tags, org_scope_dn)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        session.user.dn,
        session.user.cn,
        session.user.title,
        title.trim(),
        body.trim(),
        tags ?? [],
        org_scope_dn ?? '',
      ],
    )
    const questionId = result.rows[0].id

    // Insert directed-to experts if provided
    if (Array.isArray(directed_dns) && directed_dns.length > 0) {
      for (const dn of directed_dns) {
        await query(
          'INSERT INTO qa_directed_questions (question_id, target_dn) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [questionId, dn],
        )
      }
    }

    return NextResponse.json({ id: questionId }, { status: 201 })
  } catch (err) {
    console.error('[qa/questions POST]', err)
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 })
  }
}
