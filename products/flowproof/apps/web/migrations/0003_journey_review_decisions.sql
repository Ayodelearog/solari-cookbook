CREATE TABLE IF NOT EXISTS flowproof_journey_review_decisions (
  id uuid PRIMARY KEY,
  journey_id uuid NOT NULL REFERENCES flowproof_journeys(id) ON DELETE CASCADE,
  journey_version integer NOT NULL CHECK (journey_version > 0),
  decision text NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
  notes text NOT NULL,
  reviewed_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, journey_version)
);

CREATE INDEX IF NOT EXISTS flowproof_journey_review_decisions_created_idx
  ON flowproof_journey_review_decisions (created_at DESC);
