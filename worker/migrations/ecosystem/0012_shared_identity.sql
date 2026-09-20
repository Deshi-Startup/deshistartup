-- Additive identity foundation. Existing company IDs, releases, votes and owners stay intact.
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 180),
  name_bn TEXT,
  aliases_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(aliases_json) AND json_type(aliases_json) = 'array'),
  links_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(links_json) AND json_type(links_json) = 'array'),
  avatar_path TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'withdrawn')),
  confirmed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK (visibility != 'public' OR confirmed_at IS NOT NULL)
);

-- Explicit crosswalks, never fuzzy matches by name, email, or shared domain.
-- A source record resolves to exactly one person OR organization.
CREATE TABLE identity_references (
  namespace TEXT NOT NULL CHECK (namespace IN ('contributor', 'contributor-organization', 'startup-50', 'directory', 'legacy-person', 'legacy-organization')),
  external_id TEXT NOT NULL CHECK (length(external_id) BETWEEN 1 AND 200),
  person_id TEXT REFERENCES people(id),
  organization_id TEXT REFERENCES organizations(id),
  PRIMARY KEY (namespace, external_id),
  CHECK ((person_id IS NOT NULL) != (organization_id IS NOT NULL)),
  CHECK (namespace NOT IN ('contributor', 'legacy-person') OR person_id IS NOT NULL),
  CHECK (namespace NOT IN ('contributor-organization', 'startup-50', 'directory', 'legacy-organization') OR organization_id IS NOT NULL)
);
CREATE INDEX identity_reference_person ON identity_references(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX identity_reference_organization ON identity_references(organization_id) WHERE organization_id IS NOT NULL;
INSERT INTO identity_references (namespace, external_id, organization_id)
  SELECT 'startup-50', target, organization_id FROM organization_references WHERE kind = 'startup-50';
DELETE FROM organization_references WHERE kind = 'startup-50';
CREATE TRIGGER organization_reference_identity_insert
BEFORE INSERT ON organization_references WHEN NEW.kind = 'startup-50'
BEGIN
  SELECT RAISE(ABORT, 'Use identity_references for Startup 50 identity');
END;
CREATE TRIGGER organization_reference_identity_update
BEFORE UPDATE ON organization_references WHEN NEW.kind = 'startup-50'
BEGIN
  SELECT RAISE(ABORT, 'Use identity_references for Startup 50 identity');
END;
-- This exact directory record is already the imported BAN identity. BWIn shares
-- its domain but is not automatically the same organization.
INSERT INTO identity_references (namespace, external_id, organization_id)
  SELECT 'directory', 'investors/bangladesh-angels-network', id
  FROM organizations WHERE id = 'org_bangladesh-angels-network';

CREATE TABLE person_organizations (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL CHECK (role IN ('founder', 'cofounder', 'executive', 'employee', 'partner', 'adviser', 'board-member', 'investor')),
  title_en TEXT,
  title_bn TEXT,
  started_on TEXT,
  ended_on TEXT,
  as_of TEXT NOT NULL,
  sources_json TEXT NOT NULL CHECK (json_valid(sources_json) AND json_type(sources_json) = 'array' AND json_array_length(sources_json) > 0),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'retracted')),
  reviewed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on),
  CHECK (status != 'confirmed' OR reviewed_at IS NOT NULL)
);
CREATE INDEX person_organization_person ON person_organizations(person_id, status);
CREATE INDEX person_organization_organization ON person_organizations(organization_id, status);

-- Direction is subject -> object: parent -> subsidiary, investor -> recipient.
-- Portfolio mentions and programme participation do NOT assert an investment.
CREATE TABLE organization_relationships (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES organizations(id),
  object_id TEXT NOT NULL REFERENCES organizations(id),
  kind TEXT NOT NULL CHECK (kind IN ('parent-of', 'invested-in', 'portfolio-mention', 'accelerated', 'grant-funded', 'sponsored', 'partnered-with')),
  started_on TEXT,
  ended_on TEXT,
  as_of TEXT NOT NULL,
  sources_json TEXT NOT NULL CHECK (json_valid(sources_json) AND json_type(sources_json) = 'array' AND json_array_length(sources_json) > 0),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'retracted')),
  reviewed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK (subject_id != object_id),
  CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on),
  CHECK (status != 'confirmed' OR reviewed_at IS NOT NULL)
);
CREATE INDEX organization_relationship_subject ON organization_relationships(subject_id, status);
CREATE INDEX organization_relationship_object ON organization_relationships(object_id, status);

-- Private account binding only. No login ID is a public person ID or permission.
-- Not populated by imports; a future claim flow must verify account ownership.
CREATE TABLE person_accounts (
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  subject_hash TEXT NOT NULL CHECK (length(subject_hash) BETWEEN 24 AND 64),
  person_id TEXT NOT NULL REFERENCES people(id),
  verified_at TEXT NOT NULL,
  PRIMARY KEY (provider, subject_hash)
);
CREATE INDEX person_account_person ON person_accounts(person_id);

-- Private maintenance history. Never part of the public export.
CREATE TABLE identity_events (
  id TEXT PRIMARY KEY,
  person_id TEXT REFERENCES people(id),
  organization_id TEXT REFERENCES organizations(id),
  action TEXT NOT NULL CHECK (action IN ('import', 'update', 'link', 'review', 'merge', 'withdraw')),
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL,
  detail_json TEXT NOT NULL CHECK (json_valid(detail_json)),
  CHECK ((person_id IS NOT NULL) != (organization_id IS NOT NULL))
);
