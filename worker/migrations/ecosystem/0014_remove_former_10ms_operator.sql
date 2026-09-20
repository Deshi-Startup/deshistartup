-- Maintainer correction: remove this former operator from the company profile.
-- Preserve the dated source record; no departure date or historical claim is invented.
UPDATE person_organizations
SET status = 'retracted', revision = revision + 1
WHERE id = 'affiliation_mirza-salman-hossain-beg'
  AND organization_id = 'org_10-minute-school';

INSERT INTO identity_events (id, person_id, action, actor, created_at, detail_json)
VALUES (
  'remove-former-10ms-operator-20260920',
  'person_1f2d340ab23413b0de9f2d77',
  'review',
  'maintainer:company-profile-correction',
  '2026-09-20',
  '{"affiliationId":"affiliation_mirza-salman-hossain-beg","before":{"status":"confirmed"},"after":{"status":"retracted"},"reason":"Maintainer requested removal from the company profile because the person has left. Historical source retained; departure date not supplied."}'
);
