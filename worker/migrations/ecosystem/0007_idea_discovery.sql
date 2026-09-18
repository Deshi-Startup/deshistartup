-- Two editorial facts the public catalogue needs and the model could not express:
-- when an idea entered the collection, and which written guides its first test needs.
-- Both are left empty for new records; the snapshot exporter refuses an idea
-- without a date rather than inventing one.
ALTER TABLE approaches ADD COLUMN added_at TEXT;
ALTER TABLE approaches ADD COLUMN guides_json TEXT NOT NULL DEFAULT '[]';

-- Every idea in the first collection was reviewed together on 16 September 2026.
UPDATE approaches SET added_at = '2026-09-16' WHERE added_at IS NULL;

-- Guides are stored as manual slugs, in the order of the steps they serve. The
-- exporter keeps only routes that resolve to a written page in both languages.
UPDATE approaches SET guides_json = '["validation/customer-interviews","payments/cod-reconciliation","validation/pricing-tests"]' WHERE id = 'courier-settlement-approach';
UPDATE approaches SET guides_json = '["validation/demand-without-building","payments/reconciliation","b2b/sme-sales"]' WHERE id = 'courier-settlement-service';
UPDATE approaches SET guides_json = '["validation/field-research-plan","ideas/competitor-map","validation/pricing-tests"]' WHERE id = 'garment-offcuts-approach';
UPDATE approaches SET guides_json = '["validation/outside-dhaka","validation/field-research-plan","metrics/unit-economics"]' WHERE id = 'shared-cold-delivery-approach';
UPDATE approaches SET guides_json = '["validation/customer-interviews","validation/mvp-examples","validation/mvp-experiment-planner"]' WHERE id = 'bangla-order-notes-approach';
UPDATE approaches SET guides_json = '["validation/outside-dhaka","validation/demand-without-building","metrics/unit-economics"]' WHERE id = 'produce-crates-approach';
UPDATE approaches SET guides_json = '["b2b/sme-sales","validation/interview-scripts","validation/trust-signals"]' WHERE id = 'factory-maintenance-approach';
UPDATE approaches SET guides_json = '["validation/mvp-experiment-planner","customers/whatsapp-messenger-sales","validation/customer-interviews"]' WHERE id = 'bangla-order-confirmation';
