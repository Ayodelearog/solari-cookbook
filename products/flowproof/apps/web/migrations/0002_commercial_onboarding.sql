CREATE TABLE IF NOT EXISTS flowproof_environments (
  id uuid PRIMARY KEY,
  owner_key text NOT NULL,
  name text NOT NULL,
  base_url text NOT NULL,
  hostname text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT_REVIEW', 'APPROVED', 'REJECTED', 'PAUSED')),
  synthetic_data_confirmed boolean NOT NULL DEFAULT false,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flowproof_environments_owner_created_idx
  ON flowproof_environments (owner_key, created_at DESC);

CREATE TABLE IF NOT EXISTS flowproof_journeys (
  id uuid PRIMARY KEY,
  owner_key text NOT NULL,
  environment_id uuid NOT NULL REFERENCES flowproof_environments(id) ON DELETE CASCADE,
  name text NOT NULL,
  business_purpose text NOT NULL,
  expected_outcome text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT_REVIEW', 'APPROVED', 'REJECTED', 'PAUSED')),
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version > 0),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flowproof_journeys_owner_created_idx
  ON flowproof_journeys (owner_key, created_at DESC);

CREATE TABLE IF NOT EXISTS flowproof_journey_versions (
  id uuid PRIMARY KEY,
  journey_id uuid NOT NULL REFERENCES flowproof_journeys(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  specification jsonb NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, version)
);
