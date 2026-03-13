-- Migration v4: user settings
-- Run once: psql $DATABASE_URL -f db/schema_v4.sql

CREATE TABLE IF NOT EXISTS user_settings (
  dn                    TEXT PRIMARY KEY,
  email_notifications   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
