-- Private provenance lets a contributor distinguish approved from published.
-- This column is deliberately excluded from public snapshots.
ALTER TABLE connections ADD COLUMN submission_id TEXT REFERENCES submissions(id);
CREATE UNIQUE INDEX connection_submission ON connections(submission_id) WHERE submission_id IS NOT NULL;
