-- Source-backed editorial ideas researched on 25 September 2026.
-- Content only. Public release still requires a reviewed snapshot and deployment.
-- Company mentions in research do not create endorsements or claimed relationships.

-- supplier-evidence
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'supplier-evidence-problem', 'supplier-evidence-problem', 'manufacturing', '["anywhere"]',
  '[{"title":"BGMEA–AWARE passport pilot","url":"https://www.bgmea.com.bd/page/BGMEA_Signs_MoU_with_AWARE%E2%84%A2_to_Advance_Digital_Product_Passport_Readiness","date":"2026-05-10","en":"BGMEA announced a supplier-traceability pilot with AWARE.","bn":"BGMEA আর AWARE সাপ্লায়ারের তথ্য ধরে রাখার পরীক্ষামূলক কাজ ঘোষণা করেছে।"},{"title":"European Commission: ESPR","url":"https://environment.ec.europa.eu/strategy/circular-economy/ecodesign-sustainable-products-regulation_en","date":"Checked 2026-09-25","en":"EU product-passport requirements depend on product-specific rules.","bn":"ইইউর পণ্য পাসপোর্টের শর্ত পণ্যভিত্তিক নিয়মের ওপর নির্ভর করে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'supplier-evidence-problem', 'en',
  'Buyer records are scattered across factory teams',
  'Buyer records are scattered across factory teams',
  'Exporting garment factories and buying houses.',
  'Buyers ask factories to show where materials came from. BGMEA''s passport pilots show that this work is already under way. A factory may still need help collecting and checking records for different buyer systems. Start there, rather than creating another passport standard.',
  'Which repeated checks take the most time, and what do the existing buyer portals already handle?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'supplier-evidence-problem', 'bn',
  'বায়ারের দরকারি কাগজ কারখানার বিভিন্ন টিমের কাছে ছড়িয়ে থাকে',
  'বায়ারের দরকারি কাগজ কারখানার বিভিন্ন টিমের কাছে ছড়িয়ে থাকে',
  'পোশাক রপ্তানিকারক কারখানা আর বায়িং হাউস।',
  'কাপড় কোথা থেকে এসেছে, বায়ার তার প্রমাণ চান। BGMEA-র পণ্য পাসপোর্টের পরীক্ষামূলক কাজ দেখায়, এই ব্যবস্থা তৈরি হচ্ছে। তবে ভিন্ন বায়ারের জন্য কাগজ জোগাড় আর যাচাইয়ে কারখানার সাহায্য লাগতে পারে। আরেকটা পাসপোর্ট ব্যবস্থা বানানোর আগে এই কাজটা ধরুন।',
  'কোন চেক বারবার করতে হয় আর বেশি সময় নেয়? বায়ারের চালু পোর্টাল কোন কাজগুলো আগেই করে দেয়?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'supplier-evidence', 'supplier-evidence-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'supplier-evidence', 'en',
  'Get factory records ready for buyers',
  'Help garment factories organise the records buyers need about their fabric and suppliers.',
  'Start with one buyer request and one order. Match invoices, fabric batches and certificates, then show what is missing. Keep the original record beside each answer. Send the finished pack in the format the buyer already uses. Turn repeated checks into software as factories bring you more orders.',
  'Charge to set up a factory''s records, then a monthly fee or a fee per order. Include the time spent checking documents and chasing missing information.',
  '["Ask five factories to show you a recent buyer request and explain what took the most work. Get permission before using any records.","Prepare two paid evidence packs using the buyers'' own checklists. Have a person check every answer against the original documents.","Track time, missing records and repeat orders. Check whether the fee covers the work better than the factory''s existing process."]',
  'Factories pay for the next order, and each pack takes less work without losing accuracy.',
  'Build a simple checklist with sample documents. Show each buyer question, the matching document and any missing information. Let a reviewer approve each answer.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'supplier-evidence', 'bn',
  'বায়ারের জন্য কারখানার কাগজপত্র গুছিয়ে দিন',
  'কাপড় আর সাপ্লায়ার সম্পর্কে বায়ার যে তথ্য চান, কারখানাকে তা গুছিয়ে দিতে সাহায্য করুন।',
  'একটা অর্ডারের কাগজপত্র নিয়ে শুরু করুন। বায়ারের প্রশ্নের সঙ্গে ইনভয়েস, কাপড়ের ব্যাচ আর সার্টিফিকেট মিলিয়ে নিন। কোন তথ্য নেই, সেটাও দেখিয়ে দিন। প্রতিটি উত্তরের পাশে মূল কাগজ রাখুন। বায়ার যে ফরম্যাট চান, সেভাবেই পাঠান। বারবার একই কাজ এলে সেই চেকগুলো সফটওয়্যারে করা যাবে।',
  'শুরুতে কাগজপত্র গুছিয়ে নেওয়ার ফি নিন। পরে মাসিক বা প্রতি অর্ডারে ফি রাখতে পারেন। যাচাই আর বাদ পড়া তথ্য জোগাড়ের সময়ও খরচে ধরুন।',
  '["পাঁচটি কারখানার সাম্প্রতিক বায়ার অনুরোধ দেখুন। কোন কাজে বেশি সময় গেছে, জেনে নিন। রেকর্ড ব্যবহারের আগে অনুমতি নিন।","বায়ারের নিজের তালিকা ধরে ফি নিয়ে দুই অর্ডারের কাগজ গুছিয়ে দিন। একজন মানুষ মূল কাগজের সঙ্গে প্রতিটি উত্তর মিলিয়ে দেখবেন।","সময়, বাদ পড়া তথ্য আর নতুন অর্ডারের হিসাব রাখুন। আগের চেয়ে ভালো সেবা দিয়েও এই ফিতে খরচ উঠছে কি না, দেখুন।"]',
  'কারখানা পরের অর্ডারেও ফি দিচ্ছে। ভুল না বাড়িয়ে কাজ কম সময়ে করা যাচ্ছে।',
  'নমুনা কাগজ দিয়ে চেকলিস্ট বানান। বায়ারের প্রশ্ন, তার প্রমাণ আর বাদ পড়া তথ্য পাশাপাশি দেখান। প্রতিটি উত্তর অনুমোদনের ব্যবস্থা রাখুন।',
  ''
);

-- compressed-air
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'compressed-air-problem', 'compressed-air-problem', 'energy', '["anywhere"]',
  '[{"title":"Atlas Copco Bangladesh: compressor audits","url":"https://www.atlascopco.com/en-bd/compressors/air-compressor-blog/reduce-compressor-operating-costs","date":"2026-02-23","en":"Atlas Copco describes its compressor audit and improvement services.","bn":"Atlas Copco কম্প্রেসর পরীক্ষা আর উন্নতির সেবা বর্ণনা করেছে।"},{"title":"BGMEA: energy supply pressures","url":"https://www.bgmea.com.bd/page/Call_for_Uninterrupted_Energy_Supply_in_RMG_Sector","date":"2026-04-13","en":"BGMEA reports pressure on factories from energy supply problems.","bn":"BGMEA জ্বালানি সরবরাহের সমস্যায় কারখানার চাপের কথা বলেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'compressed-air-problem', 'en',
  'Air leaks can waste factory electricity',
  'Air leaks can waste factory electricity',
  'Factories that use compressed air, starting in one industrial area.',
  'Compressed-air systems use electricity even when some air escapes before reaching a machine. Atlas Copco already offers audits in Bangladesh. A local team could serve a group of factories with repeat checks and repairs, if it can show results at a price they will pay.',
  'Can repeat visits save enough power to cover the full service cost?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'compressed-air-problem', 'bn',
  'বাতাসের লাইনে লিক থাকলে বিদ্যুৎ নষ্ট হতে পারে',
  'বাতাসের লাইনে লিক থাকলে বিদ্যুৎ নষ্ট হতে পারে',
  'চাপযুক্ত বাতাস ব্যবহার করে এমন কারখানা, শুরুতে এক শিল্প এলাকায়।',
  'কম্প্রেসর থেকে কিছু বাতাস মেশিনে পৌঁছানোর আগেই বেরিয়ে গেলেও বিদ্যুৎ খরচ হয়। Atlas Copco বাংলাদেশে এমন পরীক্ষা করে। স্থানীয় একটি টিম কাছাকাছি কয়েকটি কারখানায় নিয়মিত পরীক্ষা আর মেরামত করতে পারে। তবে কাজের ফল আর দাম, দুটোই কারখানার পক্ষে যেতে হবে।',
  'নিয়মিত চেক করালে যতটা বিদ্যুৎ বাঁচবে, তা দিয়ে পুরো সেবার খরচ উঠবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'compressed-air', 'compressed-air-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'compressed-air', 'en',
  'Find and fix factory air leaks',
  'Help factories cut wasted electricity by finding leaks in the compressed-air systems that run their machines.',
  'A compressor uses electricity to supply pressurised air to machines. A leak wastes some of that work. Team up with a qualified technician to find leaks, agree repairs with the factory and measure the result. Offer regular checks so repaired systems stay in good shape.',
  'Charge for the survey and agreed repairs, with parts priced separately. Offer repeat checks under a service contract.',
  '["Ask five maintenance managers how they find and fix air leaks now. Compare the service with their existing supplier.","Run two paid surveys with a qualified technician and suitable instruments. Agree repairs, site safety and how to compare power use at similar production levels.","Check again after repairs. Count technician time, travel, instrument hire and return visits before offering a regular service."]',
  'Factories see a measured improvement and renew at a price that covers the whole job.',
  'Create a survey sheet for leak location, proposed repair, cost and follow-up measurements. Use sample cases to try the workflow before any site work.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'compressed-air', 'bn',
  'কারখানার বাতাসের লাইনে লিক খুঁজে ঠিক করুন',
  'মেশিনে চাপযুক্ত বাতাস পৌঁছানোর লাইনে লিক খুঁজে বিদ্যুতের অপচয় কমাতে সাহায্য করুন।',
  'কম্প্রেসর বিদ্যুৎ খরচ করে মেশিনে চাপযুক্ত বাতাস পাঠায়। পথে লিক থাকলে সেই বাতাস নষ্ট হয়। দক্ষ টেকনিশিয়ানকে নিয়ে লিক খুঁজুন, কারখানার সঙ্গে কাজ ঠিক করে মেরামত করান। পরে মেপে দেখুন কী বদলাল। নিয়মিত চেকের সেবাও দিতে পারেন।',
  'সমস্যা খোঁজা আর ঠিক করার ফি নিন। পার্টসের দাম আলাদা রাখুন। পরে চুক্তি করে নিয়মিত চেকের কাজ নিন।',
  '["পাঁচজন মেইনটেন্যান্স ম্যানেজারের কাছে জেনে নিন, তাঁরা এখন কীভাবে লিক খোঁজেন আর ঠিক করেন। চালু সেবার সঙ্গে নিজের প্রস্তাব মেলান।","উপযুক্ত যন্ত্র আর দক্ষ টেকনিশিয়ান নিয়ে দুই কারখানায় ফি নিয়ে পরীক্ষা করুন। কাজের নিরাপত্তা আর কাছাকাছি উৎপাদনে বিদ্যুৎ খরচ মাপার পদ্ধতি আগে ঠিক করুন।","মেরামতের পর আবার মাপুন। নিয়মিত সেবার দাম ঠিক করার আগে যাতায়াত, যন্ত্র ভাড়া আর আবার যাওয়ার খরচও ধরুন।"]',
  'মেপে উন্নতি দেখা যাচ্ছে, আর পুরো খরচ ওঠে এমন ফিতে কারখানা আবার সেবা নিচ্ছে।',
  'কোথায় লিক, কী মেরামত দরকার, খরচ আর পরের মাপ লিখে রাখার ছক বানান। সাইটে যাওয়ার আগে নমুনা তথ্য দিয়ে দেখুন।',
  ''
);

-- etp-operations
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'etp-operations-problem', 'etp-operations-problem', 'water', '["anywhere"]',
  '[{"title":"BGMEA–World Bank: water reuse","url":"https://www.bgmea.com.bd/page/BGMEA_and_World_Bank_Collaborate_on_National_Water_Reuse_Strategy_to_Cut_RMG_Sector%E2%80%99s_Blue_Water_Footprint_by_50_percent_by_2030","date":"2025-09-25","en":"BGMEA and the World Bank discuss plant improvements and water reuse.","bn":"BGMEA আর বিশ্বব্যাংক প্ল্যান্টের উন্নতি ও পানি আবার ব্যবহার নিয়ে আলোচনা করেছে।"},{"title":"Water Technology BD: ETP services","url":"https://www.wtbl.com.bd/services/etp","date":"Checked 2026-09-25","en":"A local provider already offers treatment-plant operation and maintenance.","bn":"স্থানীয় একটি কোম্পানি আগেই শোধন প্ল্যান্ট চালানো আর দেখভালের সেবা দেয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'etp-operations-problem', 'en',
  'A wastewater plant needs care after installation',
  'A wastewater plant needs care after installation',
  'Factories that already have a wastewater treatment plant.',
  'BGMEA and the World Bank have discussed improving existing treatment plants and reusing water. Local firms already offer plant maintenance. The possible gap is reliable day-to-day support for factories whose operators need help.',
  'What keeps going wrong at a plant, and will the owner pay for ongoing support?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'etp-operations-problem', 'bn',
  'বর্জ্যপানি শোধনের প্ল্যান্ট বসানোর পরও দেখভাল লাগে',
  'বর্জ্যপানি শোধনের প্ল্যান্ট বসানোর পরও দেখভাল লাগে',
  'যেসব কারখানায় বর্জ্যপানি শোধনের প্ল্যান্ট আছে।',
  'চালু প্ল্যান্টের উন্নতি আর পানি আবার ব্যবহার নিয়ে BGMEA ও বিশ্বব্যাংক আলোচনা করেছে। স্থানীয় কোম্পানিও প্ল্যান্ট দেখভালের সেবা দেয়। যেখানে অপারেটরের বাড়তি সাহায্য দরকার, সেখানে নিয়মিত সাপোর্টের সুযোগ থাকতে পারে।',
  'কোন সমস্যা বারবার হয়? নিয়মিত সাহায্য পেতে মালিক কি ফি দেবেন?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'etp-operations', 'etp-operations-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'etp-operations', 'en',
  'Keep factory wastewater plants working',
  'Help dyeing and finishing factories keep their wastewater treatment plants running properly.',
  'A treatment plant needs regular care after it is installed. Work with an experienced wastewater engineer to review one plant, find recurring faults and support its operator. Arrange suitable lab tests to check the treated water. Build a monthly service around maintenance, reliable records and timely repairs.',
  'Charge for the first review, then a monthly support fee. Agree which tests, callouts and parts the fee includes.',
  '["Review recent plant records with three factories and a wastewater engineer. Find out which problems keep coming back and who approves the spending.","Run a paid trial at one plant. Agree the work, the operator''s responsibilities and the water-quality results to check with a suitable lab.","Track results, downtime and all service costs. Ask for a renewal once the factory can see what changed."]',
  'The plant meets the agreed technical results and the factory renews at a sustainable fee.',
  'Make an operating log for readings, faults, maintenance and lab reports. Use sample records and have a wastewater engineer review it before use.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'etp-operations', 'bn',
  'কারখানার বর্জ্যপানি শোধনের প্ল্যান্ট সচল রাখুন',
  'কাপড়ে রং আর ফিনিশিং করে এমন কারখানাকে বর্জ্যপানি শোধনের প্ল্যান্ট ঠিকমতো চালাতে সাহায্য করুন।',
  'প্ল্যান্ট বসালেই কাজ শেষ হয় না, নিয়মিত দেখভাল লাগে। অভিজ্ঞ বর্জ্যপানি ইঞ্জিনিয়ারকে নিয়ে একটি প্ল্যান্টের অবস্থা দেখুন। বারবার কী সমস্যা হচ্ছে, তা বের করে অপারেটরকে সাহায্য করুন। উপযুক্ত ল্যাবে শোধিত পানি পরীক্ষা করান। দেখভাল, রেকর্ড রাখা আর সময়মতো মেরামত মিলিয়ে মাসিক সেবা দিন।',
  'প্রথমবার অবস্থা দেখার ফি নিন, পরে মাসিক সাপোর্ট ফি। এর মধ্যে কোন পরীক্ষা, জরুরি ভিজিট আর পার্টস থাকবে, আগেই ঠিক করুন।',
  '["ইঞ্জিনিয়ারকে নিয়ে তিনটি কারখানার পুরোনো রেকর্ড দেখুন। কোন সমস্যা ঘুরে আসে আর খরচের সিদ্ধান্ত কে নেন, জেনে নিন।","এক প্ল্যান্টে ফি নিয়ে কাজ শুরু করুন। কাজের সীমা, অপারেটরের দায়িত্ব আর ল্যাবে পানির কোন ফল চেক করবেন, ঠিক করুন।","ফল, প্ল্যান্ট বন্ধ থাকার সময় আর সব খরচ লিখে রাখুন। কী বদলেছে, কারখানা দেখতে পেলে পরের মাসের চুক্তি চান।"]',
  'প্ল্যান্টে ঠিক করা মানের ফল পাওয়া যাচ্ছে, আর খরচ ওঠে এমন ফিতে কারখানা চুক্তি বাড়াচ্ছে।',
  'রিডিং, সমস্যা, মেরামত আর ল্যাব রিপোর্টের খাতা বানান। নমুনা তথ্য বসিয়ে ইঞ্জিনিয়ারকে দেখিয়ে নিন।',
  ''
);

-- verified-spares
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'verified-spares-problem', 'verified-spares-problem', 'manufacturing', '["anywhere"]',
  '[{"title":"Export Bangladesh: light engineering gaps","url":"https://exportbangladesh.gov.bd/insights/engineering-bangladesh-potential","date":"Checked 2026-09-25","en":"Sector analysis describes local capability and quality gaps.","bn":"খাতের বিশ্লেষণে স্থানীয় সক্ষমতা আর মানের ঘাটতি আছে।"},{"title":"BUET MME: industrial testing","url":"https://mme.buet.ac.bd/industry-service/","date":"Checked 2026-09-25","en":"BUET lists industrial materials testing. Check the scope for each job.","bn":"BUET শিল্পের উপকরণ পরীক্ষা করে। প্রতিটি কাজের জন্য কোন পরীক্ষা হয়, জেনে নিন।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'verified-spares-problem', 'en',
  'Locally made machine parts need reliable quality',
  'Locally made machine parts need reliable quality',
  'Factory maintenance and purchasing teams that reorder machine parts.',
  'Bangladesh has workshops that make industrial parts. Export Bangladesh identifies quality and skills gaps, while BUET offers materials testing. A business could connect these services around repeat orders with clear buyer-approved specifications.',
  'Can a workshop repeat the required quality at a price that covers inspection and rework?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'verified-spares-problem', 'bn',
  'স্থানীয় মেশিন পার্টসের মান বারবার ঠিক রাখা দরকার',
  'স্থানীয় মেশিন পার্টসের মান বারবার ঠিক রাখা দরকার',
  'যেসব কারখানার ক্রয় আর মেইনটেন্যান্স টিম বারবার পার্টস কেনে।',
  'বাংলাদেশে শিল্পের পার্টস বানানোর ওয়ার্কশপ আছে। Export Bangladesh মান আর দক্ষতার ঘাটতির কথা বলেছে, আর BUET উপকরণ পরীক্ষার সেবা দেয়। বায়ারের অনুমোদিত মাপ ধরে এই কাজগুলো একসঙ্গে করে দেওয়ার ব্যবসা হতে পারে।',
  'পরীক্ষা আর ভুল ঠিক করার খরচ ধরেও ওয়ার্কশপ কি বারবার একই মানে পার্টস বানাতে পারবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'verified-spares', 'verified-spares-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'verified-spares', 'en',
  'Make reliable spare parts for factories',
  'Get repeat machine parts made by local workshops, then check them against the buyer''s requirements.',
  'Start with one type of part that is not safety-critical, such as a simple guide or bracket. Agree the drawing, material and measurements with the buyer. Hire a suitable local workshop, arrange inspection and deliver the part with its check record. Keep approved specifications so repeat orders are easier to make.',
  'Quote a price for the part or batch. Include production, inspection, delivery and possible rework. Agree payment milestones before production.',
  '["Ask three factories about parts they buy repeatedly and recent supplier problems. Choose one part with clear requirements.","Make a paid sample through a qualified workshop. Use drawings the buyer has the right to share, and get approval before the part is used.","Compare delivery time, rejected parts and total cost with the usual supplier. See whether the buyer places another order."]',
  'Buyers reorder, parts pass inspection and the margin covers rework and payment delays.',
  'Create an order sheet with the approved drawing, material, measurements, workshop quote and inspection result. Start with sample data.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'verified-spares', 'bn',
  'কারখানার জন্য ভরসাযোগ্য পার্টস বানিয়ে দিন',
  'স্থানীয় ওয়ার্কশপে মেশিনের পার্টস বানিয়ে বায়ারের মাপ আর মানের সঙ্গে মিলিয়ে দিন।',
  'সহজ গাইড বা ব্র্যাকেটের মতো একটি পার্টস বাছুন, যেটি নষ্ট হলে বড় নিরাপত্তার ঝুঁকি নেই। বায়ারের সঙ্গে ড্রয়িং, উপকরণ আর মাপ ঠিক করুন। উপযুক্ত ওয়ার্কশপে বানিয়ে পরীক্ষা করান, তারপর পরীক্ষার রেকর্ডসহ পৌঁছে দিন। অনুমোদিত মাপ রেখে দিলে পরের অর্ডার সহজ হবে।',
  'পার্টস বা ব্যাচ ধরে দাম বলুন। বানানো, পরীক্ষা, পৌঁছানো আর ভুল হলে আবার করার খরচ ধরুন। কাজের আগে কখন কত টাকা পাবেন, ঠিক করে নিন।',
  '["তিনটি কারখানায় জেনে নিন, কোন পার্টস বারবার লাগে আর সাপ্লায়ার নিয়ে কী সমস্যা হয়েছে। স্পষ্ট মাপ আছে এমন একটি পার্টস বাছুন।","ফি নিয়ে নমুনা বানান। বায়ারের শেয়ার করার অধিকার আছে এমন ড্রয়িং নিন। ব্যবহারের আগে বায়ারের অনুমোদন নিন।","আগের সাপ্লায়ারের তুলনায় সময়, বাতিল পার্টস আর মোট খরচ দেখুন। বায়ার আবার অর্ডার দেন কি না, খেয়াল করুন।"]',
  'বায়ার আবার অর্ডার দিচ্ছেন, পার্টস পরীক্ষায় পাস করছে। ভুল ঠিক করা আর পেমেন্টের দেরি ধরেও লাভ থাকছে।',
  'ড্রয়িং, উপকরণ, মাপ, ওয়ার্কশপের দাম আর পরীক্ষার ফল রাখার অর্ডারশিট বানান। নমুনা তথ্য ব্যবহার করুন।',
  ''
);

-- food-sample-runs
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'food-sample-runs-problem', 'food-sample-runs-problem', 'agriculture', '["anywhere"]',
  '[{"title":"BFSA laboratory repository","url":"https://labrepository.bfsa.gov.bd/","date":"Checked 2026-09-25","en":"BFSA lists labs and test options. Buyer acceptance still needs checking.","bn":"BFSA ল্যাব আর পরীক্ষার তালিকা দেয়। বায়ার ফল গ্রহণ করবেন কি না, আলাদা করে দেখুন।"},{"title":"SGS Bangladesh: food sampling","url":"https://www.sgs.com/en-bd/services/food-sampling","date":"Checked 2026-09-25","en":"SGS already offers food sampling in Bangladesh.","bn":"SGS বাংলাদেশে আগেই খাবারের নমুনা সংগ্রহের সেবা দেয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'food-sample-runs-problem', 'en',
  'Food testing depends on getting suitable samples to a lab',
  'Food testing depends on getting suitable samples to a lab',
  'Food processors and exporters that need regular product tests.',
  'BFSA already lists laboratories and test options. SGS also offers sampling. A new service would need a specific collection route or customer group that these options do not serve well. The job is careful handling and coordination, not issuing its own food-safety certificate.',
  'Will enough nearby customers pay for repeat collections, and will their buyers accept the chosen tests?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'food-sample-runs-problem', 'bn',
  'খাবারের সঠিক পরীক্ষার জন্য নমুনাও ঠিকভাবে ল্যাবে নিতে হয়',
  'খাবারের সঠিক পরীক্ষার জন্য নমুনাও ঠিকভাবে ল্যাবে নিতে হয়',
  'নিয়মিত পণ্য পরীক্ষা করান এমন খাবার প্রস্তুতকারী আর রপ্তানিকারক।',
  'BFSA ল্যাব আর পরীক্ষার তালিকা দেয়। SGS-ও নমুনা সংগ্রহ করে। তাই কোন এলাকা বা কাস্টমার এই সেবা ভালোভাবে পান না, সেটা খুঁজতে হবে। কাজটা নমুনা সামলানো আর পরীক্ষার ব্যবস্থা করা, নিজের নামে খাদ্যনিরাপত্তার সনদ দেওয়া নয়।',
  'কাছাকাছি যথেষ্ট কাস্টমার কি নিয়মিত ফি দেবেন? তাঁদের বায়ার কি এই ল্যাবের পরীক্ষা মেনে নেবেন?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'food-sample-runs', 'food-sample-runs-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'food-sample-runs', 'en',
  'Get food samples to the right lab',
  'Collect samples from food businesses, arrange the required tests and return the original lab reports.',
  'Start with one product and one local collection route. Confirm what tests the buyer needs, then work with a suitable lab on sampling, packing and transport. Track every handover and return the lab''s report unchanged. Reliable repeat routes can grow without building a laboratory.',
  'Charge for collection and coordination, with lab fees shown separately. Combine nearby paying customers on a scheduled route.',
  '["Ask five nearby processors about recent tests, sample problems and collection costs. Check what labs already offer.","Agree written handling instructions with a suitable lab. Run a paid collection route and check that the buyer accepts the test and report format.","Track rejected samples, turnaround and the full trip cost. Repeat only when enough customers pay to cover the route."]',
  'Samples arrive in the right condition, reports meet buyer requirements and customers book again.',
  'Create a sample tracker for the customer, product, requested test, collection time, handovers and lab report. Try it with sample records.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'food-sample-runs', 'bn',
  'খাবারের নমুনা ঠিক ল্যাবে পৌঁছে দিন',
  'খাদ্য ব্যবসা থেকে নমুনা নিয়ে পরীক্ষা করান, তারপর ল্যাবের মূল রিপোর্ট ফিরিয়ে দিন।',
  'এক পণ্য আর কাছাকাছি কয়েকটি ব্যবসা নিয়ে শুরু করুন। বায়ার কোন পরীক্ষা চান, আগে জেনে নিন। উপযুক্ত ল্যাবের সঙ্গে নমুনা নেওয়া, প্যাকিং আর পরিবহনের নিয়ম ঠিক করুন। কার কাছে কখন নমুনা গেল, লিখে রাখুন। ল্যাবের রিপোর্ট বদল না করে ফেরত দিন। নিজের ল্যাব না বানিয়েও সংগ্রহের এই সেবা বাড়ানো যায়।',
  'নমুনা সংগ্রহ আর কাজ গুছিয়ে দেওয়ার ফি নিন। ল্যাবের ফি আলাদা দেখান। নির্দিষ্ট দিনে কাছাকাছি কাস্টমারের নমুনা একসঙ্গে নিন।',
  '["কাছের পাঁচটি ব্যবসার সাম্প্রতিক পরীক্ষা, নমুনার সমস্যা আর সংগ্রহের খরচ জানুন। ল্যাবের চালু সেবাও দেখুন।","ল্যাবের সঙ্গে নমুনা সামলানোর লিখিত নিয়ম ঠিক করুন। ফি নিয়ে একবার সংগ্রহ করুন। পরীক্ষা আর রিপোর্ট বায়ার গ্রহণ করেন কি না, দেখে নিন।","বাতিল নমুনা, সময় আর পুরো যাতায়াতের খরচ লিখুন। যথেষ্ট কাস্টমারের ফিতে খরচ উঠলে আবার একই রুটে যান।"]',
  'নমুনা ঠিক অবস্থায় পৌঁছাচ্ছে, রিপোর্ট বায়ারের চাহিদা মেটাচ্ছে আর কাস্টমার আবার বুক করছেন।',
  'কাস্টমার, পণ্য, পরীক্ষা, সংগ্রহের সময়, হস্তান্তর আর রিপোর্ট রাখার ছক বানান। নমুনা তথ্য দিয়ে দেখে নিন।',
  ''
);

-- export-document-check
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'export-document-check-problem', 'export-document-check-problem', 'logistics', '["anywhere"]',
  '[{"title":"NBR: Single Window notice","url":"https://nbr.gov.bd/uploads/public-notice/%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%B8_%E0%A6%B0%E0%A6%BF%E0%A6%B2%E0%A6%BF%E0%A6%9C-NSW_30062025.pdf","date":"2025-06-30","en":"NBR’s June 2025 notice covers electronic permit and certificate submissions.","bn":"NBR-এর জুন ২০২৫-এর নোটিশে অনলাইনে অনুমতি আর সনদের আবেদন আছে।"},{"title":"Traydstream–Deutsche Bank partnership","url":"https://traydstream.com/news/traydstream-and-deutsche-bank-extend-strategic-partnership-to-advance-intelligent-trade-finance","date":"2025-10-03","en":"An existing trade-document software provider describes its bank partnership.","bn":"চালু ট্রেড-ডকুমেন্ট সফটওয়্যার কোম্পানি ব্যাংকের সঙ্গে কাজের কথা বলেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'export-document-check-problem', 'en',
  'Small document errors can create extra export work',
  'Small document errors can create extra export work',
  'Export teams and freight forwarders handling repeat shipments.',
  'NBR has moved more certificates and permits through the Bangladesh Single Window. Export teams still have to prepare consistent documents. Trade-checking software already exists, so a local product needs a clear advantage for a particular shipment workflow.',
  'Which errors cost customers time, and can software catch them without adding more review work?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'export-document-check-problem', 'bn',
  'কাগজের ছোট ভুলেও রপ্তানির কাজ বাড়তে পারে',
  'কাগজের ছোট ভুলেও রপ্তানির কাজ বাড়তে পারে',
  'নিয়মিত চালান সামলান এমন রপ্তানি টিম আর ফ্রেইট ফরওয়ার্ডার।',
  'NBR আরও সনদ আর অনুমতির আবেদন বাংলাদেশ সিঙ্গেল উইন্ডোতে নিয়েছে। তবে কাগজের তথ্য ঠিক রাখার কাজ রপ্তানি টিমকেই করতে হয়। এমন চেকের সফটওয়্যার আগেও আছে। নির্দিষ্ট একটি কাজে ভালো সুবিধা দিতে পারলেই নতুন পণ্যের সুযোগ।',
  'কোন ভুলে কাস্টমারের সময় নষ্ট হয়? সফটওয়্যার তা ধরতে গিয়ে চেকের কাজ আরও বাড়িয়ে ফেলবে না তো?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'export-document-check', 'export-document-check-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'export-document-check', 'en',
  'Catch mistakes in export paperwork',
  'Check shipment documents for mismatched names, quantities and other details before they are submitted.',
  'Choose one export product and a familiar set of documents. Compare invoices, packing lists and shipping records. Show each mismatch beside the original pages so the export team can correct it. Start with a trade-document specialist, then use software for repeated checks. The customer keeps control of filing.',
  'Charge per shipment or for a monthly volume. Include reviewer time, follow-up checks and secure document handling.',
  '["Ask three export teams about document mistakes that caused extra work. With permission, collect redacted past examples.","Have a trade-document specialist check 20 past document sets. Compare a prototype''s findings with that review, including missed errors and false alarms.","Run a paid trial on new shipments with human sign-off. Measure review time, corrections and repeat use before automating more."]',
  'Teams keep paying because the checks catch useful errors and reduce the time spent reviewing.',
  'Use sample invoices and packing lists to compare names, quantities and dates. Show the source page for each finding and let a reviewer decide what needs fixing.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'export-document-check', 'bn',
  'রপ্তানির কাগজপত্রের ভুল আগে ধরুন',
  'জমা দেওয়ার আগে চালানের কাগজে নাম, পরিমাণ আর অন্য তথ্যের গরমিল খুঁজে দিন।',
  'এক রপ্তানি পণ্য আর পরিচিত কয়েক ধরনের কাগজ নিয়ে শুরু করুন। ইনভয়েস, প্যাকিং লিস্ট আর শিপিং রেকর্ড মিলিয়ে দেখুন। মূল পাতার পাশে গরমিল দেখালে রপ্তানি টিম তা ঠিক করতে পারবে। শুরুতে এই কাজে অভিজ্ঞ কাউকে দিয়ে চেক করান। পরে একই চেকগুলো সফটওয়্যারে আনুন। কাগজ জমা দেওয়ার নিয়ন্ত্রণ কাস্টমারের কাছেই থাকবে।',
  'প্রতি চালানে বা মাসে নির্দিষ্টসংখ্যক চালান চেকের ফি নিন। রিভিউ, আবার পরীক্ষা আর কাগজ নিরাপদে রাখার খরচ ধরুন।',
  '["তিনটি রপ্তানি টিমের কাগজের ভুলে কাজ বেড়েছে, এমন ঘটনা জানুন। অনুমতি নিয়ে পুরোনো উদাহরণ নিন, গোপন তথ্য সরিয়ে ফেলুন।","অভিজ্ঞ কাউকে দিয়ে ২০টি পুরোনো চালানের কাগজ চেক করান। প্রোটোটাইপের সঙ্গে মেলান। কোন ভুল বাদ পড়ছে আর ঠিক তথ্যকেও ভুল বলছে কি না, দেখুন।","নতুন চালানে ফি নিয়ে পরীক্ষা করুন। শেষ সিদ্ধান্ত মানুষ দেবেন। আরও কাজ সফটওয়্যারে আনার আগে সময়, সংশোধন আর আবার কাজ আসছে কি না, দেখুন।"]',
  'কাজে লাগে এমন ভুল ধরা পড়ছে, চেকের সময় কমছে। তাই কাস্টমার আবার ফি দিচ্ছেন।',
  'নমুনা ইনভয়েস আর প্যাকিং লিস্টে নাম, পরিমাণ আর তারিখ মেলান। পাশে মূল পাতা দেখান। কোনটা ঠিক করতে হবে, রিভিউয়ার বেছে নেবেন।',
  ''
);

-- aquaculture-diagnostics
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'aquaculture-diagnostics-problem', 'aquaculture-diagnostics-problem', 'agriculture', '["anywhere"]',
  '[{"title":"WorldFish: One Health Bangladesh","url":"https://digitalarchive.worldfishcenter.org/items/f061d3bc-ed3a-48a2-a52f-f1ee268a14f6","date":"2025-02-26","en":"WorldFish research covers disease management and antibiotic use in Bangladesh.","bn":"WorldFish-এর গবেষণায় বাংলাদেশে মাছের রোগ আর অ্যান্টিবায়োটিক ব্যবহার আছে।"},{"title":"WorldFish: aquatic disease lab","url":"https://worldfishcenter.org/blog/worldfish-opens-bangladeshs-first-aquatic-animal-disease-diagnostic-lab","date":"2021-03-18","en":"A 2021 lab announcement. Confirm current tests and availability before use.","bn":"২০২১ সালে ল্যাব চালুর খবর। এখন কী পরীক্ষা হয়, ব্যবহারের আগে জেনে নিন।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'aquaculture-diagnostics-problem', 'en',
  'Farmers need useful evidence before treating sick fish',
  'Farmers need useful evidence before treating sick fish',
  'Hatcheries, larger farms or farm groups able to pay for tests',
  'WorldFish has studied disease management and antibiotic use in Bangladesh and has previously set up a diagnostic lab. Current lab capacity must be confirmed. The opportunity is a reliable link between farms, tests and qualified advice.',
  'Who pays for the test, and can results reach the farm before the decision is too late?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'aquaculture-diagnostics-problem', 'bn',
  'অসুস্থ মাছের চিকিৎসার আগে পরীক্ষার ফল দরকার',
  'অসুস্থ মাছের চিকিৎসার আগে পরীক্ষার ফল দরকার',
  'ফি দিয়ে পরীক্ষা করাতে পারে এমন হ্যাচারি, বড় খামার আর খামারগুচ্ছ।',
  'বাংলাদেশে মাছের রোগ আর অ্যান্টিবায়োটিক ব্যবহার নিয়ে WorldFish কাজ করেছে। আগেও রোগ পরীক্ষার ল্যাব করেছে তারা। তবে এখন কোন পরীক্ষা করা যায়, তা জেনে নিতে হবে। সুযোগটা খামার, পরীক্ষা আর দক্ষ পরামর্শদাতাকে ঠিকমতো যুক্ত করার কাজে।',
  'ফি কে দেবেন? সিদ্ধান্ত নেওয়ার সময় পার হওয়ার আগেই রিপোর্ট পৌঁছাবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'aquaculture-diagnostics', 'aquaculture-diagnostics-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'aquaculture-diagnostics', 'en',
  'Get fish-farm samples to a disease-testing lab',
  'Help hatcheries and farms get useful test results before choosing a treatment.',
  'Work with an aquatic-health specialist and a lab that can run the required tests. Collect samples from one farm cluster using the lab’s instructions. Return the original result with an explanation from the specialist. Start with hatcheries or farm groups that can share a collection route.',
  'Charge for sample collection and coordination. Show lab fees separately. Offer repeat testing through hatchery contracts.',
  '["Confirm the lab’s current tests, handling rules, price and turnaround. Choose one test that can change a farm decision.","Run paid collections for two hatcheries. Have the specialist check sample quality and explain the results.","Track rejected samples, travel costs and whether results arrive in time to be useful. Ask for repeat bookings."]',
  'Hatcheries book again because the results help them make better decisions.',
  'Build a sample log with collection time, storage instructions, handovers and the lab report. Use fictional cases.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'aquaculture-diagnostics', 'bn',
  'মাছের খামারের নমুনা রোগ পরীক্ষার ল্যাবে নিন',
  'চিকিৎসা বেছে নেওয়ার আগে হ্যাচারি আর খামারকে কাজে লাগে এমন পরীক্ষার ফল পেতে সাহায্য করুন।',
  'মাছের রোগ বোঝেন এমন বিশেষজ্ঞ আর দরকারি পরীক্ষা করে এমন ল্যাবের সঙ্গে কাজ করুন। এক এলাকার খামার থেকে ল্যাবের নিয়ম মেনে নমুনা নিন। মূল রিপোর্টের সঙ্গে বিশেষজ্ঞের ব্যাখ্যা পৌঁছে দিন। কাছাকাছি হ্যাচারি বা খামারগুচ্ছ দিয়ে শুরু করলে সংগ্রহের খরচ ভাগ হয়।',
  'নমুনা সংগ্রহ আর পরীক্ষার ব্যবস্থা করার ফি নিন। ল্যাবের ফি আলাদা রাখুন। হ্যাচারির সঙ্গে নিয়মিত পরীক্ষার চুক্তি করতে পারেন।',
  '["ল্যাবে এখন কোন পরীক্ষা হয়, দাম, নমুনা রাখার নিয়ম আর সময় জেনে নিন। খামারের সিদ্ধান্ত বদলাতে পারে এমন একটি পরীক্ষা বাছুন।","দুই হ্যাচারি থেকে ফি নিয়ে নমুনা নিন। বিশেষজ্ঞ নমুনার মান দেখবেন আর ফল বুঝিয়ে দেবেন।","বাতিল নমুনা, যাতায়াতের খরচ আর ফল সময়মতো পৌঁছাল কি না, লিখে রাখুন। আবার বুকিং চান।"]',
  'ফল সিদ্ধান্ত নিতে কাজে লাগছে বলে হ্যাচারি আবার পরীক্ষা করাচ্ছে।',
  'কাল্পনিক নমুনার সংগ্রহের সময়, রাখার নিয়ম, কার কাছে গেল আর রিপোর্ট রাখার খাতা বানান।',
  ''
);

-- recycled-resin-quality
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'recycled-resin-quality-problem', 'recycled-resin-quality-problem', 'circular', '["anywhere"]',
  '[{"title":"World Bank: Bangladesh environment analysis","url":"https://www.worldbank.org/en/region/sar/publication/bangladesh-country-environment-analysis-2023","date":"2023 report","en":"Country-level evidence on waste and pollution, not demand for a particular resin.","bn":"দেশের বর্জ্য আর দূষণের তথ্য, নির্দিষ্ট প্লাস্টিকের চাহিদার প্রমাণ নয়।"},{"title":"Banyan Nation: traceable plastic supply","url":"https://www.banyannation.com/supply-chain/","date":"Checked 2026-09-25","en":"An Indian company describes its collection and traceability model.","bn":"ভারতের একটি কোম্পানি সংগ্রহ আর উৎসের রেকর্ড রাখার মডেল বর্ণনা করেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'recycled-resin-quality-problem', 'en',
  'Recycled plastic quality can vary between batches',
  'Recycled plastic quality can vary between batches',
  'Manufacturers using recycled plastic in non-food-contact products',
  'The World Bank describes Bangladesh’s plastic-waste challenges. India’s Banyan Nation shows a model that connects collectors, processing and quality records. A Bangladesh business still has to prove that a buyer will pay for consistent material.',
  'Can the recycler meet the same specification repeatedly without making the material too expensive?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'recycled-resin-quality-problem', 'bn',
  'রিসাইকেল করা প্লাস্টিকের মান এক ব্যাচ থেকে আরেক ব্যাচে বদলাতে পারে',
  'রিসাইকেল করা প্লাস্টিকের মান এক ব্যাচ থেকে আরেক ব্যাচে বদলাতে পারে',
  'খাবারের সংস্পর্শে আসে না এমন পণ্যে রিসাইকেল করা প্লাস্টিক ব্যবহারকারী কারখানা।',
  'বিশ্বব্যাংক বাংলাদেশের প্লাস্টিক বর্জ্যের সমস্যা তুলে ধরেছে। ভারতের Banyan Nation সংগ্রহকারী, প্রক্রিয়াকরণ আর মানের রেকর্ড একসঙ্গে রাখে। বাংলাদেশে একই মানের মালের জন্য বায়ার কতটা দিতে রাজি, সেটা পরীক্ষা করতে হবে।',
  'দাম বেশি না বাড়িয়ে রিসাইক্লার কি বারবার একই মানের মাল বানাতে পারবেন?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'recycled-resin-quality', 'recycled-resin-quality-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'recycled-resin-quality', 'en',
  'Supply recycled plastic that buyers can rely on',
  'Check each batch against a manufacturer’s needs before it reaches the factory.',
  'Choose one plastic type and one use, such as non-food packaging or household goods. Agree quality limits with a buyer, then work with an existing recycler to make sample batches. Keep the test results with each delivery. Build repeat supply contracts before investing in your own plant.',
  'Earn a margin on accepted batches. Include sorting losses, testing, rejected material and the time spent waiting for payment.',
  '["Get a buyer’s written specification and a conditional order. Find a recycler able to make that material.","Test three batches against the same requirements. Check contamination, consistency and delivered cost.","Sell a paid batch and follow its use in production. Seek a repeat order before increasing volume."]',
  'Buyers reorder at a price that covers tests, rejects and the full cost of supply.',
  'Make a batch record showing plastic type, source, test results, weight and buyer approval.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'recycled-resin-quality', 'bn',
  'একই মানের রিসাইকেল করা প্লাস্টিক সরবরাহ করুন',
  'কারখানায় পাঠানোর আগে প্রতিটি ব্যাচ বায়ারের চাহিদার সঙ্গে মিলিয়ে নিন।',
  'এক ধরনের প্লাস্টিক আর একটি ব্যবহার বাছুন, যেমন খাবারের সঙ্গে লাগে না এমন প্যাকেট বা ঘরের জিনিস। বায়ারের সঙ্গে মান ঠিক করে চালু রিসাইক্লারকে দিয়ে নমুনা ব্যাচ বানান। প্রতি চালানে পরীক্ষার ফল রাখুন। নিজের প্ল্যান্টে টাকা ঢালার আগে নিয়মিত অর্ডার পান।',
  'বায়ার গ্রহণ করেছেন এমন ব্যাচে লাভ রাখুন। বাছাইয়ে বাদ পড়া মাল, পরীক্ষা, বাতিল ব্যাচ আর পেমেন্টের অপেক্ষা খরচে ধরুন।',
  '["বায়ারের লিখিত চাহিদা আর শর্তসাপেক্ষ অর্ডার নিন। সেই মাল বানাতে পারেন এমন রিসাইক্লার খুঁজুন।","তিন ব্যাচ একই নিয়মে পরীক্ষা করুন। ময়লা বা অন্য উপাদান, মানের ওঠানামা আর পৌঁছানো পর্যন্ত খরচ দেখুন।","এক ব্যাচ বিক্রি করে দাম বুঝে নিন, কারখানায় কেমন কাজ করে দেখুন। বেশি মাল নেওয়ার আগে আরেক অর্ডার চান।"]',
  'পরীক্ষা, বাতিল মাল আর সরবরাহের পুরো খরচ ওঠে এমন দামে বায়ার আবার কিনছেন।',
  'প্লাস্টিকের ধরন, উৎস, পরীক্ষার ফল, ওজন আর বায়ারের অনুমোদনসহ ব্যাচের রেকর্ড বানান।',
  ''
);

-- bangla-order-intake
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'bangla-order-intake-problem', 'bangla-order-intake-problem', 'commerce', '["anywhere"]',
  '[{"title":"Sokrio: distributor workflows","url":"https://sokrio.com/use-cases/","date":"Checked 2026-09-25","en":"Existing distributor software is an alternative to compare against.","bn":"চালু ডিস্ট্রিবিউটর সফটওয়্যারের সঙ্গে প্রস্তাবটি মিলিয়ে দেখুন।"},{"title":"i2i Ventures: Revora investment memo, 24 June 2026","url":"https://i2iventures.substack.com/p/why-we-invested-revora","date":"2026-06-24","en":"An investor memo on a focused conversational-commerce product.","bn":"নির্দিষ্ট কথাবার্তা থেকে বিক্রির কাজ করা পণ্য নিয়ে বিনিয়োগকারীর লেখা।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-order-intake-problem', 'en',
  'Dealer messages still need someone to enter the order',
  'Dealer messages still need someone to enter the order',
  'Distributors repeatedly retyping voice notes and messages into existing systems',
  'Sokrio already supports distributor sales workflows. Revora’s investor memo describes a focused conversational-commerce business. The possible opening is accurate Bangla order entry inside existing tools, rather than another general chatbot.',
  'Does this save work after staff review, and could the existing sales software do it just as well?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-order-intake-problem', 'bn',
  'ডিলারের মেসেজ পেলেও অর্ডার কাউকে লিখতে হয়',
  'ডিলারের মেসেজ পেলেও অর্ডার কাউকে লিখতে হয়',
  'ডিলারদের অর্ডার নেয় এমন ডিস্ট্রিবিউটরের সেলস টিম।',
  'Sokrio ডিস্ট্রিবিউটরের সেলস নিয়ে কাজ করে। Revora-তে বিনিয়োগের লেখায় নির্দিষ্ট কথাবার্তা থেকে বিক্রির কাজ করার উদাহরণ আছে। এখানে সুযোগটা চালু সফটওয়্যারে ঠিকঠাক বাংলা অর্ডার ঢোকানো, আরেকটা সাধারণ চ্যাটবট বানানো নয়।',
  'কর্মীদের চেকের পরও সময় বাঁচে কি? চালু সেলস সফটওয়্যারেই কি কাজটা সমান ভালো করা যায়?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'bangla-order-intake', 'bangla-order-intake-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-order-intake', 'en',
  'Turn Bangla voice messages into checked orders',
  'Help distributors turn dealer messages into orders their staff can confirm quickly.',
  'A dealer sends a voice note or a message with product names and quantities. The software matches it to the distributor’s catalogue and prepares an order. Staff see uncertain items and confirm the details before anything is sent. Connect to the sales system the distributor already uses.',
  'Charge a monthly fee per team or for confirmed order volume. Include speech processing, corrections and support in the cost.',
  '["Pick one distributor and catalogue. Get permission to use past messages with staff-checked answers.","Test 200 messages, including unclear names and changed quantities. Compare mistakes and staff time with manual entry.","Run a paid trial with staff approving every order. Keep it only if it saves work without increasing costly errors."]',
  'Staff confirm orders faster, serious mistakes stay low and the distributor keeps paying.',
  'Build a message-to-order screen with a catalogue, uncertain fields and a confirmation button. Use sample messages.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-order-intake', 'bn',
  'বাংলা ভয়েস মেসেজ থেকে অর্ডার তৈরি করুন',
  'ডিলারের মেসেজ থেকে এমন অর্ডার বানান, যা কর্মীরা দ্রুত মিলিয়ে নিতে পারেন।',
  'ডিলার ভয়েস নোট বা মেসেজে পণ্যের নাম আর পরিমাণ পাঠান। সফটওয়্যার ডিস্ট্রিবিউটরের পণ্যের তালিকা দেখে অর্ডার বানাবে। অস্পষ্ট জায়গাগুলো কর্মীদের দেখাবে, তাঁরা ঠিক আছে বলার পরই অর্ডার যাবে। ডিস্ট্রিবিউটর এখন যে সেলস সফটওয়্যার ব্যবহার করেন, তার সঙ্গেই যুক্ত করুন।',
  'প্রতি টিম বা নিশ্চিত করা অর্ডারের সংখ্যা ধরে মাসিক ফি নিন। কথা থেকে লেখা বানানো, ভুল ঠিক করা আর সাপোর্টের খরচ ধরুন।',
  '["এক ডিস্ট্রিবিউটরের পণ্যের তালিকা বাছুন। অনুমতি নিয়ে কর্মীদের যাচাই করা পুরোনো মেসেজ নিন।","অস্পষ্ট নাম আর বদলানো পরিমাণসহ ২০০টি মেসেজ পরীক্ষা করুন। হাতে লেখার চেয়ে ভুল আর সময় কতটা বদলায়, দেখুন।","প্রতিটি অর্ডার কর্মীদের দিয়ে মিলিয়ে ফি নিয়ে চালান। বড় ভুল না বাড়িয়ে কাজ কমলে তবেই রাখুন।"]',
  'কর্মীরা দ্রুত অর্ডার নিশ্চিত করছেন, বড় ভুল কম থাকছে আর ডিস্ট্রিবিউটর ফি দিচ্ছেন।',
  'নমুনা মেসেজ থেকে অর্ডার তৈরির স্ক্রিন বানান। পণ্যের তালিকা, অস্পষ্ট ঘর আর নিশ্চিত করার বাটন রাখুন।',
  ''
);

-- chip-verification
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'chip-verification-problem', 'chip-verification-problem', 'technology', '["anywhere"]',
  '[{"title":"BIDA: semiconductor taskforce","url":"https://www.bida.gov.bd/details/govt-approves-national-semiconductor-taskforce-headed-bida-latest-news","date":"2025-01-01","en":"BIDA announced a semiconductor taskforce; this is policy direction, not a customer order.","bn":"BIDA সেমিকন্ডাক্টর টাস্কফোর্স ঘোষণা করেছে। এটা নীতির দিকনির্দেশনা, কাস্টমারের অর্ডার নয়।"},{"title":"Ulkasemi · Design and verification services","url":"https://www.ulkasemi.com/","date":"2026-09-25","en":"Ulkasemi advertises chip design and verification services with a Bangladesh team.","bn":"Ulkasemi বাংলাদেশে টিম নিয়ে চিপ ডিজাইন আর যাচাইয়ের সেবার কথা বলেছে।"},{"title":"Neural Semiconductor · Design services","url":"https://www.neural-semiconductor.com/semiconductor","date":"2026-09-25","en":"Neural Semiconductor lists design and verification capabilities.","bn":"Neural Semiconductor ডিজাইন আর যাচাইয়ের কাজের তালিকা দিয়েছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'chip-verification-problem', 'en',
  'Chip teams need specialist testing capacity',
  'Chip teams need specialist testing capacity',
  'Overseas semiconductor design companies with repeat verification work',
  'BIDA has set up a semiconductor taskforce. Ulkasemi and Neural Semiconductor already provide design and verification services with teams in Bangladesh. A new team needs deep expertise and a narrow customer need, not simply lower salaries.',
  'Which specialised task would a customer trust a new team to handle?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'chip-verification-problem', 'bn',
  'চিপের ডিজাইন যাচাইয়ে বিশেষ দক্ষতার লোক লাগে',
  'চিপের ডিজাইন যাচাইয়ে বিশেষ দক্ষতার লোক লাগে',
  'নিয়মিত ডিজাইন পরীক্ষার কাজ আছে এমন বিদেশি চিপ কোম্পানি।',
  'BIDA সেমিকন্ডাক্টর টাস্কফোর্স করেছে। Ulkasemi আর Neural Semiconductor বাংলাদেশে টিম নিয়ে ডিজাইন আর পরীক্ষার কাজ করে। তাই নতুন টিমের দরকার গভীর দক্ষতা আর নির্দিষ্ট কাস্টমারের সমস্যা। শুধু কম বেতন দিয়ে জেতা কঠিন।',
  'কোন বিশেষ কাজের দায়িত্ব নতুন টিমকে দিতে কাস্টমার ভরসা পাবেন?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'chip-verification', 'chip-verification-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'chip-verification', 'en',
  'Build a team that checks chip designs',
  'Help chip companies find design faults before they pay to manufacture a chip.',
  'A chip design is tested in software before it is made. An experienced team in Bangladesh could take on one part of that testing for overseas customers. Start with a familiar chip component and a clear test plan. Over time, turn repeated work into reusable testing tools where the contracts allow it.',
  'Charge for agreed engineering work, then offer ongoing testing support. Price tool licences, senior review and secure handling of customer designs.',
  '["Have an experienced chip engineer find one customer with a specific testing job. Compare the offer with established design firms.","Agree the test plan, software licences, ownership of work and acceptance rules before starting.","Deliver a paid project and record missed faults, rework and total engineering time. Seek a follow-on contract."]',
  'The customer accepts the results and buys more work at a sustainable price.',
  'Use a public chip-design example to show a test plan and reproducible fault reports. Keep customer designs private.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'chip-verification', 'bn',
  'চিপের ডিজাইন পরীক্ষা করার টিম গড়ুন',
  'চিপ বানাতে টাকা খরচের আগেই ডিজাইনের ভুল খুঁজতে কোম্পানিগুলোকে সাহায্য করুন।',
  'চিপ বানানোর আগে সফটওয়্যারে তার ডিজাইন পরীক্ষা করা হয়। বাংলাদেশে অভিজ্ঞ একটি টিম বিদেশি কোম্পানির হয়ে সেই পরীক্ষার কিছু কাজ নিতে পারে। পরিচিত একটি চিপের অংশ আর স্পষ্ট পরীক্ষার তালিকা দিয়ে শুরু করুন। চুক্তিতে সুযোগ থাকলে একই কাজের জন্য পরে নিজের টুল বানানো যাবে।',
  'ঠিক করা ইঞ্জিনিয়ারিং কাজের ফি নিন, পরে নিয়মিত পরীক্ষার সেবা দিন। সফটওয়্যার লাইসেন্স, অভিজ্ঞদের রিভিউ আর কাস্টমারের ডিজাইন নিরাপদে রাখার খরচ ধরুন।',
  '["অভিজ্ঞ চিপ ইঞ্জিনিয়ারকে দিয়ে নির্দিষ্ট কাজ আছে এমন এক কাস্টমার খুঁজুন। চালু ডিজাইন কোম্পানির সঙ্গে প্রস্তাব মেলান।","শুরুর আগে পরীক্ষার তালিকা, লাইসেন্স, কাজের মালিকানা আর কোন ফলে কাজ গ্রহণ করবেন, ঠিক করুন।","ফি নিয়ে কাজ শেষ করুন। বাদ পড়া ভুল, আবার করা কাজ আর মোট সময় লিখুন। পরের চুক্তি চান।"]',
  'কাস্টমার ফল গ্রহণ করছেন আর খরচ ওঠে এমন দামে আরও কাজ দিচ্ছেন।',
  'সবার জন্য খোলা চিপ ডিজাইন দিয়ে পরীক্ষার তালিকা আর আবার চালিয়ে দেখা যায় এমন ভুলের রিপোর্ট বানান। কাস্টমারের ডিজাইন গোপন রাখুন।',
  ''
);

-- technician-proof-of-skill
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'technician-proof-of-skill-problem', 'technician-proof-of-skill-problem', 'work', '["anywhere"]',
  '[{"title":"ILO: Bangladesh growth and employment","url":"https://www.ilo.org/publications/reviving-and-reconnecting-economic-growth-and-employment-bangladesh","date":"2026-03-02","en":"ILO analyses employment challenges. It does not measure demand for this service.","bn":"ILO কর্মসংস্থানের সমস্যা বিশ্লেষণ করেছে। এই সেবার চাহিদা মাপেনি।"},{"title":"PM: demand-driven skills","url":"https://www.bssnews.net/news-flash/405539","date":"2026-07-14","en":"A July 2026 policy speech calls for demand-driven skills.","bn":"জুলাই ২০২৬-এর নীতিসংক্রান্ত বক্তব্যে কাজের চাহিদা ধরে দক্ষতা শেখানোর কথা আছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'technician-proof-of-skill-problem', 'en',
  'A certificate does not show every practical skill',
  'A certificate does not show every practical skill',
  'Factories and service contractors hiring for one technical role',
  'ILO research highlights Bangladesh’s employment challenges. Demand-driven skills are also a current policy priority. The business opportunity is matching proven skills to real vacancies, rather than selling another course with a vague job promise.',
  'Will employers pay for better hiring decisions, and do the tests predict performance on the job?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'technician-proof-of-skill-problem', 'bn',
  'সার্টিফিকেটে হাতে-কলমে সব দক্ষতা বোঝা যায় না',
  'সার্টিফিকেটে হাতে-কলমে সব দক্ষতা বোঝা যায় না',
  'নির্দিষ্ট টেকনিক্যাল পদে লোক নেয় এমন কারখানা আর সার্ভিস কোম্পানি।',
  'ILO বাংলাদেশের কর্মসংস্থানের সমস্যা নিয়ে গবেষণা করেছে। কাজের চাহিদা ধরে দক্ষতা শেখানোও এখন নীতির অগ্রাধিকার। সুযোগটা আসল শূন্য পদের জন্য দক্ষ লোক খুঁজে দেওয়া, অস্পষ্ট চাকরির আশা দেখিয়ে কোর্স বিক্রি করা নয়।',
  'ভালো নিয়োগের সিদ্ধান্ত নিতে কোম্পানি কি ফি দেবে? পরীক্ষার ফলের সঙ্গে আসল কাজের দক্ষতা মেলে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'technician-proof-of-skill', 'technician-proof-of-skill-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'technician-proof-of-skill', 'en',
  'Help employers hire technicians who can do the job',
  'Use practical tests to match skilled people with real vacancies.',
  'Choose one role, such as machine maintenance. Ask employers which tasks a new hire must handle. Work with qualified assessors to run safe practical tests, then send employers clear results. Offer short training only for specific skill gaps linked to real jobs.',
  'Charge employers for assessments or successful placements under clear terms. Reusable tests and trusted skill records can support more employers.',
  '["Ask five employers about open roles and the tasks applicants struggle with. Get agreement on a paid assessment.","Test a small group against the same tasks. Have assessors record what each person can do.","Track hires, time to become useful on the job and whether employers buy another round."]',
  'Employers hire suitable candidates and pay for the service again.',
  'Create a task checklist with pass criteria, assessor notes and a short employer report.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'technician-proof-of-skill', 'bn',
  'কাজ পারেন এমন টেকনিশিয়ান নিয়োগে সাহায্য করুন',
  'হাতে-কলমে পরীক্ষা নিয়ে দক্ষ লোককে আসল চাকরির সঙ্গে মেলান।',
  'মেশিন মেইনটেন্যান্সের মতো একটি কাজ বাছুন। নতুন লোককে কী করতে হবে, নিয়োগদাতার কাছে জেনে নিন। দক্ষ পরীক্ষকের সাহায্যে নিরাপদে কাজ করে দেখার পরীক্ষা নিন। কে কী পারেন, স্পষ্ট করে কোম্পানিকে জানান। আসল চাকরির জন্য নির্দিষ্ট ঘাটতি থাকলেই ছোট প্রশিক্ষণ দিন।',
  'কোম্পানির কাছ থেকে পরীক্ষার ফি বা স্পষ্ট শর্তে লোক নিয়োগের ফি নিন। একই পরীক্ষা আর ভরসাযোগ্য দক্ষতার রেকর্ড আরও কোম্পানিতে কাজে লাগতে পারে।',
  '["পাঁচ কোম্পানির খালি পদ আর আবেদনকারীরা কোন কাজ পারেন না, জানুন। ফি দিয়ে পরীক্ষা করানোর সম্মতি নিন।","একই কাজ দিয়ে ছোট একটি দলকে পরীক্ষা করুন। পরীক্ষক প্রত্যেকের দক্ষতা লিখে রাখবেন।","কে চাকরি পেলেন, কাজে অভ্যস্ত হতে কত সময় লাগল আর কোম্পানি আবার সেবা নিল কি না, দেখুন।"]',
  'কোম্পানি উপযুক্ত লোক নিয়োগ করছে আর আবার এই সেবার ফি দিচ্ছে।',
  'কাজ, পাস করার নিয়ম, পরীক্ষকের নোট আর কোম্পানির জন্য ছোট রিপোর্টের ছক বানান।',
  ''
);

-- shared-childcare
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'shared-childcare-problem', 'shared-childcare-problem', 'work', '["anywhere"]',
  '[{"title":"ILO: childcare workforce","url":"https://www.ilo.org/resource/news/strengthening-childcare-services-bangladesh-building-skilled-and-certified","date":"2025","en":"ILO describes childcare access and workforce training needs in Bangladesh.","bn":"ILO বাংলাদেশে শিশু দেখভালের সুযোগ আর কর্মীদের প্রশিক্ষণের দরকার বর্ণনা করেছে।"},{"title":"ILO: professional childcare project","url":"https://webapps.ilo.org/DevelopmentCooperationDashboard/p/project/109023","date":"Project through 2026-05-31","en":"A project scope for model centres and professional childcare standards.","bn":"আদর্শ সেন্টার আর পেশাদার শিশু দেখভালের মান তৈরির প্রকল্পের বিবরণ।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-childcare-problem', 'en',
  'Work hours and childcare hours do not always match',
  'Work hours and childcare hours do not always match',
  'Employers willing to pay for reliable childcare near workplaces',
  'ILO work in Bangladesh identifies access to quality childcare and trained staff as concerns. Existing centres and employer-run services are possible partners. This is a care operation with strict standards, not just a booking app.',
  'Can nearby employers cover enough places to keep qualified staff and dependable hours?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-childcare-problem', 'bn',
  'অফিসের সময়ের সঙ্গে শিশু দেখভালের সময় সবসময় মেলে না',
  'অফিসের সময়ের সঙ্গে শিশু দেখভালের সময় সবসময় মেলে না',
  'কর্মস্থলের কাছে নির্ভরযোগ্য শিশু দেখভালের জন্য খরচ করতে রাজি কোম্পানি।',
  'বাংলাদেশে ভালো শিশু দেখভালের সুযোগ আর কর্মীদের প্রশিক্ষণ নিয়ে ILO কাজ করেছে। চালু সেন্টার আর কোম্পানির নিজস্ব ডে-কেয়ার সহযোগী হতে পারে। এটা নির্দিষ্ট মান মেনে যত্ন দেওয়ার কাজ, শুধু বুকিংয়ের অ্যাপ নয়।',
  'দক্ষ কর্মী আর ঠিক সময়ে সেবা রাখতে কাছের কোম্পানিগুলো কি যথেষ্ট জায়গার খরচ দেবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'shared-childcare', 'shared-childcare-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-childcare', 'en',
  'Help nearby employers share dependable childcare',
  'Arrange trusted childcare places with hours that fit parents’ work shifts.',
  'Work with an existing childcare centre and a small group of nearby employers. Reserve places, agree opening hours and organise clear pickup rules with parents. Check staffing, registration and child-protection practices before enrolling children. Grow through repeat employer contracts and consistent service standards.',
  'Employers pay to reserve places. Any parent contribution should be clear from the start. Include staffing, training, meals and unused places in the cost.',
  '["Talk separately with parents and employers about shifts, travel and what they can pay.","Check a suitable centre’s registration, staff training and safety practices with the relevant authority. Get employer commitments before reserving places.","Run a small paid programme. Track attendance, parent feedback, staffing costs and employer renewal."]',
  'Parents trust and use the service, and employers renew without cutting care standards.',
  'Make a sample plan for shifts, places, staff cover, pickup permissions and monthly costs.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-childcare', 'bn',
  'কয়েকটি অফিসের জন্য ভরসাযোগ্য ডে-কেয়ারের ব্যবস্থা করুন',
  'মা-বাবার কাজের শিফটের সঙ্গে মেলে এমন সময়ে শিশু দেখভালের জায়গা ঠিক করে দিন।',
  'চালু একটি ডে-কেয়ার আর কাছাকাছি কয়েকটি কোম্পানির সঙ্গে কাজ করুন। শিশুদের জন্য জায়গা রাখুন, খোলা থাকার সময় ঠিক করুন। মা-বাবার সঙ্গে নিয়ে যাওয়ার নিয়মও মিলিয়ে নিন। ভর্তির আগে কর্মী, রেজিস্ট্রেশন আর শিশু সুরক্ষার ব্যবস্থা দেখুন। মান ঠিক রেখে নিয়মিত কোম্পানি চুক্তির মাধ্যমে কাজ বাড়ান।',
  'জায়গা রাখার জন্য কোম্পানি ফি দেবে। মা-বাবাকেও কিছু দিতে হলে শুরুতেই তা জানান। কর্মী, প্রশিক্ষণ, খাবার আর খালি থাকা জায়গার খরচ ধরুন।',
  '["মা-বাবা আর কোম্পানির সঙ্গে আলাদা করে শিফট, যাতায়াত আর খরচ নিয়ে কথা বলুন।","দায়িত্বে থাকা সরকারি অফিসের সঙ্গে সেন্টারের রেজিস্ট্রেশন, প্রশিক্ষণ আর নিরাপত্তার নিয়ম মিলিয়ে নিন। জায়গা রাখার আগে কোম্পানির চুক্তি নিন।","ছোট পরিসরে ফি নিয়ে চালান। উপস্থিতি, মা-বাবার মতামত, কর্মীর খরচ আর কোম্পানি চুক্তি বাড়ায় কি না, দেখুন।"]',
  'মা-বাবা ভরসা করে সেবা নিচ্ছেন, আর যত্নের মান না কমিয়েই কোম্পানির চুক্তি বাড়ছে।',
  'শিফট, জায়গা, কর্মীর ডিউটি, শিশু নিয়ে যাওয়ার অনুমতি আর মাসিক খরচের নমুনা পরিকল্পনা বানান।',
  ''
);

-- bangla-speech-infrastructure
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'bangla-speech-infrastructure-problem', 'bangla-speech-infrastructure-problem', 'technology', '["anywhere"]',
  '[{"title":"Bengali-Loop research, 15 February 2026","url":"https://arxiv.org/abs/2602.14291","date":"2026-02-15","en":"Research benchmarks long-form Bangla recordings, not a customer-call product.","bn":"গবেষণায় দীর্ঘ বাংলা রেকর্ডের পরীক্ষা আছে, কাস্টমার কলের পণ্য পরীক্ষা নয়।"},{"title":"BanSpeech, IEEE Access, 29 February 2024","url":"https://ieeexplore.ieee.org/document/10453554/","date":"2024-02-29","en":"Research examines Bangla speech recognition across recording domains.","bn":"বিভিন্ন ধরনের রেকর্ডে বাংলা কথা থেকে লেখা তৈরির গবেষণা।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-speech-infrastructure-problem', 'en',
  'Bangla speech tools need to cope with real call conditions',
  'Bangla speech tools need to cope with real call conditions',
  'Contact centres, banks, insurers and software companies serving Bangla speakers',
  'Bengali-Loop and BanSpeech study Bangla speech recognition across different recordings. They support testing local speech carefully, but do not prove that today’s commercial tools fail every customer. The first task is to find a gap worth fixing.',
  'Which mistakes cost customers time, and can you beat current tools on those calls?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-speech-infrastructure-problem', 'bn',
  'আসল কলে বাংলা বোঝার জন্য পরিবেশের শব্দ আর উচ্চারণ সামলাতে হয়',
  'আসল কলে বাংলা বোঝার জন্য পরিবেশের শব্দ আর উচ্চারণ সামলাতে হয়',
  'বাংলা কল সামলায় এমন কল সেন্টার, ব্যাংক, বীমা আর সফটওয়্যার কোম্পানি।',
  'Bengali-Loop আর BanSpeech নানা রেকর্ডে বাংলা কথা থেকে লেখা তৈরির গবেষণা করেছে। স্থানীয় কথা ভালো করে পরীক্ষা করা দরকার, তা এখান থেকে বোঝা যায়। তবে এখনকার সব টুলই খারাপ, এমন প্রমাণ নয়। আগে কাজে লাগে এমন ঘাটতি খুঁজতে হবে।',
  'কোন ভুলে কাস্টমারের সময় যায়? সেই কলে চালু টুলের চেয়ে ভালো করা যাবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'bangla-speech-infrastructure', 'bangla-speech-infrastructure-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-speech-infrastructure', 'en',
  'Build speech tools for real Bangladeshi calls',
  'Turn noisy Bangla calls into accurate text that other software can use.',
  'Build a service that understands Bangladeshi accents, mixed Bangla-English speech and names. Start with recordings from one job, such as customer-support calls. Show uncertain words so a person can check them. If it works well, sell the tool to other software teams through a simple software connection.',
  'Charge by audio minutes or monthly usage. Include model costs, secure storage and human checks. Expand to live calls only after accuracy and speed are good enough.',
  '["Get consented recordings from two call types and have people label the correct names, amounts and requests.","Compare existing speech tools with your version on unseen calls. Measure serious errors, correction time and full cost.","Run a paid trial with one customer. Keep audio access limited and agree when recordings are deleted."]',
  'Customers pay because the tool handles their calls better than the alternatives at a workable cost.',
  'Build a screen that plays a test clip beside its transcript and highlights uncertain words.',
  'Useful infrastructure for many Bangla products, with a clear benchmark against existing tools.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-speech-infrastructure', 'bn',
  'বাংলাদেশের ফোনকল বোঝে এমন সফটওয়্যার বানান',
  'শব্দের ভিড়েও বাংলা কথা ঠিকঠাক লেখায় আনুন, যাতে অন্য সফটওয়্যার তা কাজে লাগাতে পারে।',
  'একেক এলাকার টান, বাংলা-ইংরেজি মেশানো কথা আর নাম ঠিকমতো ধরতে পারে এমন সেবা বানান। কাস্টমার সাপোর্টের মতো এক ধরনের কল দিয়ে শুরু করুন। অনিশ্চিত শব্দ দেখিয়ে দিন, মানুষ মিলিয়ে নেবে। ভালো কাজ করলে অন্য সফটওয়্যার টিমকে তাদের পণ্যে এই সেবা যুক্ত করতে দিন।',
  'অডিওর মিনিট বা মাসিক ব্যবহার ধরে ফি নিন। মডেল চালানো, তথ্য নিরাপদে রাখা আর মানুষের চেকের খরচ ধরুন। যথেষ্ট দ্রুত আর নির্ভুল হলে তবেই সরাসরি কলের কাজে যান।',
  '["সম্মতি নিয়ে দুই ধরনের কলের রেকর্ড নিন। মানুষ দিয়ে নাম, টাকার অঙ্ক আর কী চাওয়া হয়েছে, লিখিয়ে নিন।","আগে শোনেনি এমন কলে চালু টুলের সঙ্গে নিজের টুল মেলান। বড় ভুল, ঠিক করার সময় আর পুরো খরচ মাপুন।","এক কাস্টমারের সঙ্গে ফি নিয়ে পরীক্ষা করুন। রেকর্ড কারা দেখবেন আর কখন মুছবেন, আগে ঠিক করুন।"]',
  'এই কলে অন্য টুলের চেয়ে ভালো কাজ হচ্ছে, খরচও সহনীয়। তাই কাস্টমার ফি দিচ্ছেন।',
  'নমুনা অডিওর পাশে লেখা দেখানোর স্ক্রিন বানান। অনিশ্চিত শব্দ আলাদা করে দেখান।',
  'অনেক বাংলা পণ্যে কাজে লাগতে পারে। চালু টুলের সঙ্গে সরাসরি ফল মেলানো যাবে।'
);

-- code-change-verification
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'code-change-verification-problem', 'code-change-verification-problem', 'technology', '["anywhere"]',
  '[{"title":"OpenRefactory: intelligent code repair","url":"https://www.openrefactory.com/blog/how-to-serve-open-source-software-maintainers-without-annoying-them","date":"2026-09-25","en":"OpenRefactory is an existing code-repair provider.","bn":"OpenRefactory আগেই কোড ঠিক করার সেবা দেয়।"},{"title":"Accel and Google AI cohort, 16 March 2026","url":"https://atoms.accel.com/news/meet-the-startups-in-ai-cohort-2026","date":"2026-03-16","en":"A 2026 investor cohort includes specialised enterprise AI tools.","bn":"২০২৬-এর বিনিয়োগকারী কর্মসূচিতে প্রতিষ্ঠানের নির্দিষ্ট কাজের এআই টুল আছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'code-change-verification-problem', 'en',
  'Code that looks right can still fail in use',
  'Code that looks right can still fail in use',
  'Software teams shipping many AI-generated pull requests',
  'OpenRefactory already offers code repair, and software teams have tests and scanners. A new product needs to prove its value on a narrow failure type. More generated review comments are not the goal.',
  'Can the tool find real faults reliably enough to earn a place in a team’s release process?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'code-change-verification-problem', 'bn',
  'দেখে ঠিক মনে হলেও কোড চালালে সমস্যা হতে পারে',
  'দেখে ঠিক মনে হলেও কোড চালালে সমস্যা হতে পারে',
  'এআইয়ের সাহায্যে অনেক কোড বদলায় এমন সফটওয়্যার টিম।',
  'OpenRefactory কোড ঠিক করার সেবা দেয়। টিমগুলোর টেস্ট আর স্ক্যানারও আছে। নতুন পণ্যকে তাই নির্দিষ্ট একটি ভুল ধরার কাজে নিজের সুবিধা দেখাতে হবে। বেশি বেশি রিভিউ কমেন্ট বানালেই কাজ হবে না।',
  'টিমের সফটওয়্যার ছাড়ার প্রক্রিয়ায় জায়গা পাওয়ার মতো নির্ভরযোগ্যভাবে ভুল ধরা যাবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'code-change-verification', 'code-change-verification-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'code-change-verification', 'en',
  'Check whether AI-written code actually fixes the bug',
  'Give software reviewers a repeatable test of a proposed code change.',
  'Choose one kind of change, such as a software-package update. Reproduce the old fault, run the proposed fix and check for new failures. Give the reviewer a short report with tests they can rerun. A skilled team could build this in Bangladesh for customers around the world.',
  'Charge per code repository or test workload. The fee must cover computing costs while saving the customer review time.',
  '["Collect public or permissioned past changes with known outcomes. Keep some projects unseen until the final test.","Compare your tool with existing tests and code-review tools. Count missed bugs, false alarms and reviewer time.","Try it on new work with a paying team. Let people decide whether to accept changes."]',
  'The tool catches useful failures other checks miss, without flooding reviewers with false alarms.',
  'Build a report showing the original fault, the proposed fix and a command that repeats each test.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'code-change-verification', 'bn',
  'এআইয়ের লেখা কোডে ভুল ঠিক হয়েছে কি না দেখুন',
  'কোড বদলানোর পরে সমস্যাটা ঠিক হলো কি না, বারবার চালিয়ে দেখার পরীক্ষা দিন।',
  'সফটওয়্যারের কোনো প্যাকেজ আপডেটের মতো এক ধরনের বদল বাছুন। আগে পুরোনো ভুলটা ঘটিয়ে দেখুন, তারপর নতুন কোডে সেটি আর হয় কি না দেখুন। অন্য কিছু নষ্ট হলো কি না, তাও পরীক্ষা করুন। রিভিউয়ার নিজে আবার চালাতে পারেন এমন ছোট রিপোর্ট দিন। বাংলাদেশে দক্ষ টিম গড়ে বিশ্বজুড়েই এই সেবা বিক্রি করা যায়।',
  'কোডের প্রজেক্ট বা পরীক্ষার পরিমাণ ধরে ফি নিন। কম্পিউটিং খরচ উঠতে হবে, কাস্টমারের রিভিউয়ের সময়ও বাঁচতে হবে।',
  '["ফল জানা আছে এমন পুরোনো কোডের বদল নিন, সবার জন্য খোলা বা অনুমতি পাওয়া প্রজেক্ট থেকে। কিছু প্রজেক্ট শেষ পরীক্ষার জন্য আলাদা রাখুন।","চালু টেস্ট আর রিভিউ টুলের সঙ্গে তুলনা করুন। বাদ পড়া ভুল, ভুল সতর্কতা আর রিভিউয়ের সময় গুনুন।","ফি দেওয়া একটি টিমের নতুন কাজে চালান। কোড গ্রহণের সিদ্ধান্ত মানুষের কাছেই রাখুন।"]',
  'অন্য পরীক্ষায় বাদ পড়া দরকারি ভুল ধরা পড়ছে, অথচ মিথ্যা সতর্কতায় রিভিউয়ার বিরক্ত হচ্ছেন না।',
  'পুরোনো ভুল, নতুন কোড আর পরীক্ষা আবার চালানোর কমান্ডসহ নমুনা রিপোর্ট বানান।',
  ''
);

-- merchant-settlement-reconciliation
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'merchant-settlement-reconciliation-problem', 'merchant-settlement-reconciliation-problem', 'finance', '["anywhere"]',
  '[{"title":"Bangladesh Bank: Payment Systems Report, December 2025 edition","url":"https://www.bb.org.bd/pub/annual/psdreport/paymentreport_dec2025.pdf","date":"2026-09-25","en":"Bangladesh Bank’s payment-system report provides the infrastructure context.","bn":"বাংলাদেশ ব্যাংকের রিপোর্টে পেমেন্টব্যবস্থার তথ্য আছে।"},{"title":"Accelerating Asia: problems across Asia, 2026 cohort-14 cycle","url":"https://www.acceleratingasia.com/latest-news/acceleratingasia-whos-building-this","date":"2026-09-25","en":"Regional founder observations; useful leads rather than Bangladesh market measurements.","bn":"এই অঞ্চলের ফাউন্ডারদের অভিজ্ঞতা। ধারণা খুঁজতে কাজে লাগে, বাংলাদেশের বাজারের মাপ নয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'merchant-settlement-reconciliation-problem', 'en',
  'A sale and its final payment can sit in different systems',
  'A sale and its final payment can sit in different systems',
  'Multi-channel merchants and the accountants who manage their cash',
  'Bangladesh Bank reports growing digital payment infrastructure. Accelerating Asia also describes fragmented business-finance workflows. Accounting tools and couriers already cover parts of the job. The opening is matching records across providers.',
  'How much work remains after automatic matching, and can the fee cover that support?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'merchant-settlement-reconciliation-problem', 'bn',
  'বিক্রি আর তার শেষ পেমেন্টের হিসাব আলাদা জায়গায় থাকে',
  'বিক্রি আর তার শেষ পেমেন্টের হিসাব আলাদা জায়গায় থাকে',
  'একাধিক মাধ্যমে বিক্রি করেন এমন ব্যবসা আর তাঁদের হিসাবরক্ষক।',
  'বাংলাদেশ ব্যাংকের রিপোর্টে ডিজিটাল পেমেন্টের ব্যবস্থা বাড়ার তথ্য আছে। Accelerating Asia-ও ব্যবসার ছড়ানো আর্থিক কাজের কথা বলেছে। হিসাবের টুল আর কুরিয়ার কিছু কাজ আগেই করে। সুযোগটা ভিন্ন সেবার হিসাব একসঙ্গে মেলানোর কাজে।',
  'সফটওয়্যার মেলানোর পরও হাতে কতটা কাজ থাকে? ফি দিয়ে সেই সাপোর্টের খরচ উঠবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'merchant-settlement-reconciliation', 'merchant-settlement-reconciliation-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'merchant-settlement-reconciliation', 'en',
  'Show sellers which payments are still missing',
  'Match sales with bank, wallet and courier records so missing money is easy to spot.',
  'Import a seller’s orders and payment statements. Match what was sold with what actually arrived, including fees, refunds and cash collected by couriers. Put unclear items in a short review list. Start with file uploads and add direct connections where providers allow them.',
  'Charge a monthly fee based on order volume or outlets. Sell clearer records and less manual checking. Keep customer money with banks and payment providers.',
  '["Get permission to check a full month of records from three sellers, including returns and partial payments.","Have an accountant check the matches and unresolved items. Compare the time needed with the current process.","Run a paid month. Track corrected balances, support costs and whether the seller renews."]',
  'Sellers spend less time chasing payments and keep paying for the clearer records.',
  'Use sample order and settlement files to show matched payments, fees and items that need checking.',
  'A clear money problem with a first test using records sellers already have.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'merchant-settlement-reconciliation', 'bn',
  'বিক্রির কোন টাকা এখনো আসেনি, দেখিয়ে দিন',
  'ব্যাংক, ওয়ালেট আর কুরিয়ারের হিসাবের সঙ্গে বিক্রি মিলিয়ে বাকি টাকা খুঁজুন।',
  'বিক্রেতার অর্ডার আর পেমেন্টের ফাইল নিন। বিক্রির কত টাকা সত্যি এসেছে, মিলিয়ে দেখান। ফি, ফেরত আর কুরিয়ারের তোলা ক্যাশও ধরুন। গরমিলগুলো ছোট তালিকায় রাখুন, যাতে মানুষ দেখে নিতে পারে। শুরুতে ফাইল আপলোড, পরে অনুমতি পেলে সরাসরি সিস্টেম যুক্ত করুন।',
  'অর্ডার বা দোকানের সংখ্যা ধরে মাসিক ফি নিন। পরিষ্কার হিসাব আর কম হাতে চেক করার সুবিধা বিক্রি করুন। কাস্টমারের টাকা ব্যাংক আর পেমেন্ট কোম্পানির কাছেই থাকবে।',
  '["তিন বিক্রেতার অনুমতি নিয়ে এক মাসের হিসাব নিন। ফেরত অর্ডার আর আংশিক পেমেন্টও রাখুন।","হিসাবরক্ষককে দিয়ে মিলে যাওয়া আর বাকি থাকা অঙ্ক চেক করান। আগের তুলনায় কত সময় লাগে, দেখুন।","এক মাস ফি নিয়ে চালান। ঠিক হওয়া হিসাব, সাপোর্টের খরচ আর পরের মাসে কাস্টমার থাকেন কি না, দেখুন।"]',
  'টাকার খোঁজে কম সময় যাচ্ছে বলে বিক্রেতা পরিষ্কার হিসাবের জন্য ফি দিয়ে যাচ্ছেন।',
  'নমুনা অর্ডার আর পেমেন্ট ফাইল দিয়ে মিলে যাওয়া টাকা, ফি আর চেক বাকি এমন তালিকা বানান।',
  'বিক্রেতার হাতে থাকা হিসাব দিয়েই টাকার গরমিলের প্রথম পরীক্ষা করা যায়।'
);

-- bank-cross-border-connectors
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'bank-cross-border-connectors-problem', 'bank-cross-border-connectors-problem', 'finance', '["anywhere"]',
  '[{"title":"Bangladesh Bank FEPD-1 Circular 25, 29 July 2026","url":"https://www.bb.org.bd/mediaroom/circulars/fepd/jul292026fepd-125e.pdf","date":"2026-07-29","en":"July 2026 rules for bank-intermediated digital payments, including records and controls.","bn":"ব্যাংকের মাধ্যমে ডিজিটাল পেমেন্টের জুলাই ২০২৬-এর নিয়মে রেকর্ড আর নিয়ন্ত্রণের শর্ত আছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bank-cross-border-connectors-problem', 'en',
  'Banks need dependable records for cross-border payment partners',
  'Banks need dependable records for cross-border payment partners',
  'Authorised dealer banks and their cross-border payment partners',
  'Bangladesh Bank’s July 2026 framework sets requirements for bank-controlled accounts, records and oversight. These create software work inside regulated bank arrangements. A startup does not receive permission to run a payment service simply by building the software.',
  'Will banks buy a reusable product, or will every connection become a long custom project?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bank-cross-border-connectors-problem', 'bn',
  'বিদেশি পেমেন্ট পার্টনারের সঙ্গে ব্যাংকের নির্ভরযোগ্য হিসাব লাগে',
  'বিদেশি পেমেন্ট পার্টনারের সঙ্গে ব্যাংকের নির্ভরযোগ্য হিসাব লাগে',
  'বৈদেশিক মুদ্রায় লেনদেনের অনুমতিপ্রাপ্ত ব্যাংক আর তাদের পেমেন্ট পার্টনার।',
  'বাংলাদেশ ব্যাংকের জুলাই ২০২৬-এর কাঠামোতে ব্যাংকের নিয়ন্ত্রণে অ্যাকাউন্ট, রেকর্ড আর তদারকির শর্ত আছে। ব্যাংকের এই ব্যবস্থার ভেতরে সফটওয়্যারের কাজ আছে। সফটওয়্যার বানালেই স্টার্টআপ নিজে পেমেন্ট সেবা চালানোর অনুমতি পায় না।',
  'ব্যাংক কি বারবার কাজে লাগে এমন পণ্য কিনবে, নাকি প্রতিটি সংযোগই দীর্ঘ আলাদা প্রজেক্ট হবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'bank-cross-border-connectors', 'bank-cross-border-connectors-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bank-cross-border-connectors', 'en',
  'Help banks connect to overseas payment partners',
  'Keep a bank’s payment records in step with its approved overseas partners.',
  'Build software for a bank that already has an approved payment partner. Match transaction records, flag missing or repeated entries and prepare reports staff can check. Start with one partner connection. The bank keeps control of customer checks, approvals and money movement.',
  'Charge for setup and ongoing software support. Reuse tested connections as more banks or partners join.',
  '["Find an authorised dealer bank with a specific connection problem and a team willing to test a solution.","Use test data to check payments, reversals, missing entries and duplicate records. Agree security and reporting requirements.","Seek a paid pilot after the bank’s technical and compliance review. Learn how long procurement and support will take."]',
  'A bank buys a working connection that reduces manual checks and can be maintained reliably.',
  'Build a test ledger with two sets of partner records, mismatch alerts and a review history. Move no real money.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bank-cross-border-connectors', 'bn',
  'বিদেশি পেমেন্ট সেবার সঙ্গে ব্যাংকের সফটওয়্যার যুক্ত করুন',
  'অনুমোদিত বিদেশি পার্টনারের লেনদেনের সঙ্গে ব্যাংকের হিসাব মিলিয়ে রাখুন।',
  'আগেই অনুমোদিত পেমেন্ট পার্টনার আছে, এমন ব্যাংকের জন্য সফটওয়্যার বানান। লেনদেন মেলান, বাদ পড়া বা দুইবার আসা এন্ট্রি দেখান। কর্মীরা চেক করতে পারেন এমন রিপোর্ট দিন। শুরুতে এক পার্টনারের সংযোগ নিন। কাস্টমার যাচাই, অনুমোদন আর টাকা পাঠানো ব্যাংকের নিয়ন্ত্রণেই থাকবে।',
  'সেটআপ আর নিয়মিত সাপোর্টের ফি নিন। পরীক্ষিত সংযোগগুলো পরে অন্য ব্যাংক বা পার্টনারের কাজেও লাগান।',
  '["বৈদেশিক মুদ্রার লেনদেনের অনুমতিপ্রাপ্ত একটি ব্যাংক খুঁজুন। তাদের নির্দিষ্ট সমস্যা আর পরীক্ষা করতে রাজি টিম থাকতে হবে।","নমুনা ডেটায় পেমেন্ট, ফেরত, বাদ পড়া আর দুইবার আসা এন্ট্রি দেখুন। নিরাপত্তা আর রিপোর্টের চাহিদা ঠিক করুন।","ব্যাংকের টেকনিক্যাল আর নিয়মসংক্রান্ত রিভিউয়ের পর ফি নিয়ে ছোট পরীক্ষা চান। চুক্তি আর সাপোর্টে কত সময় লাগে, জেনে নিন।"]',
  'ব্যাংক এমন সংযোগ কিনছে, যাতে হাতে কম চেক লাগে আর নিয়মিত ঠিক রাখা যায়।',
  'দুই পার্টনারের নমুনা হিসাব, গরমিলের সতর্কতা আর কে কী চেক করেছেন, তার রেকর্ড বানান। আসল টাকা লেনদেন করবেন না।',
  ''
);

-- invoice-finance-evidence
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'invoice-finance-evidence-problem', 'invoice-finance-evidence-problem', 'finance', '["anywhere"]',
  '[{"title":"Bangladesh Bank FEPD-1 Circular 26, 30 July 2026","url":"https://www.bb.org.bd/mediaroom/circulars/fepd/jul302026fepd-126e.pdf","date":"2026-07-30","en":"July 2026 export rules; conditions vary by transaction.","bn":"জুলাই ২০২৬-এর রপ্তানি নিয়ম। লেনদেন অনুযায়ী শর্ত বদলায়।"},{"title":"Jetstream Africa: operations and trade-finance products","url":"https://jetstreamafrica.com","date":"2026-09-25","en":"An African operator describes trade operations and finance services.","bn":"আফ্রিকার একটি কোম্পানি বাণিজ্যের কাজ আর অর্থায়নের সেবা বর্ণনা করেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'invoice-finance-evidence-problem', 'en',
  'Invoice finance depends on evidence from several parties',
  'Invoice finance depends on evidence from several parties',
  'Banks and licensed financiers serving smaller exporters',
  'Bangladesh Bank’s July 2026 export rules cover trade-finance arrangements. Jetstream Africa offers a model linking trade operations and finance. The difficult part is getting trusted, lawful access to records that a lender will use.',
  'Which checks can you actually support with available data, and will a lender pay for them?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'invoice-finance-evidence-problem', 'bn',
  'ইনভয়েসের বিপরীতে ঋণে কয়েক পক্ষের প্রমাণ লাগে',
  'ইনভয়েসের বিপরীতে ঋণে কয়েক পক্ষের প্রমাণ লাগে',
  'ছোট রপ্তানিকারকদের ঋণ দেয় এমন ব্যাংক আর অনুমতিপ্রাপ্ত অর্থায়নকারী প্রতিষ্ঠান।',
  'বাংলাদেশ ব্যাংকের জুলাই ২০২৬-এর রপ্তানি নিয়মে বাণিজ্যে অর্থায়নের ব্যবস্থা আছে। আফ্রিকার Jetstream বাণিজ্যের কাজ আর অর্থায়ন যুক্ত করার উদাহরণ। কঠিন অংশ হলো ঋণদাতা কাজে লাগাবে এমন রেকর্ড বৈধভাবে পাওয়া আর বিশ্বাসযোগ্য রাখা।',
  'যে ডেটা পাওয়া যায়, তা দিয়ে কোন চেক সত্যি করা যাবে? তার জন্য ঋণদাতা ফি দেবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'invoice-finance-evidence', 'invoice-finance-evidence-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'invoice-finance-evidence', 'en',
  'Help lenders check unpaid export invoices',
  'Bring invoices, shipping proof and payment records together for a lender to review.',
  'Work with one licensed lender and one export customer group. Show whether a shipment happened, what has been paid and which records are missing. Flag possible duplicate financing when the lender’s data makes that check possible. Keep the original evidence beside each finding.',
  'Charge the lender for software and record checks. The lender handles credit decisions and financing.',
  '["Ask a lender to show redacted completed cases and identify the evidence that took longest to check.","Test past cases, including planted duplicate records and partial payments. Compare findings with the lender’s own review.","Run a paid pilot on a narrow workflow. Measure staff time, useful findings and the cost of keeping records current."]',
  'A lender pays because reliable evidence makes its checks faster or more useful.',
  'Create a sample invoice file with shipment proof, payment history, missing items and reviewer decisions.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'invoice-finance-evidence', 'bn',
  'রপ্তানির বাকি বিল যাচাইয়ে ঋণদাতাকে সাহায্য করুন',
  'ইনভয়েস, মাল পাঠানোর প্রমাণ আর পেমেন্ট একসঙ্গে দেখান।',
  'এক অনুমতিপ্রাপ্ত ঋণদাতা আর এক ধরনের রপ্তানিকারক নিয়ে কাজ করুন। মাল গেছে কি না, কত টাকা এসেছে আর কোন কাগজ নেই, দেখান। ঋণদাতার ডেটায় সুযোগ থাকলে একই বিলের বিপরীতে আবার টাকা নেওয়ার সম্ভাবনাও দেখান। প্রতিটি ফলের পাশে মূল প্রমাণ রাখুন।',
  'সফটওয়্যার আর কাগজ যাচাইয়ের ফি ঋণদাতার কাছ থেকে নিন। ঋণের সিদ্ধান্ত আর টাকা দেওয়া তাদের কাজ।',
  '["গোপন তথ্য সরানো পুরোনো কেস নিয়ে ঋণদাতার সঙ্গে বসুন। কোন প্রমাণ চেক করতে বেশি সময় যায়, খুঁজুন।","পুরোনো কেসে আংশিক পেমেন্ট আর ইচ্ছে করে রাখা একই রেকর্ড দুবার দিয়ে পরীক্ষা করুন। ঋণদাতার রিভিউয়ের সঙ্গে মেলান।","নির্দিষ্ট কাজে ফি নিয়ে পরীক্ষা করুন। কর্মীর সময়, কাজে লাগে এমন ফল আর রেকর্ড ঠিক রাখার খরচ মাপুন।"]',
  'নির্ভরযোগ্য প্রমাণে যাচাই ভালো বা দ্রুত হচ্ছে বলে ঋণদাতা ফি দিচ্ছে।',
  'নমুনা ইনভয়েসে মাল পাঠানোর প্রমাণ, পেমেন্ট, বাদ পড়া কাগজ আর রিভিউয়ের সিদ্ধান্ত দেখান।',
  ''
);

-- adaptive-bangla-learning
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'adaptive-bangla-learning-problem', 'adaptive-bangla-learning-problem', 'education', '["anywhere"]',
  '[{"title":"BBS/UNICEF: MICS 2025 final report, June 2026","url":"https://www.unicef.org/bangladesh/en/reports/bangladesh-multiple-indicator-cluster-survey-2025-0","date":"2026-09-25","en":"The final MICS 2025 report covers children’s learning in Bangladesh.","bn":"চূড়ান্ত MICS ২০২৫ রিপোর্টে বাংলাদেশের শিশুদের শেখার তথ্য আছে।"},{"title":"J-PAL: adaptive learning in Indian public schools","url":"https://www.povertyactionlab.org/evaluation/scaling-personalized-adaptive-learning-pal-math-and-language-india","date":"2026-09-25","en":"Indian evidence supports testing adaptive practice, not assuming the same results locally.","bn":"ভারতের ফল দেখে নিজের লেভেলে অনুশীলন পরীক্ষা করা যায়। এখানেও একই ফল হবে ধরে নেওয়া যায় না।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'adaptive-bangla-learning-problem', 'en',
  'Children in the same class can need different practice',
  'Children in the same class can need different practice',
  'Schools, learning centres and education programmes buying learning support',
  'Bangladesh’s MICS 2025 report provides recent evidence on children’s learning. J-PAL’s work in India shows why adaptive practice is worth testing. Tutors, 10 Minute School and Shikho already serve learners. The focus here is foundational skills and measured progress.',
  'Does the programme improve skills after accounting for device access, teaching time and cost?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'adaptive-bangla-learning-problem', 'bn',
  'একই ক্লাসের শিশুদের অনুশীলনের দরকার এক রকম নয়',
  'একই ক্লাসের শিশুদের অনুশীলনের দরকার এক রকম নয়',
  'শেখায় সাহায্যের জন্য খরচ করে এমন স্কুল, লার্নিং সেন্টার আর শিক্ষা কর্মসূচি।',
  'বাংলাদেশের MICS ২০২৫ রিপোর্টে শিশুদের শেখার সাম্প্রতিক তথ্য আছে। ভারতে J-PAL-এর গবেষণা নিজের লেভেলে অনুশীলন পরীক্ষা করার কারণ দেখায়। টিউটর, 10 Minute School আর Shikho আগেই আছে। এখানে লক্ষ্য বুনিয়াদি দক্ষতা আর মেপে দেখা উন্নতি।',
  'ডিভাইস, শিক্ষকের সময় আর খরচ ধরেও শেখার দক্ষতা বাড়ে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'adaptive-bangla-learning', 'adaptive-bangla-learning-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'adaptive-bangla-learning', 'en',
  'Help children catch up in maths',
  'Give children Bangla practice at the level they need, with teachers there to help.',
  'Begin with a short skills check, then offer practice on the concepts each child is missing. Explain mistakes in simple Bangla. Let teachers see where help is needed. Design for shared, low-cost devices and weak internet before adding more subjects.',
  'Sell to schools and learning programmes per learner or class. Include teacher support and content review in the price.',
  '["Choose one age group and a few maths skills with teachers. Use reviewed questions and get the required parent consent.","Run a school-term pilot. Compare progress with suitable comparison classes where possible, using questions children have not practised.","Measure learning gains, teacher workload and cost per learner. Ask the school to pay for another term."]',
  'Children improve on independent skill checks and schools can afford to keep using it.',
  'Build one lesson with a skills check, easier and harder practice, clear feedback and a teacher view. Use fictional learner records.',
  'A foundational learning need with a test based on actual skill gains.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'adaptive-bangla-learning', 'bn',
  'শিশুকে নিজের লেভেলে অঙ্ক শিখতে সাহায্য করুন',
  'কোন জায়গায় আটকে যাচ্ছে, তা বুঝে বাংলায় অনুশীলন দিন। শিক্ষক পাশে থাকবেন।',
  'ছোট পরীক্ষা দিয়ে শুরু করুন। শিশু যে বিষয়গুলো বোঝেনি, সেগুলো ধরে অনুশীলন দিন আর সহজ বাংলায় ভুল বুঝিয়ে দিন। কার কোথায় সাহায্য লাগছে, শিক্ষক দেখবেন। আরও বিষয় যোগ করার আগে কমদামি শেয়ার করা ডিভাইস আর দুর্বল ইন্টারনেটে চলার ব্যবস্থা করুন।',
  'স্কুল আর শিক্ষা কর্মসূচির কাছে প্রতি শিক্ষার্থী বা ক্লাস ধরে বিক্রি করুন। শিক্ষককে সাহায্য আর কনটেন্ট চেকের খরচও দামে ধরুন।',
  '["শিক্ষকদের সঙ্গে এক বয়সের শিশু আর অঙ্কের কয়েকটি দক্ষতা বাছুন। যাচাই করা প্রশ্ন নিন, দরকারি অভিভাবকের সম্মতি নিন।","এক টার্ম চালিয়ে দেখুন। সম্ভব হলে একই রকম অন্য ক্লাসের সঙ্গে অগ্রগতি মেলান। অনুশীলনে দেয়নি এমন প্রশ্ন দিয়ে পরীক্ষা নিন।","শেখার উন্নতি, শিক্ষকের কাজ আর প্রতি শিশুর খরচ মাপুন। পরের টার্মে স্কুলকে ফি দিয়ে চালাতে বলুন।"]',
  'আলাদা দক্ষতার পরীক্ষায় শিশুরা ভালো করছে, আর স্কুলের পক্ষে খরচ চালানো সম্ভব।',
  'একটি পাঠ বানান। দক্ষতা চেক, সহজ-কঠিন অনুশীলন, পরিষ্কার ব্যাখ্যা আর শিক্ষকের স্ক্রিন রাখুন। কাল্পনিক শিক্ষার্থীর তথ্য নিন।',
  'বুনিয়াদি শেখার দরকার মেটানোর ধারণা, যার ফল আসল দক্ষতা দিয়ে মাপা যায়।'
);

-- bangla-assessment-feedback
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'bangla-assessment-feedback-problem', 'bangla-assessment-feedback-problem', 'education', '["anywhere"]',
  '[{"title":"Monsha: current teacher tools","url":"https://www.monsha.ai","date":"2026-09-25","en":"Monsha already offers teacher planning and resource tools.","bn":"Monsha আগেই শিক্ষকের পরিকল্পনা আর পড়ানোর উপকরণের টুল দেয়।"},{"title":"Do Ventures: Azota portfolio profile","url":"https://doventures.vc/en/portfolio/education/azota","date":"2026-09-25","en":"Do Ventures describes a Vietnamese assessment and progress-tracking product.","bn":"Do Ventures ভিয়েতনামের পরীক্ষা আর অগ্রগতি দেখার পণ্য বর্ণনা করেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-assessment-feedback-problem', 'en',
  'Checking classwork takes time away from teaching',
  'Checking classwork takes time away from teaching',
  'Schools and coaching centres with recurring assessment workloads',
  'Monsha already offers teacher tools, while Vietnam’s Azota supports assessment and progress tracking. A new product needs a specific strength, such as dependable handling of Bangla classwork. Generating more worksheets is not enough.',
  'Can teachers check the suggestions faster than marking the work themselves?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'bangla-assessment-feedback-problem', 'bn',
  'খাতা দেখতে গিয়ে পড়ানোর সময় কমে যায়',
  'খাতা দেখতে গিয়ে পড়ানোর সময় কমে যায়',
  'নিয়মিত পরীক্ষা নেয় এমন স্কুল আর কোচিং সেন্টার।',
  'Monsha শিক্ষকের জন্য টুল দেয়, আর ভিয়েতনামের Azota পরীক্ষা আর অগ্রগতি নিয়ে কাজ করে। নতুন পণ্যের নির্দিষ্ট শক্তি লাগবে, যেমন বাংলা খাতা ঠিকঠাক পড়া। শুধু আরও ওয়ার্কশিট বানালে হবে না।',
  'নিজে খাতা দেখার চেয়ে সফটওয়্যারের পরামর্শ চেক করা কি দ্রুত হবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'bangla-assessment-feedback', 'bangla-assessment-feedback-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-assessment-feedback', 'en',
  'Help teachers check Bangla classwork',
  'Turn photos of classwork into draft feedback that a teacher can review.',
  'Start with one subject and a limited question type. A teacher uploads classwork, checks the suggested feedback and sees which mistakes keep appearing across the class. Keep the original answer beside every suggestion. Use the result to help plan the next lesson.',
  'Charge schools or coaching centres per teacher or class. Include scanning and correction time when showing what the tool saves.',
  '["Get consent to test de-identified work with varied handwriting. Have two teachers prepare reference feedback.","Compare the tool with that feedback. Count missed answers, wrong suggestions and total time, including taking photos.","Run a paid classroom trial. Let teachers approve every result and keep final grading with them."]',
  'Teachers save time and use the feedback to decide what to teach next.',
  'Build a side-by-side view of a sample answer and suggested feedback, with edit and approve controls.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'bangla-assessment-feedback', 'bn',
  'বাংলা ক্লাসওয়ার্ক দেখতে শিক্ষককে সাহায্য করুন',
  'খাতার ছবি থেকে খসড়া ফিডব্যাক দিন, শিক্ষক মিলিয়ে নেবেন।',
  'একটি বিষয় আর নির্দিষ্ট ধরনের প্রশ্ন দিয়ে শুরু করুন। শিক্ষক খাতার ছবি দেবেন, সফটওয়্যারের পরামর্শ দেখে ঠিক করবেন। ক্লাসে কোন ভুল বারবার হচ্ছে, তাও দেখবেন। প্রতিটি পরামর্শের পাশে আসল উত্তর রাখুন। পরের ক্লাসে কী শেখাবেন, তা ঠিক করতে ফল কাজে লাগবে।',
  'স্কুল বা কোচিং সেন্টারে শিক্ষক বা ক্লাস ধরে ফি নিন। কত সময় বাঁচল বলার সময় ছবি তোলা আর ভুল ঠিক করার সময়ও ধরুন।',
  '["সম্মতি নিয়ে নাম-পরিচয় সরানো নানা হাতের লেখার খাতা নিন। দুই শিক্ষককে দিয়ে সঠিক ফিডব্যাক বানান।","টুলের সঙ্গে সেই ফিডব্যাক মেলান। বাদ পড়া উত্তর, ভুল পরামর্শ আর ছবি তোলাসহ পুরো সময় গুনুন।","ক্লাসে ফি নিয়ে পরীক্ষা করুন। প্রতিটি ফল শিক্ষক অনুমোদন করবেন, শেষ নম্বরও তাঁরাই দেবেন।"]',
  'শিক্ষকের সময় বাঁচছে আর পরের পাঠ ঠিক করতে ফিডব্যাক কাজে লাগছে।',
  'নমুনা উত্তরের পাশে পরামর্শ দেখান। শিক্ষক বদলে দিতে বা অনুমোদন করতে পারবেন।',
  ''
);

-- fish-farm-autopilot
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'fish-farm-autopilot-problem', 'fish-farm-autopilot-problem', 'agriculture', '["anywhere"]',
  '[{"title":"WorldFish: digital innovations","url":"https://www.worldfishcenter.org/knowledge/digital-innovations","date":"2026-09-25","en":"WorldFish describes digital aquaculture tools, including work in Bangladesh.","bn":"WorldFish বাংলাদেশসহ বিভিন্ন দেশের ডিজিটাল মৎস্যচাষের টুল বর্ণনা করেছে।"},{"title":"YY Ventures: Orange Corners cohort 5, 14 January 2026","url":"https://yy.ventures/news-views-more/yy-ventures-graduates-5th-cohort-of-entrepreneurs-from-orange-corners-bangladesh-","date":"2026-01-14","en":"The January 2026 cohort includes xFishery. Accelerator support is not proof of customer demand.","bn":"জানুয়ারি ২০২৬-এর দলে xFishery আছে। কর্মসূচির সহায়তা পাওয়া কাস্টমারের চাহিদার প্রমাণ নয়।"},{"title":"JALA: climate-smart shrimp pilot harvest, 2025","url":"https://jala.tech/blog/shrimp-industry/climate-smart-shrimp-farming-project-celebrates-first-harvest-paving-the-way-for-sustainable-aquaculture-in-asia","date":"2026-09-25","en":"An Indonesian farm pilot reached harvest; commercial returns are not established here.","bn":"ইন্দোনেশিয়ায় পরীক্ষামূলক খামারে চিংড়ি তোলা হয়েছে। ব্যবসার লাভ এখানে প্রমাণিত নয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'fish-farm-autopilot-problem', 'en',
  'Pond conditions can change between farm visits',
  'Pond conditions can change between farm visits',
  'Commercial fish farms, hatcheries and farm groups',
  'WorldFish documents digital aquaculture work, and businesses such as One Fish and xFishery are already active. JALA’s Indonesian work offers another operating example. The opportunity depends on reliable readings and field support, not just a sensor dashboard.',
  'Will alerts change farm decisions often enough to cover equipment and service costs?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'fish-farm-autopilot-problem', 'bn',
  'খামারে একবার দেখে আসার পরও পুকুরের অবস্থা বদলে যেতে পারে',
  'খামারে একবার দেখে আসার পরও পুকুরের অবস্থা বদলে যেতে পারে',
  'বাণিজ্যিক মাছের খামার, হ্যাচারি আর খামারগুচ্ছ।',
  'WorldFish ডিজিটাল মৎস্যচাষ নিয়ে কাজের তথ্য দেয়। One Fish আর xFishery-র মতো উদ্যোগও আছে। ইন্দোনেশিয়ার JALA আরেকটি উদাহরণ। সুযোগটা নির্ভরযোগ্য রিডিং আর মাঠের সাপোর্টে, শুধু সেন্সরের স্ক্রিনে নয়।',
  'যন্ত্র আর সেবার খরচ ওঠার মতো কাজে লাগে এমন সিদ্ধান্ত কি সতর্কতা থেকে আসবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'fish-farm-autopilot', 'fish-farm-autopilot-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'fish-farm-autopilot', 'en',
  'Spot pond problems before they get worse',
  'Help fish farms monitor water conditions and respond to useful alerts.',
  'Start with reliable water readings and warnings when conditions need attention. Work with a farm specialist to check sensors and decide what each alert should trigger. Later, add supervised control of equipment such as aerators, which put oxygen into the water. Keep a manual override.',
  'Charge for installation, maintenance and a fee per pond. Larger farms or farm groups are likely first customers.',
  '["Choose one farm and compare sensor readings with independent measurements. Agree the response to each alert.","Run beside the farm’s usual process for a production cycle. Record false alerts, repairs and actions taken.","Ask for a paid renewal after counting field visits and upkeep. Add equipment control only after safe supervised tests."]',
  'Alerts lead to useful action and the farm renews at a price that covers maintenance.',
  'Build a pond view using sample readings, alert history and staff responses. Test without controlling live equipment.',
  'Connects farm data to useful action, with maintenance built into the business model.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'fish-farm-autopilot', 'bn',
  'পুকুরের সমস্যা বড় হওয়ার আগেই ধরুন',
  'মাছের খামারে পানির অবস্থা দেখুন আর কাজে লাগে এমন সতর্কতা দিন।',
  'শুরুতে পানির নির্ভরযোগ্য রিডিং আর দরকারি সতর্কতা দিন। খামারের বিশেষজ্ঞকে নিয়ে সেন্সর মিলিয়ে দেখুন। কোন সতর্কতায় কী করবেন, ঠিক করুন। পরে মানুষের তত্ত্বাবধানে এয়ারেটরের মতো যন্ত্র চালানোর ব্যবস্থা যোগ করুন। এয়ারেটর পানিতে অক্সিজেন দেয়। হাতে নিয়ন্ত্রণের ব্যবস্থাও রাখুন।',
  'বসানো আর দেখভালের ফি নিন, সঙ্গে প্রতি পুকুরের নিয়মিত ফি। বড় খামার বা কয়েকটি খামার একসঙ্গে প্রথম কাস্টমার হতে পারে।',
  '["এক খামারে আলাদা যন্ত্র দিয়ে সেন্সরের রিডিং মিলিয়ে নিন। প্রতিটি সতর্কতায় কী করতে হবে, ঠিক করুন।","এক চাষচক্র খামারের আগের ব্যবস্থার পাশাপাশি চালান। ভুল সতর্কতা, মেরামত আর নেওয়া ব্যবস্থা লিখুন।","মাঠে যাওয়া আর দেখভালের খরচ ধরে ফি নিয়ে চুক্তি বাড়াতে বলুন। নিরাপদ পরীক্ষা শেষে তবেই যন্ত্র নিয়ন্ত্রণ যোগ করুন।"]',
  'সতর্কতা পেয়ে কাজে লাগার মতো ব্যবস্থা নেওয়া হচ্ছে। দেখভালের খরচ ওঠে এমন ফিতে খামার চুক্তি বাড়াচ্ছে।',
  'নমুনা রিডিং, সতর্কতা আর কর্মীরা কী করেছেন, তার স্ক্রিন বানান। চালু যন্ত্র নিয়ন্ত্রণ না করে পরীক্ষা করুন।',
  'খামারের তথ্য থেকে কাজের সিদ্ধান্ত নেওয়া যায়। যন্ত্রের দেখভালও ব্যবসার হিসাবে আছে।'
);

-- crop-loss-data
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'crop-loss-data-problem', 'crop-loss-data-problem', 'agriculture', '["anywhere"]',
  '[{"title":"Green Delta · Agricultural insurance","url":"https://green-delta.com/agri-insurance/","date":"2026-09-25","en":"Green Delta describes existing crop and climate insurance products and checking methods.","bn":"Green Delta চালু ফসল আর জলবায়ু বীমা ও যাচাইয়ের পদ্ধতি বর্ণনা করেছে।"},{"title":"World Bank: rural agri-entrepreneurs, 6 July 2026","url":"https://www.worldbank.org/en/news/feature/2026/07/06/a-global-farming-initiative-is-redefining-jobs-and-harvests-in-rural-bangladesh","date":"2026-07-06","en":"World Bank reporting describes Bangladesh’s agri-service hub model.","bn":"বিশ্বব্যাংকের লেখায় বাংলাদেশের কৃষিসেবা হাবের মডেল আছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'crop-loss-data-problem', 'en',
  'Weather data and damage on a small farm may not match',
  'Weather data and damage on a small farm may not match',
  'Licensed agricultural insurers, banks and farm-finance providers',
  'Green Delta already describes weather-index and field-checked agricultural insurance in Bangladesh. Satellite data is part of this market, not a new discovery. A useful product would improve a specific checking task with evidence from real farms.',
  'Can the data distinguish losses on nearby small plots well enough for an insurer to use?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'crop-loss-data-problem', 'bn',
  'আবহাওয়ার তথ্য আর ছোট জমির আসল ক্ষতি এক নাও হতে পারে',
  'আবহাওয়ার তথ্য আর ছোট জমির আসল ক্ষতি এক নাও হতে পারে',
  'বীমা কোম্পানি আর কৃষিতে ঋণ দেয় এমন প্রতিষ্ঠান।',
  'Green Delta বাংলাদেশে আবহাওয়ার সূচক আর মাঠের যাচাই ধরে কৃষিবীমার কথা বলেছে। এই বাজারে স্যাটেলাইট ডেটা আগেই ব্যবহৃত হয়। নতুন পণ্যের কাজ হবে আসল জমির প্রমাণ দিয়ে নির্দিষ্ট একটি যাচাই আরও ভালো করা।',
  'পাশাপাশি ছোট জমির ক্ষতি আলাদা করে বোঝার মতো নির্ভুল হবে কি এই তথ্য?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'crop-loss-data', 'crop-loss-data-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'crop-loss-data', 'en',
  'Help insurers check crop damage',
  'Combine satellite images and field checks into a clear record of affected farms.',
  'Pick one crop, hazard and area, such as flood damage to rice. Compare satellite and weather data with ground visits. Show the insurer which farms may be affected, how certain the estimate is and where a visit is still needed. Keep payout decisions with the licensed insurer.',
  'Charge insurers or farm-finance partners for data and checking tools. Start with a paid study before offering recurring reports.',
  '["Find an insurer with past loss records and permission to use them. Agree what a useful result would look like.","Test several seasons against independent field records. Count missed losses and false alarms on small plots.","Run a paid pilot alongside the insurer’s normal checks. Measure fieldwork saved and errors that could harm farmers."]',
  'The insurer pays for better checks, and errors stay within agreed limits.',
  'Make a sample map showing possible damage, confidence limits and cases needing a field visit.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'crop-loss-data', 'bn',
  'ফসলের ক্ষতি যাচাইয়ে বীমা কোম্পানিকে সাহায্য করুন',
  'স্যাটেলাইটের ছবি আর মাঠের তথ্য মিলিয়ে ক্ষতিগ্রস্ত জমির পরিষ্কার রেকর্ড দিন।',
  'এক ফসল, এক বিপদ আর এক এলাকা বাছুন, যেমন বন্যায় ধানের ক্ষতি। স্যাটেলাইট আর আবহাওয়ার তথ্য মাঠে গিয়ে পাওয়া তথ্যের সঙ্গে মেলান। কোন জমিতে ক্ষতি হতে পারে, ধারণা কতটা নিশ্চিত আর কোথায় গিয়ে দেখা দরকার, বীমা কোম্পানিকে জানান। ক্ষতিপূরণের সিদ্ধান্ত অনুমতিপ্রাপ্ত বীমা কোম্পানিই নেবে।',
  'ডেটা আর যাচাইয়ের টুলের ফি বীমা বা কৃষি অর্থায়নের পার্টনারের কাছ থেকে নিন। নিয়মিত রিপোর্টের আগে ফি নিয়ে একটি গবেষণা করুন।',
  '["পুরোনো ক্ষতির রেকর্ড আছে এমন বীমা কোম্পানি খুঁজুন। ব্যবহারের অনুমতি আর কাজে লাগে এমন ফলের মান ঠিক করুন।","কয়েক মৌসুমের তথ্য আলাদা মাঠের রেকর্ডের সঙ্গে পরীক্ষা করুন। ছোট জমিতে বাদ পড়া ক্ষতি আর ভুল সতর্কতা গুনুন।","আগের চেকের পাশাপাশি ফি নিয়ে পরীক্ষা করুন। মাঠে যাওয়া কত কমল আর কোন ভুলে কৃষকের ক্ষতি হতে পারে, দেখুন।"]',
  'ভালো যাচাইয়ের জন্য বীমা কোম্পানি ফি দিচ্ছে, আর ভুল ঠিক করা সীমার মধ্যে থাকছে।',
  'নমুনা মানচিত্রে সম্ভাব্য ক্ষতি, কতটা নিশ্চিত আর কোন জমিতে গিয়ে দেখা দরকার, দেখান।',
  ''
);

-- direct-export-operations
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'direct-export-operations-problem', 'direct-export-operations-problem', 'logistics', '["anywhere"]',
  '[{"title":"Bangladesh Bank FEPD-1 Circular 26, 30 July 2026","url":"https://www.bb.org.bd/mediaroom/circulars/fepd/jul302026fepd-126e.pdf","date":"2026-07-30","en":"July 2026 export rules; conditions vary by transaction.","bn":"জুলাই ২০২৬-এর রপ্তানি নিয়ম। লেনদেন অনুযায়ী শর্ত বদলায়।"},{"title":"Jetstream Africa: operations and trade-finance products","url":"https://jetstreamafrica.com","date":"2026-09-25","en":"An African operator describes trade operations and finance services.","bn":"আফ্রিকার একটি কোম্পানি বাণিজ্যের কাজ আর অর্থায়নের সেবা বর্ণনা করেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'direct-export-operations-problem', 'en',
  'Winning an overseas order is only the first step',
  'Winning an overseas order is only the first step',
  'Bangladeshi brands with existing products and overseas demand',
  'Bangladesh Bank updated export rules in July 2026, including arrangements for e-commerce. Conditions still depend on the shipment and payment route. Jetstream Africa shows how trade operations can be packaged as a service.',
  'Which product and destination leave enough margin after delivery, returns and payment costs?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'direct-export-operations-problem', 'bn',
  'বিদেশ থেকে অর্ডার পাওয়ার পরও অনেক কাজ বাকি থাকে',
  'বিদেশ থেকে অর্ডার পাওয়ার পরও অনেক কাজ বাকি থাকে',
  'বিদেশে বিক্রি শুরু করেছে এমন বাংলাদেশের ব্র্যান্ড।',
  'বাংলাদেশ ব্যাংক জুলাই ২০২৬-এ ই-কমার্সসহ রপ্তানির নিয়ম আপডেট করেছে। চালান আর পেমেন্টের পথ অনুযায়ী শর্ত আছে। আফ্রিকার Jetstream বাণিজ্যের কাজ একসঙ্গে সেবা হিসেবে দেওয়ার উদাহরণ।',
  'পৌঁছানো, ফেরত আর পেমেন্টের খরচ বাদ দিয়ে কোন পণ্য আর দেশে যথেষ্ট লাভ থাকবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'direct-export-operations', 'direct-export-operations-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'direct-export-operations', 'en',
  'Help Bangladeshi brands deliver overseas orders',
  'Handle the shipping and payment follow-up after a brand wins a foreign customer.',
  'Choose one product category and destination. Work with the brand’s authorised dealer bank and courier to confirm the payment route, documents, delivery cost and return rules. Track the order until the payment reaches the brand. Turn repeat work into software as volume grows.',
  'Charge per shipment or a monthly operations fee. Show shipping, taxes, returns and payment charges clearly.',
  '["Start with a brand that already has overseas buyers. Check the exact product and payment route with its bank and courier.","Complete a paid shipment and match every cost with the final payment. Work through a realistic return case too.","Run repeat orders. Check that the brand still earns enough after your fee and all other costs."]',
  'Brands keep using the service because repeat orders arrive and payments are accounted for.',
  'Build an order checklist with documents, delivery status, total cost, return steps and payment matching.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'direct-export-operations', 'bn',
  'দেশি ব্র্যান্ডের বিদেশি অর্ডার পৌঁছে দিতে সাহায্য করুন',
  'বাইরে কাস্টমার পাওয়ার পর পণ্য পাঠানো আর টাকা আসার হিসাব সামলান।',
  'এক ধরনের পণ্য আর একটি দেশ বাছুন। ব্র্যান্ডের বৈদেশিক মুদ্রায় লেনদেনের অনুমতিপ্রাপ্ত ব্যাংক আর কুরিয়ারের সঙ্গে পেমেন্টের পথ, কাগজ, খরচ আর ফেরতের নিয়ম মিলিয়ে নিন। অর্ডারের টাকা ব্র্যান্ডের কাছে আসা পর্যন্ত হিসাব রাখুন। অর্ডার বাড়লে একই কাজ সফটওয়্যারে আনুন।',
  'প্রতি চালান বা মাসিক কাজের ফি নিন। শিপিং, কর, ফেরত আর পেমেন্টের চার্জ পরিষ্কার দেখান।',
  '["আগেই বিদেশি কাস্টমার আছে এমন ব্র্যান্ড নিন। নির্দিষ্ট পণ্য আর পেমেন্টের পথ ব্যাংক ও কুরিয়ারের সঙ্গে মিলিয়ে নিন।","ফি নিয়ে এক চালান পাঠান। শেষ পেমেন্টের সঙ্গে সব খরচ মেলান। একটি বাস্তবসম্মত ফেরত অর্ডারের হিসাবও করুন।","একই কাজ বারবার চালান। আপনার ফি আর সব খরচের পর ব্র্যান্ডের যথেষ্ট লাভ থাকে কি না, দেখুন।"]',
  'অর্ডার ঠিকমতো পৌঁছাচ্ছে আর টাকার হিসাব মিলছে বলে ব্র্যান্ড সেবা নিচ্ছে।',
  'কাগজ, ডেলিভারি, মোট খরচ, ফেরতের ধাপ আর পেমেন্ট মেলানোর অর্ডার চেকলিস্ট বানান।',
  ''
);

-- forwarder-shipment-control
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'forwarder-shipment-control-problem', 'forwarder-shipment-control-problem', 'logistics', '["anywhere"]',
  '[{"title":"Bangladesh Bank FEPD-1 Circular 26, 30 July 2026","url":"https://www.bb.org.bd/mediaroom/circulars/fepd/jul302026fepd-126e.pdf","date":"2026-07-30","en":"July 2026 export rules; conditions vary by transaction.","bn":"জুলাই ২০২৬-এর রপ্তানি নিয়ম। লেনদেন অনুযায়ী শর্ত বদলায়।"},{"title":"World Bank: Bangladesh trade financing package, 23 April 2025","url":"https://www.worldbank.org/en/news/press-release/2025/04/23/world-bank-bangladesh-sign-850-million-financing-package-to-create-jobs-boost-trade-modernize-social-protection-system","date":"2025-04-23","en":"Trade-infrastructure investment provides context, not access to port data.","bn":"বাণিজ্যের অবকাঠামোতে বিনিয়োগের খবর। এতে বন্দরের ডেটা ব্যবহারের অনুমতি মেলে না।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'forwarder-shipment-control-problem', 'en',
  'Shipment work is split across messages and documents',
  'Shipment work is split across messages and documents',
  'Small and mid-sized freight forwarders and customs-support teams',
  'Bangladesh’s trade infrastructure and export rules are changing. Software can help teams manage their own work, but it does not automatically provide live customs or port data. Existing freight systems remain the comparison.',
  'Can this replace scattered work without becoming another system staff have to maintain?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'forwarder-shipment-control-problem', 'bn',
  'চালানের কাজ মেসেজ আর কাগজপত্রে ছড়িয়ে থাকে',
  'চালানের কাজ মেসেজ আর কাগজপত্রে ছড়িয়ে থাকে',
  'ছোট ফ্রেইট ফরওয়ার্ডার আর রপ্তানির কাজ সামলানো টিম।',
  'বাংলাদেশের বাণিজ্যব্যবস্থা আর রপ্তানির নিয়ম বদলাচ্ছে। সফটওয়্যার টিমের নিজের কাজ গুছিয়ে দিতে পারে। কিন্তু তাতে কাস্টমস বা বন্দরের লাইভ ডেটা নিজে থেকে পাওয়া যায় না। চালু ফ্রেইট সফটওয়্যারের সঙ্গে তুলনা করতে হবে।',
  'এটা কি ছড়ানো কাজের জায়গা নেবে, নাকি কর্মীদের আরেকটা সিস্টেম সামলাতে হবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'forwarder-shipment-control', 'forwarder-shipment-control-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'forwarder-shipment-control', 'en',
  'Keep freight teams on top of each shipment',
  'Put documents, deadlines and the next action in one place.',
  'Build a shared job record for a small freight-forwarding team. Show who is waiting for a document, which deadline is near and who must act next. Let customers see confirmed updates. Connect to tools the team already uses, rather than asking staff to enter everything twice.',
  'Charge a monthly fee by team size or shipment volume. Start with one repeat shipping workflow.',
  '["Follow ten completed jobs with a forwarder. Find repeated calls, missed handoffs and duplicate entry.","Test a simple shared job board on live work. Use only status data the team is allowed to access.","Run a paid month and compare staff effort and missed tasks. Verify any claimed savings against actual records."]',
  'The team uses it daily and pays because it reduces chasing and missed work.',
  'Build a sample shipment board with document status, deadlines, assigned staff and a customer update view.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'forwarder-shipment-control', 'bn',
  'ফ্রেইট টিমকে প্রতিটি চালানের কাজ গুছিয়ে দিন',
  'কাগজ, শেষ সময় আর পরের কাজ এক জায়গায় রাখুন।',
  'ছোট ফ্রেইট ফরওয়ার্ডিং টিমের জন্য শেয়ার করা কাজের রেকর্ড বানান। কোন কাগজের অপেক্ষা, কোন সময়সীমা কাছে আর পরের কাজ কার, দেখান। কাস্টমার নিশ্চিত খবর দেখতে পারবেন। একই তথ্য দুইবার লেখানোর বদলে টিমের চালু টুলের সঙ্গে যুক্ত করুন।',
  'টিমের আকার বা চালানের সংখ্যা ধরে মাসিক ফি নিন। বারবার হয় এমন এক ধরনের শিপিং কাজ দিয়ে শুরু করুন।',
  '["এক ফরওয়ার্ডারের শেষ হওয়া দশটি কাজ দেখুন। বারবার ফোন, বাদ পড়া দায়িত্ব আর একই তথ্য দুইবার লেখা খুঁজুন।","আসল কাজে সহজ বোর্ড পরীক্ষা করুন। টিমের দেখার অনুমতি আছে এমন স্ট্যাটাস ডেটাই নিন।","এক মাস ফি নিয়ে চালান। কাজের সময় আর বাদ পড়া কাজ আগের সঙ্গে মেলান। সাশ্রয়ের দাবি আসল রেকর্ড দিয়ে দেখুন।"]',
  'খোঁজ নেওয়া আর বাদ পড়া কাজ কমছে বলে টিম প্রতিদিন ব্যবহার করছে, ফিও দিচ্ছে।',
  'কাগজের অবস্থা, সময়সীমা, দায়িত্বে থাকা লোক আর কাস্টমারের আপডেটসহ নমুনা চালান বোর্ড বানান।',
  ''
);

-- shared-parcel-returns
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'shared-parcel-returns-problem', 'shared-parcel-returns-problem', 'logistics', '["anywhere"]',
  '[{"title":"Accelerating Asia: DIGIBOX cohort 13 founder story, 2026","url":"https://www.acceleratingasia.com/latest-news/acceleratingasia-c13-founderstory-digibox","date":"2026-09-25","en":"Accelerating Asia describes DIGIBOX’s Bangladesh operations and fundraising.","bn":"Accelerating Asia বাংলাদেশে DIGIBOX-এর কাজ আর ফান্ডিংয়ের কথা বলেছে।"},{"title":"Accelerating Asia: problems across Asia, 2026 cohort-14 cycle","url":"https://www.acceleratingasia.com/latest-news/acceleratingasia-whos-building-this","date":"2026-09-25","en":"Regional founder observations; useful leads rather than Bangladesh market measurements.","bn":"এই অঞ্চলের ফাউন্ডারদের অভিজ্ঞতা। ধারণা খুঁজতে কাজে লাগে, বাংলাদেশের বাজারের মাপ নয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-parcel-returns-problem', 'en',
  'Failed deliveries and returns add extra trips',
  'Failed deliveries and returns add extra trips',
  'Couriers, e-commerce brands and high-volume neighbourhood host locations',
  'DIGIBOX already operates parcel lockers in Bangladesh and has raised funding, according to Accelerating Asia. That makes it a competitor and a possible partner. A new network needs a clear location or service gap.',
  'Do convenient pickup points reduce total effort, or just shift extra travel onto shoppers?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-parcel-returns-problem', 'bn',
  'ব্যর্থ ডেলিভারি আর ফেরত অর্ডারে বাড়তি যাতায়াত লাগে',
  'ব্যর্থ ডেলিভারি আর ফেরত অর্ডারে বাড়তি যাতায়াত লাগে',
  'অনলাইন বিক্রেতা, কুরিয়ার আর পার্সেল সংগ্রহ করতে চান এমন কাস্টমার।',
  'Accelerating Asia জানিয়েছে, বাংলাদেশে DIGIBOX পার্সেল লকার চালায় আর ফান্ডিং পেয়েছে। তারা প্রতিযোগী, আবার সহযোগীও হতে পারে। নতুন নেটওয়ার্কের জন্য নির্দিষ্ট এলাকা বা সেবার ঘাটতি লাগবে।',
  'পিকআপ পয়েন্টে মোট ঝামেলা কমবে, নাকি কুরিয়ারের যাতায়াত কাস্টমারের ওপর পড়বে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'shared-parcel-returns', 'shared-parcel-returns-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-parcel-returns', 'en',
  'Let shoppers collect and return parcels at nearby shops',
  'Use staffed local shops as shared parcel points for couriers and online stores.',
  'Start with a few host shops on one courier route. Record who handed over each parcel and give customers a pickup code. Agree how returns are checked and when the merchant approves a refund. Add lockers only where parcel volume makes them worthwhile.',
  'Charge couriers or merchants per completed handoff and share a fee with host shops. Price storage, losses and support into the service.',
  '["Agree a paid trial with a courier and several host shops. Set storage limits, identity checks and responsibility for lost parcels.","Run one small route, including returns and uncollected parcels. Track every handoff.","Compare total cost, failed deliveries and customer travel time with home delivery. Expand only where people use it again."]',
  'Repeat users and enough parcels per stop cover host fees, transport and support.',
  'Create a sample parcel log with pickup codes, handoff times, return checks and unresolved cases.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-parcel-returns', 'bn',
  'কাছের দোকান থেকে পার্সেল নেওয়া আর ফেরত দেওয়ার ব্যবস্থা করুন',
  'কুরিয়ার আর অনলাইন শপের জন্য স্থানীয় দোকানে শেয়ার করা পার্সেল পয়েন্ট করুন।',
  'এক কুরিয়ার রুটে কয়েকটি দোকান দিয়ে শুরু করুন। কে কাকে পার্সেল দিল, লিখে রাখুন। কাস্টমারকে নেওয়ার কোড দিন। ফেরত পণ্য কীভাবে চেক হবে আর কখন বিক্রেতা টাকা ফেরত দেবেন, ঠিক করুন। যথেষ্ট পার্সেল এলে তবেই লকার বসান।',
  'শেষ হওয়া প্রতিটি হস্তান্তরে কুরিয়ার বা বিক্রেতার কাছ থেকে ফি নিন। দোকানকে ভাগ দিন। রাখা, হারানো আর সাপোর্টের খরচ দামে ধরুন।',
  '["কুরিয়ার আর কয়েক দোকানের সঙ্গে ফি নিয়ে পরীক্ষা ঠিক করুন। রাখার সীমা, পরিচয় চেক আর হারালে দায় কার, লিখুন।","এক ছোট রুট চালান। ফেরত আর নিতে না আসা পার্সেলও রাখুন। প্রতিটি হস্তান্তর লিখে রাখুন।","বাসায় ডেলিভারির সঙ্গে মোট খরচ, ব্যর্থ ডেলিভারি আর কাস্টমারের যাতায়াতের সময় মেলান। আবার ব্যবহার হলে তবেই বাড়ান।"]',
  'মানুষ আবার আসছে, আর প্রতি পয়েন্টের যথেষ্ট পার্সেলে দোকান, পরিবহন আর সাপোর্টের খরচ উঠছে।',
  'কোড, হস্তান্তরের সময়, ফেরতের চেক আর অমীমাংসিত পার্সেলের নমুনা খাতা বানান।',
  ''
);

-- pooled-employee-transport
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'pooled-employee-transport-problem', 'pooled-employee-transport-problem', 'logistics', '["anywhere"]',
  '[{"title":"Accelerating Asia: problems across Asia, 2026 cohort-14 cycle","url":"https://www.acceleratingasia.com/latest-news/acceleratingasia-whos-building-this","date":"2026-09-25","en":"Regional founder observations; useful leads rather than Bangladesh market measurements.","bn":"এই অঞ্চলের ফাউন্ডারদের অভিজ্ঞতা। ধারণা খুঁজতে কাজে লাগে, বাংলাদেশের বাজারের মাপ নয়।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'pooled-employee-transport-problem', 'en',
  'Employers can have overlapping staff travel needs',
  'Employers can have overlapping staff travel needs',
  'Offices, hospitals and other employers with overlapping commuting routes',
  'Accelerating Asia describes commuting problems and companies working on them in the region. Shared routes are worth testing where work schedules overlap. Dhaka traffic, detours and backup transport must be included in the economics.',
  'Can several employers fill one route without making trips too long for their staff?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'pooled-employee-transport-problem', 'bn',
  'কাছের অফিসগুলোর কর্মীদের যাতায়াতে মিল থাকতে পারে',
  'কাছের অফিসগুলোর কর্মীদের যাতায়াতে মিল থাকতে পারে',
  'কাছাকাছি অফিস আর তাদের কর্মীরা।',
  'Accelerating Asia এই অঞ্চলে যাতায়াতের সমস্যা আর তা নিয়ে কাজ করা কোম্পানির কথা বলেছে। সময় মিললে শেয়ার করা রুট পরীক্ষা করা যায়। ঢাকার যানজট, ঘুরে যাওয়া আর বিকল্প গাড়ির খরচ হিসাব করতে হবে।',
  'কর্মীদের যাত্রা বেশি লম্বা না করেই কয়েক অফিস মিলে এক রুট ভরতে পারবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'pooled-employee-transport', 'pooled-employee-transport-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'pooled-employee-transport', 'en',
  'Help nearby employers share staff transport',
  'Combine regular work trips into reliable routes with fewer empty seats.',
  'Find employers with similar shift times and staff living near each other. Use contracted vehicles on fixed routes, with clear pickup times and backup arrangements. Share costs across employers. Start with one route before building a citywide service.',
  'Charge employers for reserved seats or a monthly route contract. Include empty trips, backup vehicles and driver costs.',
  '["Map staff locations and shift times with consent. Compare the proposed route with current travel time and spending.","Get employer commitments and check the operator’s licences, insurance and safety arrangements.","Run a paid route. Track filled seats, punctuality, rider feedback and the full cost per trip."]',
  'Riders keep using the service and employer fees cover reliable operations.',
  'Create a route plan with sample pickup areas, shift times, seat demand and backup costs.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'pooled-employee-transport', 'bn',
  'কাছের অফিসগুলোকে কর্মীদের গাড়ি ভাগ করে নিতে সাহায্য করুন',
  'একই সময়ের যাতায়াত এক রুটে এনে খালি সিট কমান।',
  'একই রকম শিফট আর কাছাকাছি এলাকায় থাকা কর্মী আছে এমন অফিস খুঁজুন। চুক্তির গাড়িতে নির্দিষ্ট রুট চালান। ওঠার সময় আর গাড়ি নষ্ট হলে বিকল্প ঠিক রাখুন। কয়েক অফিস মিলে খরচ দেবে। শহরজুড়ে যাওয়ার আগে এক রুটে কাজ করুন।',
  'রাখা সিট বা মাসিক রুটের চুক্তিতে অফিস ফি দেবে। খালি ফেরার ট্রিপ, বিকল্প গাড়ি আর চালকের খরচ ধরুন।',
  '["সম্মতি নিয়ে কর্মীদের এলাকা আর শিফট মেলান। আগের যাতায়াতের সময় ও খরচের সঙ্গে নতুন রুট তুলনা করুন।","অফিসের চুক্তি নিন। পরিবহন অপারেটরের লাইসেন্স, বীমা আর নিরাপত্তা চেক করুন।","ফি নিয়ে রুট চালান। ভরা সিট, সময়মতো পৌঁছানো, কর্মীদের মতামত আর পুরো খরচ দেখুন।"]',
  'কর্মীরা সেবা নিচ্ছেন, আর অফিসের ফিতে নির্ভরযোগ্যভাবে রুট চালানো যাচ্ছে।',
  'নমুনা এলাকা, শিফট, সিটের চাহিদা আর বিকল্প গাড়ির খরচ দিয়ে রুট বানান।',
  ''
);

-- tour-operator-software
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'tour-operator-software-problem', 'tour-operator-software-problem', 'travel', '["anywhere"]',
  '[{"title":"UNLEASH: Wander Woman award, 2021","url":"https://unleash.org/interview-wander-woman-biggest-winner-unleash-plus-2021/","date":"2026-09-25","en":"A Bangladesh travel company’s award story from 2021, not a recent funding round.","bn":"বাংলাদেশের ট্রাভেল কোম্পানির ২০২১ সালের পুরস্কারের খবর, সাম্প্রতিক ফান্ডিং নয়।"},{"title":"Wander Woman: current travel platform","url":"https://hellowanderwoman.com/jobs","date":"2026-09-25","en":"The operator’s own description of its travel platform.","bn":"অপারেটরের নিজের ট্রাভেল প্ল্যাটফর্মের বর্ণনা।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'tour-operator-software-problem', 'en',
  'A group trip involves several bookings that must agree',
  'A group trip involves several bookings that must agree',
  'Small tour operators, experience hosts and agencies selling their trips',
  'Wander Woman shows that organised travel products already exist in Bangladesh. Its UNLEASH award was in 2021. The software opportunity is a specific daily task operators will pay to simplify, not proof that tourism needs another booking site.',
  'Which job is poorly served by current travel tools, and is demand steady enough for a subscription?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'tour-operator-software-problem', 'bn',
  'এক গ্রুপ ট্যুরের কয়েক ধরনের বুকিং একসঙ্গে মিলতে হয়',
  'এক গ্রুপ ট্যুরের কয়েক ধরনের বুকিং একসঙ্গে মিলতে হয়',
  'গ্রুপ ট্যুর চালায় এমন অপারেটর আর বিক্রি করে এমন এজেন্সি।',
  'Wander Woman দেখায়, বাংলাদেশে সংগঠিত ভ্রমণসেবা আগেই আছে। তারা UNLEASH পুরস্কার পায় ২০২১ সালে। সফটওয়্যারের সুযোগটা অপারেটরের নির্দিষ্ট দৈনন্দিন কাজ সহজ করার মধ্যে। আরেকটা বুকিং সাইট দরকার, তার প্রমাণ এটা নয়।',
  'চালু ট্রাভেল টুলে কোন কাজ ভালো হয় না? সারা বছর মাসিক ফি দেওয়ার মতো চাহিদা থাকবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'tour-operator-software', 'tour-operator-software-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'tour-operator-software', 'en',
  'Give tour operators one place to run each trip',
  'Keep seats, rooms, guides, payments and cancellations in sync.',
  'Choose one recurring trip format, such as a weekend group tour. Let the operator confirm suppliers and manage seat availability in one place. Agencies can check what is still bookable, while travellers receive a clear confirmed itinerary. Start with operations, not another travel marketplace.',
  'Charge operators a monthly fee or a fee per departure. Keep supplier and payment costs separate.',
  '["Follow three departures with an operator. Find where double bookings, missing payments or supplier checks cause extra work.","Run a simple booking board with one operator and one selling agency. Include cancellations and refunds.","Ask for a paid month. Compare staff time and errors with the old process before adding more trip types."]',
  'Operators keep their real bookings in the tool and pay to use it again.',
  'Build a trip board with available seats, supplier confirmations, deposits, refunds and a traveller list.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'tour-operator-software', 'bn',
  'ট্যুর অপারেটরের পুরো ট্রিপ এক জায়গায় গুছিয়ে দিন',
  'সিট, রুম, গাইড, টাকা আর বাতিল বুকিংয়ের হিসাব মিলিয়ে রাখুন।',
  'সাপ্তাহিক ছুটির গ্রুপ ট্যুরের মতো এক ধরনের ট্রিপ বাছুন। অপারেটর এক জায়গায় সাপ্লায়ার নিশ্চিত করবেন আর খালি সিট দেখবেন। এজেন্সি কী বুক করা যাবে দেখবে, ভ্রমণকারী পাবেন নিশ্চিত ভ্রমণসূচি। শুরুতে ট্রিপ চালানোর কাজ ধরুন, আরেকটা ট্রাভেল মার্কেটপ্লেস নয়।',
  'অপারেটরের কাছ থেকে মাসিক বা প্রতি ট্রিপের ফি নিন। সাপ্লায়ার আর পেমেন্টের খরচ আলাদা রাখুন।',
  '["এক অপারেটরের তিনটি ট্রিপ দেখুন। ডাবল বুকিং, বাকি টাকা আর সাপ্লায়ারের খবর নিতে কোথায় কাজ বাড়ে, খুঁজুন।","এক অপারেটর আর এক বিক্রয় এজেন্সির সঙ্গে বুকিং বোর্ড চালান। বাতিল আর টাকা ফেরতও রাখুন।","এক মাসের ফি চান। আরও ট্রিপ যোগ করার আগে আগের ব্যবস্থার সঙ্গে সময় আর ভুল মেলান।"]',
  'অপারেটর আসল বুকিং টুলে রাখছেন আর আবার ব্যবহারের ফি দিচ্ছেন।',
  'খালি সিট, সাপ্লায়ারের সম্মতি, অগ্রিম, ফেরত আর যাত্রীর তালিকাসহ ট্রিপ বোর্ড বানান।',
  ''
);

-- solar-irrigation-control
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'solar-irrigation-control-problem', 'solar-irrigation-control-problem', 'energy', '["anywhere"]',
  '[{"title":"IDCOL: solar irrigation programme","url":"https://idcol.org/idcol_new/public/renewable/solar-irrigation-program","date":"2026-09-25","en":"IDCOL describes solar irrigation sold as a service.","bn":"IDCOL সেবা হিসেবে সোলার সেচ দেওয়ার মডেল বর্ণনা করেছে।"},{"title":"CGIAR: alternate wetting and drying field evidence","url":"https://ccafs.cgiar.org/outcomes/putting-alternate-wetting-and-drying-awd-map-globally-and-nationally","date":"2026-09-25","en":"Research on careful irrigation includes Bangladesh; outcomes depend on local practice.","bn":"সাবধানে সেচ দেওয়ার গবেষণায় বাংলাদেশও আছে। ফল স্থানীয় চাষের ওপর নির্ভর করে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'solar-irrigation-control-problem', 'en',
  'Solar irrigation also needs dependable service operations',
  'Solar irrigation also needs dependable service operations',
  'Operators managing solar irrigation pumps and farmer service groups',
  'IDCOL describes a fee-for-service solar irrigation model. CGIAR’s work on careful irrigation supports testing water-management practices. Better scheduling should help use existing pumps well, rather than encourage unnecessary groundwater use.',
  'Who benefits from less water use and fewer delays, and will that buyer pay for the system?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'solar-irrigation-control-problem', 'bn',
  'সোলার সেচে পাম্পের পাশাপাশি নিয়মিত সেবা গুছানোও দরকার',
  'সোলার সেচে পাম্পের পাশাপাশি নিয়মিত সেবা গুছানোও দরকার',
  'সোলার সেচ পাম্পের অপারেটর আর তাঁদের কৃষকেরা।',
  'IDCOL ফি নিয়ে সোলার সেচ দেওয়ার মডেল বর্ণনা করেছে। CGIAR-এর সেচের কাজ দেখে পানি ব্যবস্থাপনা পরীক্ষা করা যায়। ভালো সময়সূচি চালু পাম্পের কাজে লাগুক, অপ্রয়োজনে আরও ভূগর্ভের পানি তোলার কারণ যেন না হয়।',
  'কম পানি আর কম দেরির সুবিধা কে পাবেন? সেই পক্ষ কি সফটওয়্যারের ফি দেবে?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'solar-irrigation-control', 'solar-irrigation-control-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'solar-irrigation-control', 'en',
  'Help solar pump operators plan irrigation',
  'Keep water requests, pump schedules and payments in one simple system.',
  'Work with an existing solar irrigation operator. Record who needs water, when the pump can serve them and the agreed charge. Give farmers clear service times and help staff track collections and faults. The system should keep working when the internet drops.',
  'Charge the operator a seasonal or monthly fee. Add equipment monitoring only when the benefit covers installation and upkeep.',
  '["Record one pump’s current queue, charges, breakdowns and collection work. Ask farmers what causes delays.","Run a paid trial beside the old process for an irrigation season. Work with an agriculture specialist on water needs.","Compare service reliability, water use and full operating cost. Ask the operator to renew."]',
  'Farmers get a dependable schedule and the operator saves enough work to keep paying.',
  'Make an offline-ready schedule with requests, agreed charges, payments and maintenance notes.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'solar-irrigation-control', 'bn',
  'সোলার পাম্পের সেচের সময় আর হিসাব গুছিয়ে দিন',
  'পানির অনুরোধ, পাম্পের সময় আর পেমেন্ট এক সহজ সিস্টেমে রাখুন।',
  'চালু সোলার সেচ অপারেটরের সঙ্গে কাজ করুন। কার পানি দরকার, কখন পাম্প দেওয়া যাবে আর ঠিক করা ফি কত, লিখে রাখুন। কৃষককে পরিষ্কার সময় দিন। কর্মীদের টাকা তোলা আর সমস্যা দেখার কাজে সাহায্য করুন। ইন্টারনেট না থাকলেও সিস্টেম চলবে।',
  'মৌসুম বা মাস ধরে অপারেটরের ফি নিন। বসানো আর দেখভালের খরচ উঠলেই যন্ত্রের অবস্থা দেখার সুবিধা যোগ করুন।',
  '["এক পাম্পের সিরিয়াল, ফি, নষ্ট হওয়া আর টাকা তোলার কাজ লিখুন। দেরি কেন হয়, কৃষকদের জিজ্ঞেস করুন।","এক সেচ মৌসুম আগের ব্যবস্থার পাশে ফি নিয়ে চালান। পানির চাহিদা নিয়ে কৃষি বিশেষজ্ঞের সঙ্গে কাজ করুন।","সময়মতো সেবা, পানির ব্যবহার আর পুরো খরচ মেলান। অপারেটরকে চুক্তি বাড়াতে বলুন।"]',
  'কৃষক ঠিক সময় জানছেন আর অপারেটরের এতটা কাজ বাঁচছে যে ফি দিয়ে যাচ্ছেন।',
  'ইন্টারনেট ছাড়াও চলে এমন অনুরোধ, সময়, ঠিক করা ফি, পেমেন্ট আর মেরামতের খাতা বানান।',
  ''
);

-- fleet-depot-electrification
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'fleet-depot-electrification-problem', 'fleet-depot-electrification-problem', 'energy', '["anywhere"]',
  '[{"title":"BasiGo: school-bus delivery, 3 March 2026","url":"https://www.basi-go.com/in-the-news/school-of-nations-acquires-electric-school-buses-from-basigo-making-it-the-first-school-in-kenya-to-transition-to-electric-mobility","date":"2026-03-03","en":"A first electric school bus was delivered in Kenya in March 2026, within a larger planned order.","bn":"বড় একটি পরিকল্পিত অর্ডারের প্রথম বৈদ্যুতিক স্কুলবাস কেনিয়ায় দেওয়া হয় মার্চ ২০২৬-এ।"},{"title":"Cassetex: USD 1.6 million funding announcement, historical","url":"https://www.cassetex.com/cassetex-secures-16m-investment","date":"2026-09-25","en":"A company announcement describes battery swapping and funding.","bn":"কোম্পানির ঘোষণায় ব্যাটারি বদলের সেবা আর ফান্ডিংয়ের কথা আছে।"},{"title":"SOLshare: distributed-energy and mobility products","url":"https://solshare.com","date":"2026-09-25","en":"SOLshare describes its solar, storage and mobility products.","bn":"SOLshare সোলার, বিদ্যুৎ জমা রাখা আর পরিবহনের পণ্য বর্ণনা করেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'fleet-depot-electrification-problem', 'en',
  'Buying an electric vehicle does not solve fleet operations',
  'Buying an electric vehicle does not solve fleet operations',
  'School-bus, employee-transport and scheduled delivery fleet operators',
  'Kenya’s BasiGo delivered a first electric bus to a school in March 2026. Cassetex and SOLshare work on electric mobility in Bangladesh. These are useful models, but local traffic, tariffs and financing decide whether a route works.',
  'Can the service meet the customer’s daily needs at a competitive full cost?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'fleet-depot-electrification-problem', 'bn',
  'বৈদ্যুতিক গাড়ি কিনলেই বহর চালানোর সব কাজ মেটে না',
  'বৈদ্যুতিক গাড়ি কিনলেই বহর চালানোর সব কাজ মেটে না',
  'ডেলিভারি, স্কুল বা কর্মী পরিবহনের গাড়ি চালায় এমন প্রতিষ্ঠান।',
  'কেনিয়ায় BasiGo মার্চ ২০২৬-এ একটি স্কুলে প্রথম বৈদ্যুতিক বাস দিয়েছে। বাংলাদেশে Cassetex আর SOLshare বৈদ্যুতিক পরিবহন নিয়ে কাজ করে। মডেলগুলো কাজে লাগতে পারে, তবে এখানকার যানজট, বিদ্যুতের দাম আর অর্থায়নেই রুটের হিসাব ঠিক হবে।',
  'পুরো খরচে অন্য বিকল্পের সঙ্গে পাল্লা দিয়ে কাস্টমারের দৈনিক কাজ করা যাবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'fleet-depot-electrification', 'fleet-depot-electrification-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'fleet-depot-electrification', 'en',
  'Help fleets switch a regular route to electric vehicles',
  'Bring vehicles, depot charging and maintenance together around a predictable daily route.',
  'Choose a delivery team or staff bus with repeat trips and a fixed place to park. Work with partners who supply vehicles, chargers and finance. Start with one vehicle and a backup plan. Prove that the whole service works before taking on more vehicles.',
  'Charge for setup and ongoing fleet support. A partner can finance vehicles; your fee must cover maintenance and promised service levels.',
  '["Measure a real route with passengers or cargo. Get written vehicle, charger, finance and service quotes.","Compare total costs, including batteries, backup transport, insurance and downtime. Confirm site power and vehicle approvals.","Run a paid trial with trained operators. Add more vehicles only after the route meets the agreed cost and service targets."]',
  'The customer commits to more vehicles because measured costs and reliability work for the route.',
  'Build a route-cost model using real quotes and clearly labelled assumptions about distance, charging and downtime.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'fleet-depot-electrification', 'bn',
  'নিয়মিত রুটে বৈদ্যুতিক গাড়ি চালাতে সাহায্য করুন',
  'গাড়ি, গ্যারেজে চার্জ আর মেরামত একসঙ্গে গুছিয়ে দিন।',
  'নিয়মিত ট্রিপ আর নির্দিষ্ট পার্কিং আছে এমন ডেলিভারি বা কর্মী পরিবহনের টিম বাছুন। গাড়ি, চার্জিং আর অর্থায়নের পার্টনার নিয়ে বদলের পরিকল্পনা করুন। এক গাড়ি আর বিকল্প ব্যবস্থা দিয়ে শুরু করুন। পুরো বহর নেওয়ার আগে সেবাটা চলে কি না, দেখুন।',
  'সেটআপ আর নিয়মিত বহর দেখভালের ফি নিন। পার্টনার গাড়িতে অর্থায়ন করতে পারে। আপনার ফিতে মেরামত আর প্রতিশ্রুত সেবার খরচ উঠতে হবে।',
  '["যাত্রী বা মালসহ আসল রুট মাপুন। গাড়ি, চার্জার, অর্থায়ন আর সেবার লিখিত দাম নিন।","ব্যাটারি, বিকল্প পরিবহন, বীমা আর বন্ধ থাকার সময়সহ খরচ মেলান। সাইটের বিদ্যুৎ আর গাড়ির অনুমোদন চেক করুন।","দক্ষ অপারেটর দিয়ে ফি নিয়ে পরীক্ষা চালান। ঠিক করা খরচ আর নির্ভরযোগ্যতার লক্ষ্য মিটলেই বাড়ান।"]',
  'মাপা খরচ আর নির্ভরযোগ্যতা রুটে কাজ করছে বলে কাস্টমার আরও গাড়ি নিতে রাজি হচ্ছেন।',
  'আসল দামের প্রস্তাব দিয়ে রুটের খরচের হিসাব বানান। দূরত্ব, চার্জ আর বন্ধ থাকার সময়ের অনুমান আলাদা দেখান।',
  ''
);

-- distributed-energy-orchestration
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'distributed-energy-orchestration-problem', 'distributed-energy-orchestration-problem', 'energy', '["anywhere"]',
  '[{"title":"SOLshare: distributed-energy and mobility products","url":"https://solshare.com","date":"2026-09-25","en":"SOLshare describes its solar, storage and mobility products.","bn":"SOLshare সোলার, বিদ্যুৎ জমা রাখা আর পরিবহনের পণ্য বর্ণনা করেছে।"},{"title":"Cassetex: USD 1.6 million funding announcement, historical","url":"https://www.cassetex.com/cassetex-secures-16m-investment","date":"2026-09-25","en":"A company announcement describes battery swapping and funding.","bn":"কোম্পানির ঘোষণায় ব্যাটারি বদলের সেবা আর ফান্ডিংয়ের কথা আছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'distributed-energy-orchestration-problem', 'en',
  'Solar, storage and charging may run as separate systems',
  'Solar, storage and charging may run as separate systems',
  'Property groups, campuses and commercial energy-service operators',
  'SOLshare and Cassetex show local activity connecting energy and mobility. A new product needs a clear integration gap. Its first business case should work within a customer’s site, without assuming future income from trading electricity with the grid.',
  'Can the controls deliver enough value after equipment integration, maintenance and battery wear?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'distributed-energy-orchestration-problem', 'bn',
  'সোলার, ব্যাটারি আর চার্জিং আলাদা ব্যবস্থায় চলতে পারে',
  'সোলার, ব্যাটারি আর চার্জিং আলাদা ব্যবস্থায় চলতে পারে',
  'ভবনগুচ্ছ, ক্যাম্পাস আর বাণিজ্যিক জ্বালানি সেবার অপারেটর।',
  'SOLshare আর Cassetex দেশে জ্বালানি ও পরিবহন যুক্ত করার কাজ করছে। নতুন পণ্যের জন্য সংযোগে নির্দিষ্ট ঘাটতি লাগবে। ভবিষ্যতে গ্রিডে বিদ্যুৎ বিক্রির আয় ধরে নয়, কাস্টমারের নিজের সাইটের হিসাবেই প্রথম ব্যবসাটা চলতে হবে।',
  'যন্ত্র যুক্ত করা, দেখভাল আর ব্যাটারির ক্ষয় ধরেও যথেষ্ট সুবিধা পাওয়া যাবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'distributed-energy-orchestration', 'distributed-energy-orchestration-problem', 'software', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'distributed-energy-orchestration', 'en',
  'Help buildings use solar and batteries together',
  'Plan when to charge batteries and run flexible equipment at one site.',
  'Use a building’s actual power needs to plan when solar power is used and batteries are charged. Some equipment, such as car chargers, can run at different times. First, show staff a suggested schedule. Skilled engineers can later add controls that staff can override. Prove it at one site before adding more.',
  'Charge for setup and ongoing checks or controls. If the fee depends on savings, measure them after the cost of service and battery wear.',
  '["Find a site with compatible equipment and get permission to study its power-use records.","Test schedules without controlling live equipment. Include outages, battery limits and the site’s actual electricity charges.","Run a supervised paid pilot. Compare bills, reliability and battery use with an agreed baseline."]',
  'The site pays because the measured benefit exceeds installation and ongoing costs.',
  'Build a model with sample power use, solar output, battery limits and suggested charge times.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'distributed-energy-orchestration', 'bn',
  'ভবনে সোলার আর ব্যাটারি একসঙ্গে কাজে লাগান',
  'কখন ব্যাটারি চার্জ হবে আর কোন যন্ত্র চালানো যাবে, তা গুছিয়ে দিন।',
  'ভবনের আসল চাহিদা দেখে সোলার, ব্যাটারি আর সময় বদলে চালানো যায় এমন যন্ত্রের পরিকল্পনা করুন, যেমন গাড়ির চার্জার। প্রথমে কর্মীদের একটি সময়সূচি দেখান। পরে দক্ষ ইঞ্জিনিয়ারদের টিম সীমিত নিয়ন্ত্রণ যোগ করতে পারে, হাতে চালানোর ব্যবস্থাসহ। এক সাইটে কাজ হলে তবেই আরও সাইট নিন।',
  'সেটআপ আর নিয়মিত পর্যবেক্ষণ বা নিয়ন্ত্রণের ফি নিন। ফলের ভিত্তিতে ফি হলে ব্যাটারির ক্ষয় আর সেবার খরচ বাদ দিয়ে হিসাব করুন।',
  '["একসঙ্গে কাজ করে এমন যন্ত্র আছে, এমন সাইট খুঁজুন। বিদ্যুৎ ব্যবহারের রেকর্ড দেখার অনুমতি নিন।","চালু যন্ত্র না চালিয়ে সময়সূচি পরীক্ষা করুন। বিদ্যুৎ চলে যাওয়া, ব্যাটারির সীমা আর আসল বিদ্যুৎ চার্জ ধরুন।","তত্ত্বাবধানে ফি নিয়ে পরীক্ষা করুন। আগে ঠিক করা হিসাবের সঙ্গে বিল, নির্ভরযোগ্যতা আর ব্যাটারির ব্যবহার মেলান।"]',
  'বসানো আর নিয়মিত খরচের চেয়ে মাপা সুবিধা বেশি হওয়ায় সাইটের মালিক ফি দিচ্ছেন।',
  'নমুনা চাহিদা, সোলারের উৎপাদন, ব্যাটারির সীমা আর চার্জের সময় নিয়ে সিমুলেটর বানান।',
  ''
);

-- underwater-inspection-robotics
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'underwater-inspection-robotics-problem', 'underwater-inspection-robotics-problem', 'logistics', '["anywhere"]',
  '[{"title":"Startup Bangladesh: Dubotech portfolio profile","url":"https://www.startupbangladesh.vc/portfolio/dubotech-digital","date":"2026-09-25","en":"Startup Bangladesh lists Dubotech in its portfolio.","bn":"Startup Bangladesh পোর্টফোলিওতে Dubotech-এর নাম রেখেছে।"},{"title":"Dubotech: modular underwater inspection case, 7 September 2026","url":"https://dubotech.com/news/dual-use-rov-with-modular-sensor-integration-for-naval-operations","date":"2026-09-25","en":"Dubotech describes underwater sensing in difficult visibility conditions.","bn":"Dubotech কম দেখা যায় এমন পানির নিচে সেন্সর ব্যবহারের কথা বলেছে।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'underwater-inspection-robotics-problem', 'en',
  'Muddy water can make underwater inspection difficult',
  'Muddy water can make underwater inspection difficult',
  'Civilian port operators, vessel owners, bridge contractors and water-infrastructure operators',
  'Startup Bangladesh lists Dubotech in its portfolio, and Dubotech describes local underwater sensing work. Local capability already exists. The opportunity is a useful inspection service or specialised tool that performs well in difficult water.',
  'Will the data answer the owner’s maintenance question at an acceptable total cost?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'underwater-inspection-robotics-problem', 'bn',
  'ঘোলা পানিতে নিচের কাঠামো পরীক্ষা করা কঠিন',
  'ঘোলা পানিতে নিচের কাঠামো পরীক্ষা করা কঠিন',
  'বেসামরিক বন্দর, জাহাজ, সেতু আর পানি ব্যবস্থার অপারেটর।',
  'Startup Bangladesh-এর পোর্টফোলিওতে Dubotech আছে। Dubotech দেশে পানির নিচে সেন্সর নিয়ে কাজের কথাও বলেছে। তাই স্থানীয় দক্ষতা আগেই আছে। সুযোগটা কঠিন পানিতে কাজে লাগে এমন পরীক্ষা বা নির্দিষ্ট টুলে।',
  'গ্রহণযোগ্য মোট খরচে মালিকের মেরামতসংক্রান্ত প্রশ্নের উত্তর এই তথ্য দিতে পারবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'underwater-inspection-robotics', 'underwater-inspection-robotics-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'underwater-inspection-robotics', 'en',
  'Check underwater structures with a robot',
  'Help owners see what needs fixing in places people cannot easily reach.',
  'Work with an experienced survey team and a robot controlled from above the water. Start with one civilian job, such as checking the bottom of a ship or a water intake. Choose sensors that work in muddy water. Give engineers a report they can use to plan repairs. Partner with a robot maker before building your own.',
  'Charge for checks the owner accepts, then offer repeat visits. Include travel, tools to bring the robot back, repairs and expert review.',
  '["Find an owner who needs regular checks and has a budget. Agree exactly what the survey must find out.","Test at an approved site. Compare the findings with a check the owner already trusts.","Finish a paid job and count all the costs. Seek another contract before building your own hardware."]',
  'Engineers use the report to plan repairs and the owner pays for another visit.',
  'Make a sample report with each part checked, sensor data, unclear findings and the next steps.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'underwater-inspection-robotics', 'bn',
  'রোবট দিয়ে পানির নিচের কাঠামো পরীক্ষা করুন',
  'মানুষ সহজে পৌঁছাতে পারেন না, এমন জায়গায় কী মেরামত দরকার, মালিককে দেখান।',
  'অভিজ্ঞ জরিপ টিম আর দূর থেকে চালানো পানির নিচের রোবট নিয়ে কাজ করুন। জাহাজের নিচের অংশ বা পানি ঢোকার মুখের মতো এক বেসামরিক কাজ বাছুন। ঘোলা পানিতে চলে এমন সেন্সর নিন। ইঞ্জিনিয়ার কাজে লাগাতে পারেন এমন রিপোর্ট দিন। পুরো রোবট নিজে বানানোর আগে প্রস্তুতকারকের সঙ্গে কাজ করুন।',
  'মালিক রিপোর্ট গ্রহণ করলে পরীক্ষার ফি নিন, পরে নিয়মিত দেখার চুক্তি দিন। যাতায়াত, রোবট তুলে আনার যন্ত্র, মেরামত আর বিশেষজ্ঞের ব্যাখ্যার খরচ ধরুন।',
  '["নিয়মিত পরীক্ষার দরকার আর বাজেট আছে এমন মালিক খুঁজুন। জরিপে ঠিক কোন প্রশ্নের উত্তর লাগবে, ঠিক করুন।","অনুমোদিত জায়গায় পরীক্ষা করুন। গ্রহণযোগ্য অন্য পরীক্ষার সঙ্গে ফল মেলান।","টাকার বিনিময়ে একটি কাজ শেষ করে পুরো খরচ হিসাব করুন। নিজের হার্ডওয়্যার বানানোর আগে পরের চুক্তি চান।"]',
  'ইঞ্জিনিয়ার মেরামতের সিদ্ধান্তে রিপোর্ট ব্যবহার করছেন আর মালিক আবার পরীক্ষা করাচ্ছেন।',
  'কাঠামোর অংশ, সেন্সরের প্রমাণ, অনিশ্চিত ফল আর পরের কাজসহ নমুনা রিপোর্ট বানান।',
  ''
);

-- shared-farm-robotics
INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'shared-farm-robotics-problem', 'shared-farm-robotics-problem', 'agriculture', '["anywhere"]',
  '[{"title":"XAG: agricultural service operators in Vietnam, 5 November 2022","url":"https://www.xa.com/en/news/official/xag/200","date":"2022-11-05","en":"A vendor’s 2022 Vietnam service case. Claimed savings are not used as Bangladesh estimates.","bn":"বিক্রেতার ২০২২ সালের ভিয়েতনামের উদাহরণ। তাদের সাশ্রয়ের দাবি বাংলাদেশের হিসাব হিসেবে ধরা হয়নি।"},{"title":"World Bank: rural agri-entrepreneurs, 6 July 2026","url":"https://www.worldbank.org/en/news/feature/2026/07/06/a-global-farming-initiative-is-redefining-jobs-and-harvests-in-rural-bangladesh","date":"2026-07-06","en":"World Bank reporting describes Bangladesh’s agri-service hub model.","bn":"বিশ্বব্যাংকের লেখায় বাংলাদেশের কৃষিসেবা হাবের মডেল আছে।"},{"title":"CAAB: drone registration and operation policy index","url":"https://new.caab.gov.bd/atf.html","date":"2026-09-25","en":"Check current drone policy and operational permissions before any aerial trial.","bn":"আকাশে পরীক্ষা চালানোর আগে বর্তমান ড্রোন নীতি আর চালানোর অনুমতি দেখে নিন।"}]'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-farm-robotics-problem', 'en',
  'Small farms may need machine work without owning the equipment',
  'Small farms may need machine work without owning the equipment',
  'Farm-service operators, cooperatives and larger growers coordinating nearby plots',
  'XAG’s 2022 Vietnam case describes drone-service operators working with rice farms. It is a company case, not proof of savings in Bangladesh. Bangladesh’s agri-service hubs offer a possible route to customers. Aerial work also needs current CAAB permission checks.',
  'Does the machine still save time or money on small, scattered plots?'
);
INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'shared-farm-robotics-problem', 'bn',
  'ছোট খামারে মেশিনের কাজ লাগলেও মেশিন কেনা সম্ভব নাও হতে পারে',
  'ছোট খামারে মেশিনের কাজ লাগলেও মেশিন কেনা সম্ভব নাও হতে পারে',
  'কৃষিসেবার অপারেটর, সমবায় আর কাছের জমির কাজ গুছাতে পারেন এমন বড় কৃষক।',
  'XAG-এর ২০২২ সালের ভিয়েতনামের উদাহরণে ধানখেতে ড্রোন সেবার অপারেটর আছে। কোম্পানির এই বর্ণনা বাংলাদেশে সাশ্রয়ের প্রমাণ নয়। দেশের কৃষিসেবা হাব কাস্টমার পেতে সাহায্য করতে পারে। আকাশে যন্ত্র চালালে CAAB-এর বর্তমান অনুমতিও দেখে নিতে হবে।',
  'ছোট আর ছড়ানো জমিতে যন্ত্র দিয়ে কাজ করেও সময় বা টাকা বাঁচবে কি?'
);
INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'shared-farm-robotics', 'shared-farm-robotics-problem', 'service', 0, '2026-09-25',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]'
);
INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-farm-robotics', 'en',
  'Offer farm robots as a shared service',
  'Let nearby farms pay for a completed task instead of buying a machine.',
  'Choose one job, crop and compact service area. Work with trained operators and supported equipment to complete that job for several farms. A small ground machine may suit the plots better than a drone. Use bookings and route planning to keep equipment working through the season.',
  'Charge for completed work. Include travel, setup, repairs, operators and the months when the machine has little work.',
  '["Ask a farm-service operator to compare one machine task with its current method. Check equipment support and any required permits.","Run a paid field trial on nearby plots. Compare work quality, total time and all costs.","Measure repeat bookings and seasonal use. Expand only where the machine has an advantage after travel and setup."]',
  'Farmers book again and enough seasonal work covers the full cost of the equipment.',
  'Create a booking and cost model with sample plot sizes, travel time, setup, repairs and seasonal demand.',
  ''
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype, editorial_note) VALUES (
  'shared-farm-robotics', 'bn',
  'কয়েকটি খামারের জন্য রোবটের সেবা দিন',
  'মেশিন না কিনে কৃষক যেন কাজ করিয়ে নেওয়ার ফি দিতে পারেন।',
  'এক কাজ, এক ফসল আর কাছাকাছি জমি বাছুন। প্রশিক্ষিত অপারেটর আর সাপোর্ট পাওয়া যায় এমন যন্ত্র দিয়ে কয়েক খামারের কাজ করুন। ড্রোনের চেয়ে ছোট মাটিতে চলা যন্ত্রও ভালো হতে পারে। বুকিং আর রুট গুছিয়ে মৌসুমজুড়ে মেশিন কাজে রাখুন।',
  'শেষ হওয়া কাজের ফি নিন। যাতায়াত, সেটআপ, মেরামত, অপারেটর আর যে মাসে কাজ কম থাকে, তার খরচও ধরুন।',
  '["কৃষিসেবার অপারেটরের সঙ্গে এক মেশিনের কাজ আগের পদ্ধতির সঙ্গে মেলান। সাপোর্ট আর দরকারি অনুমতি চেক করুন।","কাছাকাছি জমিতে ফি নিয়ে পরীক্ষা করুন। কাজের মান, মোট সময় আর সব খরচ মেলান।","আবার বুকিং আর মৌসুমে ব্যবহার কতটা হয়, দেখুন। যাতায়াত আর সেটআপ ধরেও সুবিধা থাকলেই বাড়ান।"]',
  'কৃষক আবার বুক করছেন আর মৌসুমের যথেষ্ট কাজে যন্ত্রের পুরো খরচ উঠছে।',
  'নমুনা জমির আকার, যাতায়াত, সেটআপ, মেরামত আর মৌসুমি চাহিদা দিয়ে বুকিং ও খরচের মডেল বানান।',
  ''
);
