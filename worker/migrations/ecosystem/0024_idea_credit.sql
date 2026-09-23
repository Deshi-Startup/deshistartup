-- Editors add only names the submitter explicitly approved for public credit.
-- Contact addresses and submission records stay outside the public snapshot.
ALTER TABLE approaches ADD COLUMN suggested_by_json TEXT NOT NULL DEFAULT '[]'
  CHECK (json_valid(suggested_by_json) AND json_type(suggested_by_json) = 'array');
