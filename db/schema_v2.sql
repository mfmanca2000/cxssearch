-- Migration v2: team-directed questions
-- Run once: psql $DATABASE_URL -f db/schema_v2.sql

-- Questions directed at an entire team (OU)
CREATE TABLE IF NOT EXISTS qa_directed_teams (
  question_id INTEGER NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  target_ou   TEXT NOT NULL,
  PRIMARY KEY (question_id, target_ou)
);
CREATE INDEX IF NOT EXISTS qa_directed_teams_ou_idx ON qa_directed_teams(target_ou);

-- Per-user last-read timestamp for their team inbox
CREATE TABLE IF NOT EXISTS qa_team_inbox_reads (
  user_dn      TEXT NOT NULL,
  team_ou      TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_dn, team_ou)
);
