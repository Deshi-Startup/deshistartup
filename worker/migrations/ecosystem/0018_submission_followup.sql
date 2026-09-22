-- Private workflow records. None belong in the public ecosystem snapshot.
CREATE TABLE submission_contacts (
  submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  email TEXT NOT NULL
);
CREATE TABLE idea_submission_links (
  submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  approach_id TEXT NOT NULL REFERENCES approaches(id),
  reviewer_hash TEXT NOT NULL,
  linked_at TEXT NOT NULL
);
CREATE TABLE submission_notifications (
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('editorial', 'decision', 'published')),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  lease TEXT,
  sent_at TEXT,
  error_code TEXT,
  PRIMARY KEY (submission_id, kind)
);
CREATE INDEX submission_notifications_due ON submission_notifications(state, available_at);
