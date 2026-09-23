-- An accepted idea can finish editorial review without becoming a public record.
-- Keep the explanation private to its submitter and reviewers.
CREATE TABLE idea_editorial_closures (
  submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  note TEXT NOT NULL CHECK (length(trim(note)) BETWEEN 10 AND 1000),
  reviewer_hash TEXT NOT NULL,
  closed_at TEXT NOT NULL
);

-- Preserve queued messages while allowing a final editorial outcome email.
CREATE TABLE submission_notifications_next (
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('editorial', 'decision', 'published', 'closed')),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  lease TEXT,
  sent_at TEXT,
  error_code TEXT,
  PRIMARY KEY (submission_id, kind)
);
INSERT INTO submission_notifications_next
  SELECT submission_id, kind, state, attempts, available_at, lease, sent_at, error_code
  FROM submission_notifications;
DROP TABLE submission_notifications;
ALTER TABLE submission_notifications_next RENAME TO submission_notifications;
CREATE INDEX submission_notifications_due ON submission_notifications(state, available_at);
