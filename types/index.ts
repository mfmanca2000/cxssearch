// ─── AD / People ──────────────────────────────────────────────────────────────

export interface OrgNode {
  dn: string
  name: string
  children: OrgNode[]
}

export interface User {
  dn: string
  cn: string
  username: string
  mail: string
  title: string
  department: string
  phone: string
  mobile: string
  office: string
  city: string
  country: string
  company: string
  manager: string
  photo: string | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  dn: string
  cn: string
  username: string
  mail: string
  title: string
  department: string
  phone: string
  mobile: string
  office: string
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export interface Question {
  id: number
  author_dn: string
  author_cn: string
  author_title: string
  title: string
  body: string
  tags: string[]
  org_scope_dn: string
  status: 'open' | 'answered' | 'closed'
  view_count: number
  vote_score: number
  answer_count: number
  created_at: string
  updated_at: string
}

export interface Answer {
  id: number
  question_id: number
  author_dn: string
  author_cn: string
  author_title: string
  body: string
  is_accepted: boolean
  vote_score: number
  created_at: string
  updated_at: string
}

export interface Expert {
  dn: string
  username: string
  cn: string
  title: string
  department: string
  mail: string
  skills: string[]
  score: number
  answer_count: number
  accepted_count: number
  tag?: string
  phone?: string
  mobile?: string
  office?: string
  photo?: string | null
  manager?: string
}

export interface UserQAProfile {
  questions: Question[]
  answers: Answer[]
  top_tags: string[]
}

export interface TagStat {
  tag: string
  question_count: number
  source?: 'tag' | 'skill'
}
