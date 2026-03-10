import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pool: Pool }

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

// In dev, preserve pool across hot reloads
if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}

export default pool
