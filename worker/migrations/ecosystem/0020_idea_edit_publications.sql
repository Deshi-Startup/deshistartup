-- An editor links an accepted idea edit only after its reviewed public release is live.
CREATE TABLE idea_edit_publications (
  submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  approach_id TEXT NOT NULL REFERENCES approaches(id),
  release_id TEXT NOT NULL REFERENCES releases(id),
  reviewer_hash TEXT NOT NULL,
  linked_at TEXT NOT NULL
);
