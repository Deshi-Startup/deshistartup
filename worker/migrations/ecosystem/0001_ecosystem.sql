-- Structured ecosystem records. Pending submissions never mutate published records.
PRAGMA foreign_keys = ON;

CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL,
  places_json TEXT NOT NULL CHECK (json_valid(places_json)),
  sources_json TEXT NOT NULL CHECK (json_valid(sources_json)),
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE problem_text (
  problem_id TEXT NOT NULL REFERENCES problems(id),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'bn')),
  title TEXT NOT NULL, summary TEXT NOT NULL, customer TEXT NOT NULL,
  context TEXT NOT NULL, unknown TEXT NOT NULL,
  PRIMARY KEY (problem_id, locale)
);
CREATE TABLE approaches (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL REFERENCES problems(id),
  kind TEXT NOT NULL CHECK (kind IN ('software', 'service', 'marketplace', 'workflow')),
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX approaches_problem ON approaches(problem_id, position);
CREATE TABLE approach_text (
  approach_id TEXT NOT NULL REFERENCES approaches(id),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'bn')),
  title TEXT NOT NULL, summary TEXT NOT NULL, description TEXT NOT NULL,
  business_model TEXT NOT NULL,
  steps_json TEXT NOT NULL CHECK (json_valid(steps_json)),
  signal TEXT NOT NULL, prototype TEXT NOT NULL,
  PRIMARY KEY (approach_id, locale)
);
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  website TEXT NOT NULL,
  logo_path TEXT,
  roles_json TEXT NOT NULL CHECK (json_valid(roles_json)),
  aliases_json TEXT NOT NULL CHECK (json_valid(aliases_json)),
  sources_json TEXT NOT NULL CHECK (json_valid(sources_json)),
  source_date TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  origin TEXT NOT NULL CHECK (origin IN ('editorial-import', 'reviewed-submission'))
);
CREATE TABLE organization_text (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'bn')),
  name TEXT NOT NULL, description TEXT NOT NULL,
  PRIMARY KEY (organization_id, locale)
);
CREATE INDEX organization_name_lookup ON organization_text(locale, name);
CREATE TABLE organization_references (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  kind TEXT NOT NULL CHECK (kind IN ('case-study', 'startup-50')),
  target TEXT NOT NULL,
  PRIMARY KEY (organization_id, kind, target)
);
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  problem_id TEXT NOT NULL REFERENCES problems(id),
  stage TEXT NOT NULL CHECK (stage IN ('research', 'prototype', 'live')),
  work_en TEXT NOT NULL, work_bn TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  review_scope TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  UNIQUE (organization_id, problem_id)
);
CREATE INDEX connections_problem ON connections(problem_id);
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  decided_at TEXT,
  decision_note TEXT,
  UNIQUE (owner_hash, idempotency_key)
);
CREATE INDEX submission_review_queue ON submissions(status, created_at);
CREATE INDEX submission_owner ON submissions(owner_hash, created_at);
CREATE TABLE review_events (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  reviewer_hash TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (submission_id)
);
-- A failing guard rolls back the whole approval batch, including any preceding writes.
CREATE TABLE mutation_guards (id TEXT PRIMARY KEY, valid INTEGER NOT NULL CHECK (valid = 1));
CREATE TABLE releases (
  id TEXT PRIMARY KEY,
  snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
  digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  published_at TEXT
);
CREATE TABLE publication (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  release_id TEXT NOT NULL REFERENCES releases(id)
);
