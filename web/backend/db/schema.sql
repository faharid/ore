-- ore Web UI schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64),
  action VARCHAR(16) NOT NULL,
  resource TEXT NOT NULL,
  workspace_slug VARCHAR(64),
  status_code INT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_snapshots (
  id SERIAL PRIMARY KEY,
  workspace_slug VARCHAR(64) NOT NULL DEFAULT 'default',
  env_name VARCHAR(64) NOT NULL,
  total_monthly_cost NUMERIC(12, 2) NOT NULL,
  total_yearly_cost NUMERIC(12, 2) NOT NULL,
  breakdown JSONB NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  region VARCHAR(32),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_snapshots_created_at ON cost_snapshots (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_snapshots_workspace_env ON cost_snapshots (workspace_slug, env_name);
