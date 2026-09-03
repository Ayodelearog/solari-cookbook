CREATE TABLE IF NOT EXISTS flowproof_runs (
  id uuid PRIMARY KEY,
  owner_key text NOT NULL,
  user_id text NOT NULL,
  org_id text,
  journey_id text NOT NULL,
  journey_version text NOT NULL,
  idempotency_key uuid NOT NULL,
  workflow_run_id text,
  state text NOT NULL CHECK (state IN ('CREATED', 'QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'INCONCLUSIVE')),
  outcome text CHECK (outcome IN ('PASS', 'FAIL', 'INCONCLUSIVE')),
  failure_type text,
  journey_name text NOT NULL,
  expected text NOT NULL,
  observed text,
  summary text,
  runner_version text NOT NULL,
  browser_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_key, idempotency_key)
);

CREATE INDEX IF NOT EXISTS flowproof_runs_owner_created_idx
  ON flowproof_runs (owner_key, created_at DESC);

CREATE TABLE IF NOT EXISTS flowproof_step_results (
  run_id uuid NOT NULL REFERENCES flowproof_runs(id) ON DELETE CASCADE,
  position integer NOT NULL,
  step_id text NOT NULL,
  intent text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed')),
  duration_ms integer NOT NULL CHECK (duration_ms >= 0),
  observed text NOT NULL,
  PRIMARY KEY (run_id, position)
);

CREATE TABLE IF NOT EXISTS flowproof_evidence (
  id uuid PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES flowproof_runs(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('screenshot')),
  blob_url text NOT NULL,
  pathname text NOT NULL,
  content_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes >= 0),
  redacted boolean NOT NULL DEFAULT false,
  retention_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flowproof_evidence_run_idx
  ON flowproof_evidence (run_id);
