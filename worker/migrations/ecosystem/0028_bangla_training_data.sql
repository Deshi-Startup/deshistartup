-- A bilingual Bangla speech-data service idea. Private submissions and review records stay separate.

-- Publication requires the normal frozen snapshot and deployment process.

PRAGMA foreign_keys = ON;

INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'bangla-training-data-problem',
  'bangla-training-data-problem',
  'technology',
  '["anywhere"]',
  '[{"title":"Bengali-Loop: Bangla speech benchmarks, February 2026","url":"https://arxiv.org/abs/2602.14291","date":"2026-09-28","en":"The researchers used human checks for transcripts and manually labeled speakers in Bangla speech benchmarks.","bn":"বাংলা কথার বেঞ্চমার্ক তৈরির সময় গবেষকেরা মানুষকে দিয়ে অডিওর সাথে লেখা মিলিয়েছেন আর কোন কথা কে বলেছেন তা চিহ্নিত করেছেন।"},{"title":"Clickworker: how labeling quality is checked","url":"https://support-marketplace.clickworker.com/support/solutions/articles/80000714220-how-is-quality-ensured-","date":"2026-09-28","en":"Clickworker describes its worker training, tests, audits and peer review. It is an existing provider to compare with.","bn":"Clickworker কর্মীদের প্রশিক্ষণ, পরীক্ষা আর অন্যদের দিয়ে কাজ যাচাই করানোর কথা বলেছে। নতুন সেবার সাথে এই চালু সেবাদাতার কাজ মিলিয়ে দেখা যায়।"},{"title":"Startup Bangladesh: Hishab portfolio profile","url":"https://www.startupbangladesh.vc/portfolio/hishab/","date":"2026-09-28","en":"Startup Bangladesh lists its 2024 investment in voice-technology company Hishab, an example of commercial work in this field.","bn":"Startup Bangladesh ভয়েস টেকনোলজি কোম্পানি Hishab-এ ২০২৪ সালের বিনিয়োগের কথা জানিয়েছে। এই খাতে ব্যবসা হচ্ছে, তার একটি উদাহরণ এটি।"}]'
);

INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-training-data-problem',
  'en',
  'Voice AI teams need reliable Bangla transcripts',
  'Teams need checked recordings and matching text to train speech tools and measure their mistakes.',
  'Companies building Bangla speech recognition or voice assistants, in Bangladesh or abroad.',
  'To test a speech tool, a team compares the words it produces with a checked transcript of the recording. Regional speech, mixed Bangla-English words and unclear audio need consistent rules and careful review. Bengali-Loop''s research used human transcript checks. Existing data services already do this kind of work; a focused team would need to handle its customers'' audio better or save them review time.',
  'Will AI teams pay for repeat batches at a price that covers fair worker pay, quality checks and corrections?'
);

INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-training-data-problem',
  'bn',
  'ভয়েস এআই টিমের অডিওর সাথে মেলানো নির্ভরযোগ্য বাংলা লেখা দরকার',
  'কথা থেকে লেখা তৈরি করার টুলকে শেখাতে আর তার ভুল মাপতে অডিও ও তার সাথে মেলানো লেখা লাগে।',
  'বাংলাদেশে বা বিদেশে বাংলা কথা থেকে লেখা তৈরি করার টুল বা ভয়েস অ্যাসিস্ট্যান্ট বানাচ্ছে এমন কোম্পানি।',
  'কথা থেকে লেখা বানানোর টুল পরীক্ষা করতে আগে অডিও শুনে সঠিক লেখাটা তৈরি করে নিতে হয়। টুলের লেখার সাথে সেটি মিলিয়ে ভুল ধরা যায়। আঞ্চলিক টান, বাংলা-ইংরেজি মেশানো কথা আর অস্পষ্ট অডিও লেখার সময় একই নিয়ম মানতে হয়। তারপর লেখাটা যাচাই করতে হয়। Bengali-Loop-এর গবেষণাতেও মানুষকে দিয়ে অডিওর সাথে লেখা মেলানো হয়েছে। এ ধরনের সেবা আগে থেকেই আছে। নতুন টিমকে কাস্টমারের অডিও আরও ভালোভাবে সামলাতে হবে, অথবা তাঁদের যাচাইয়ের সময় বাঁচাতে হবে।',
  'কর্মীদের ন্যায্য পারিশ্রমিক, কাজ যাচাই আর ভুল ঠিক করার খরচ মিটিয়ে লাভ থাকে, এমন দামে এআই টিমগুলো কি বারবার কাজ দেবে?'
);

INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'bangla-training-data',
  'bangla-training-data-problem',
  'service',
  '0',
  '2026-09-28',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-training-data',
  'en',
  'Check Bangla speech data for AI teams',
  'Pay trained Bangla speakers to check short recordings and deliver corrected transcripts to companies building voice tools.',
  'Start with one AI team and recordings it has permission to share for this work. Agree on how to write names, numbers and mixed Bangla-English speech. Trained workers listen to short clips and correct the text, marking unclear speech instead of guessing. A second reviewer checks a sample from every batch and reviews flagged clips, keeping any unclear words marked. Use phones where the task works well on a small screen.',
  'Charge the AI team per batch or audio minute. Set worker rates, payment dates and correction rules before work starts. Price in training, fair worker pay, review, rework, secure storage and payment fees.',
  '["Talk to three teams building Bangla voice tools. Ask for examples they are allowed to share and find out how their current data supplier or in-house team handles them.","Agree on a small paid batch with one customer, including quality checks, data access and deletion. Train a small group on sample clips and have a reviewer check their work.","Deliver the batch and record what the customer accepts or sends back. Count all costs and workers'' time, including training and corrections. Ask for a second paid order."]',
  'The customer orders again, the work meets the agreed quality checks, and the price covers fair worker pay and all delivery costs with money left over.',
  'Build a simple phone-friendly screen with an audio player, editable transcript and an ''I can''t hear this clearly'' button. Add a reviewer screen for corrections and a CSV download. Use recordings made for the demo with the speakers'' permission.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-training-data',
  'bn',
  'এআই টিমের জন্য বাংলা অডিও শুনে লেখার ভুল ঠিক করুন',
  'বাংলা ভাষাভাষী প্রশিক্ষিত কর্মীদের পারিশ্রমিক দিয়ে ছোট অডিওর সাথে লেখা মেলান। ঠিক করা লেখাগুলো ভয়েস টুল বানানো কোম্পানির কাছে পৌঁছে দিন।',
  'একটা এআই টিম দিয়ে শুরু করুন। এই কাজের জন্য শেয়ার করার অনুমতি আছে, এমন রেকর্ডিং নিন। নাম, সংখ্যা আর বাংলা-ইংরেজি মেশানো কথা কীভাবে লিখবেন, আগে ঠিক করে নিন। প্রশিক্ষিত কর্মীরা ছোট অডিও শুনে লেখার ভুল ঠিক করবেন। বোঝা না গেলে আন্দাজে না লিখে জায়গাটা চিহ্নিত করবেন। আরেকজন প্রতিটি ব্যাচ থেকে কিছু কাজ যাচাই করবেন। চিহ্নিত অংশগুলোও শুনবেন। এরপরও কোনো শব্দ বোঝা না গেলে সেটি চিহ্নিতই থাকবে। ছোট স্ক্রিনে কাজটা ভালোভাবে করা গেলে ফোন ব্যবহার করুন।',
  'এআই টিমের কাছ থেকে প্রতি ব্যাচ বা অডিওর মিনিট ধরে ফি নিন। কাজ শুরুর আগেই কর্মীদের পারিশ্রমিক, টাকা দেওয়ার তারিখ আর ভুল ঠিক করার নিয়ম জানিয়ে দিন। দাম ঠিক করার সময় প্রশিক্ষণ, ন্যায্য পারিশ্রমিক, যাচাই, কাজ আবার করা, নিরাপদে ডেটা রাখা আর পেমেন্টের খরচ ধরুন।',
  '["বাংলা ভয়েস টুল বানাচ্ছে এমন তিনটি টিমের সাথে কথা বলুন। শেয়ার করার অনুমতি আছে এমন কিছু নমুনা চান। এখন নিজেদের টিম বা বাইরের সেবাদাতা কাজগুলো কীভাবে করছে, জেনে নিন।","একজন কাস্টমারের সাথে ছোট একটা পেইড ব্যাচ ঠিক করুন। কাজের মান কীভাবে যাচাই হবে, কারা ডেটা দেখবেন আর কখন মুছবেন, আগেই মেলান। ছোট একটা দলকে নমুনা দিয়ে কাজ শেখান। আরেকজনকে দিয়ে তাঁদের কাজ যাচাই করান।","কাজ জমা দিয়ে লিখে রাখুন কাস্টমার কোনগুলো নিলেন আর কোনগুলো ফেরত দিলেন। সব খরচ আর কর্মীদের সময় হিসাব করুন। প্রশিক্ষণ আর ভুল ঠিক করার সময়ও ধরুন। এরপর আরেকটি পেইড অর্ডার চান।"]',
  'কাস্টমার আবার কাজ দিচ্ছেন, কাজের মান ঠিক করা শর্তে মিলছে, আর কর্মীদের ন্যায্য পারিশ্রমিকসহ সব খরচ মিটিয়েও লাভ থাকছে।',
  'ফোনে ব্যবহার করার মতো একটা সিম্পল স্ক্রিন বানান। অডিও চালানো যাবে, পাশের লেখা ঠিক করা যাবে, আর ‘পরিষ্কার শুনতে পাচ্ছি না’ বাটন থাকবে। আরেকটি স্ক্রিনে কাজ যাচাই ও ঠিক করা যাবে, শেষে CSV ফাইল নামানো যাবে। ডেমোর জন্য যাঁরা কথা রেকর্ড করবেন, তাঁদের অনুমতি নিন।',
  ''
);
