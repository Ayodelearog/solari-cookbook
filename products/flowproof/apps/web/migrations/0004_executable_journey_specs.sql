CREATE TABLE IF NOT EXISTS flowproof_executable_journey_specs (
  id uuid PRIMARY KEY,
  journey_id uuid NOT NULL REFERENCES flowproof_journeys(id) ON DELETE CASCADE,
  journey_version integer NOT NULL CHECK (journey_version > 0),
  specification jsonb NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, journey_version)
);

CREATE INDEX IF NOT EXISTS flowproof_executable_journey_specs_journey_idx
  ON flowproof_executable_journey_specs (journey_id);
