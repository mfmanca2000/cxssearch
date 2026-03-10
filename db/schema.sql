-- CSX Search Q&A Schema
-- Run once: psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS qa_questions (
  id           SERIAL PRIMARY KEY,
  author_dn    TEXT NOT NULL,
  author_cn    TEXT NOT NULL,
  author_title TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  org_scope_dn TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'open',
  view_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS qa_questions_tags_idx  ON qa_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS qa_questions_fts_idx   ON qa_questions USING GIN(to_tsvector('english', title || ' ' || body));
CREATE INDEX IF NOT EXISTS qa_questions_author_idx ON qa_questions(author_dn);

CREATE TABLE IF NOT EXISTS qa_answers (
  id          SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  author_dn   TEXT NOT NULL,
  author_cn   TEXT NOT NULL,
  author_title TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS qa_answers_question_idx ON qa_answers(question_id);
CREATE INDEX IF NOT EXISTS qa_answers_author_idx   ON qa_answers(author_dn);

CREATE TABLE IF NOT EXISTS qa_votes (
  id          SERIAL PRIMARY KEY,
  voter_dn    TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   INTEGER NOT NULL,
  value       SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  UNIQUE(voter_dn, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS qa_expert_scores (
  dn           TEXT NOT NULL,
  username     TEXT NOT NULL,
  tag          TEXT NOT NULL,
  score        NUMERIC NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(dn, tag)
);

CREATE TABLE IF NOT EXISTS qa_directed_questions (
  question_id INTEGER NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  target_dn   TEXT NOT NULL,
  notified_at TIMESTAMPTZ,
  PRIMARY KEY(question_id, target_dn)
);

-- User-defined skills attached to their AD profile
CREATE TABLE IF NOT EXISTS user_skills (
  dn         TEXT NOT NULL,
  skill      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (dn, skill)
);
CREATE INDEX IF NOT EXISTS user_skills_dn_idx ON user_skills(dn);

-- SSO users: upserted on every OAuth login so they appear in people search
CREATE TABLE IF NOT EXISTS sso_users (
  dn         TEXT PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  cn         TEXT NOT NULL DEFAULT '',
  mail       TEXT NOT NULL DEFAULT '',
  title      TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  mobile     TEXT NOT NULL DEFAULT '',
  office     TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sso_users_username_idx ON sso_users(username);
