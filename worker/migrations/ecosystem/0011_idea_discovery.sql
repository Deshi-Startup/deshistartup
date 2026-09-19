-- Editorial selection is independent of community interest. No votes are seeded.
ALTER TABLE approach_text ADD COLUMN editorial_note TEXT NOT NULL DEFAULT '';
UPDATE approach_text SET editorial_note = 'A clear industrial customer and a first test that starts with a buyer, before building a marketplace.' WHERE approach_id = 'garment-offcuts-approach' AND locale = 'en';
UPDATE approach_text SET editorial_note = 'কারা কিনবেন তা স্পষ্ট। মার্কেটপ্লেস বানানোর আগেই একজন ক্রেতা নিয়ে পরীক্ষা শুরু করা যায়।' WHERE approach_id = 'garment-offcuts-approach' AND locale = 'bn';
UPDATE approach_text SET editorial_note = 'An important food-supply problem with a small, paid pilot using existing cooling facilities.' WHERE approach_id = 'harvest-cooling' AND locale = 'en';
UPDATE approach_text SET editorial_note = 'খাদ্য সরবরাহের গুরুত্বপূর্ণ সমস্যা। আগে থেকে থাকা হিমাগার ব্যবহার করে ছোট পরিসরে সেবার জন্য টাকা দিতে রাজি ক্রেতা খোঁজা যায়।' WHERE approach_id = 'harvest-cooling' AND locale = 'bn';

CREATE TABLE idea_votes (
  approach_id TEXT NOT NULL REFERENCES approaches(id),
  owner_hash TEXT NOT NULL,
  active INTEGER NOT NULL CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  PRIMARY KEY (approach_id, owner_hash)
);
CREATE INDEX idea_votes_owner ON idea_votes(owner_hash) WHERE active = 1;
CREATE INDEX idea_votes_count ON idea_votes(approach_id) WHERE active = 1;
