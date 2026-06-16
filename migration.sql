CREATE TABLE IF NOT EXISTS corsair_integrations (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    dek TEXT NULL
);

CREATE TABLE IF NOT EXISTS corsair_accounts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id TEXT NOT NULL,
    integration_id TEXT NOT NULL REFERENCES corsair_integrations(id),
    config JSONB NOT NULL DEFAULT '{}',
    dek TEXT NULL
);

CREATE TABLE IF NOT EXISTS corsair_entities (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    account_id TEXT NOT NULL REFERENCES corsair_accounts(id),
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    version TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS corsair_events (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    account_id TEXT NOT NULL REFERENCES corsair_accounts(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT
);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS email_embeddings (
  id TEXT PRIMARY KEY,
  email_id TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  sender TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS email_embeddings_idx ON email_embeddings 
  USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS snoozed_emails (
  id TEXT PRIMARY KEY,
  email_id TEXT NOT NULL,
  snooze_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_notes (
  id TEXT PRIMARY KEY,
  email_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  signature TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_embeddings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'FYI';

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_event_type_idx ON activity_log (event_type);
-- Multi-tenant user accounts
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users (tenant_id);

-- Contact intelligence (frequent senders)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  email_count INT NOT NULL DEFAULT 1,
  last_emailed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS contacts_tenant_email_idx ON contacts (tenant_id, email);

-- Compose auto-save (Postgres, debounced)
CREATE TABLE IF NOT EXISTS compose_drafts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  to_addr TEXT,
  cc TEXT,
  bcc TEXT,
  subject TEXT,
  body TEXT,
  gmail_draft_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Snooze + templates: tenant scoping
ALTER TABLE snoozed_emails ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE snoozed_emails ADD COLUMN IF NOT EXISTS thread_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS snoozed_emails_tenant_email_idx ON snoozed_emails (tenant_id, email_id);

ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE INDEX IF NOT EXISTS email_templates_tenant_idx ON email_templates (tenant_id);
