-- Editorial candidate from an accepted submission. This does not publish it or
-- link private contributor records. Prepare a reviewed public release separately.

UPDATE problem_text SET
  title = 'Rooftop solar systems need dependable upkeep',
  summary = 'Dirty panels and equipment faults can reduce output. Owners need someone to find the cause and get it fixed.',
  customer = 'Owners of commercial rooftop systems and the installers responsible for them.',
  context = 'IEEFA and CPD identify gaps in long-term maintenance and inverter checks in Bangladesh. Existing solar firms already offer upkeep, so a new service must prove where it can help. Low output alone does not mean an inverter has failed: cleaning, grid interruptions and electrical faults need different responses.',
  unknown = 'Which faults are not resolved promptly under current installer or warranty support? Can a specialist diagnose them safely, secure parts or manufacturer service, and cover travel and return visits at a price customers will pay?'
WHERE problem_id = 'solar-maintenance' AND locale = 'en';

UPDATE problem_text SET
  title = 'ছাদের সোলার সচল রাখতে নির্ভরযোগ্য দেখভাল দরকার',
  summary = 'প্যানেলে ময়লা জমলে বা যন্ত্রে ত্রুটি হলে বিদ্যুৎ কম পাওয়া যায়। কারণটা খুঁজে ঠিক করার লোকও দরকার।',
  customer = 'বাণিজ্যিক ভবনের সোলারের মালিক ও তাঁদের সিস্টেম বসানো কোম্পানি।',
  context = 'বাংলাদেশে ছাদের সোলার বসানোর পর দেখভাল আর ইনভার্টার পরীক্ষার ঘাটতি নিয়ে IEEFA ও CPD লিখেছে। কিছু কোম্পানি অবশ্য এই সেবা দিচ্ছে। তাই নতুন সেবা কোথায় কাজে লাগবে, সেটা যাচাই করতে হবে। বিদ্যুৎ কম পেলেই ইনভার্টার নষ্ট হয়েছে ধরে নেবেন না। প্যানেলে ময়লা, গ্রিড বন্ধ থাকা বা বৈদ্যুতিক ত্রুটি, প্রতিটির সমাধান আলাদা।',
  unknown = 'ইনস্টলারের সেবা বা ওয়ারেন্টি থাকা সত্ত্বেও কোন ত্রুটির সমাধান দেরিতে হচ্ছে? নিরাপদে ত্রুটি খুঁজে, পার্টস বা প্রস্তুতকারকের সেবা জোগাড় করে, যাতায়াত ও ফের যাওয়ার খরচ রেখেও কি গ্রাহকের দেওয়া দামে কাজ করা যাবে?'
WHERE problem_id = 'solar-maintenance' AND locale = 'bn';

UPDATE problems SET sources_json = json_insert(sources_json,
  '$[#]', json('{"title":"CPD · National Rooftop Solar Programme review","url":"https://cpd.org.bd/publication/national-rooftop-solar-programme-2025/","date":"October 2025","en":"CPD describes maintenance and quality gaps in earlier rooftop installations and unclear long-term O&M responsibilities. It does not estimate demand for a specialist inverter service.","bn":"আগের ছাদসোলার স্থাপনায় রক্ষণাবেক্ষণ ও মানের ঘাটতি এবং দীর্ঘমেয়াদি দায়িত্বের অস্পষ্টতা তুলে ধরেছে CPD। আলাদা ইনভার্টার সার্ভিসের চাহিদা এতে মাপা হয়নি।"}'),
  '$[#]', json('{"title":"SREDA · Approved three-phase inverters","url":"https://nsrra.sreda.gov.bd/solar/nem/gti3ph/index.php","date":"Checked 23 September 2026","en":"The current approved-model list is a compatibility check for net-metered three-phase replacements, not a general repair instruction.","bn":"নেট মিটারিংয়ের থ্রি-ফেজ ইনভার্টার বদলানোর সময় অনুমোদিত মডেল মিলিয়ে দেখার তালিকা। এটি মেরামতের নির্দেশিকা নয়।"}'),
  '$[#]', json('{"title":"Solarland · Solar operations and maintenance","url":"https://www.solarland.com.bd/","date":"Checked 23 September 2026","en":"A provider advertises solar O&M in Bangladesh. Its own description establishes an existing offer, not its market share or service quality.","bn":"বাংলাদেশে সোলার দেখভালের সেবা দেওয়ার কথা জানিয়েছে প্রতিষ্ঠানটি। এটি তাদের নিজের দাবি; বাজারে তাদের অংশ বা সেবার মানের প্রমাণ নয়।"}')),
  revision = revision + 1
WHERE id = 'solar-maintenance';

INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json)
VALUES ('solar-inverter-repair', 'solar-maintenance', 'service', '1', '2026-09-23',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]');

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'en',
  'Fix faults in rooftop solar inverters',
  'Diagnose inverter faults on commercial rooftops, then arrange safe repair, warranty service or a compatible replacement.',
  'An inverter turns power from solar panels into electricity a building can use. Start as a specialist support partner for installers with commercial rooftop customers in one area. A qualified technician checks whether the inverter is actually at fault, records the model and warranty, then works with the installer or manufacturer on the right fix. Some solar firms already offer this support; faster or more dependable service is a hypothesis to test, not a proven gap.',
  'Charge for diagnosis, with approved repair or replacement quoted separately. Offer contracted after-sales support to installers only if repeat paid work appears.',
  '["Ask five installers about recent inverter callouts: fault, model, warranty, response time and how each case ended. Find out whether they would refer overflow work.","With a qualified solar technician, offer a paid diagnosis at a few commercial sites. Follow the manufacturer and installer warranty process before opening equipment or quoting a replacement; check current net-metering compatibility.","Track five paid cases from first call to resolution. Count labour, parts, travel and return visits, then ask whether installers will send another job at a price that covers those costs."]',
  'Installers send repeat paid work, and the fee covers the full cost of resolving each case.',
  'Make a simple job log for inverter model, fault report, warranty, technician time, parts, quote and outcome. Test it with sample cases; it should not connect to live electrical equipment.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'bn',
  'ছাদের সোলার ইনভার্টারের ত্রুটি সারান',
  'বাণিজ্যিক ভবনে ইনভার্টারের ত্রুটি খুঁজে নিরাপদে মেরামত, ওয়ারেন্টি সেবা বা মানানসই যন্ত্র বদলের ব্যবস্থা করুন।',
  'সোলার প্যানেলের বিদ্যুৎ ভবনে ব্যবহারের উপযোগী করে ইনভার্টার। শুরুতে একটি এলাকার বাণিজ্যিক ভবনে সোলার বসানো কোম্পানিগুলোর সঙ্গে কাজ করুন। দক্ষ টেকনিশিয়ান আগে দেখে নেবেন, ত্রুটিটা সত্যিই ইনভার্টারে কি না। তারপর মডেল ও ওয়ারেন্টির তথ্য নিয়ে ইনস্টলার বা প্রস্তুতকারকের সঙ্গে সমাধান ঠিক করবেন। কিছু সোলার কোম্পানি আগে থেকেই এই সেবা দেয়। আপনি আরও দ্রুত বা নির্ভরযোগ্য সেবা দিতে পারবেন কি না, সেটা কাজ নিয়ে যাচাই করতে হবে।',
  'ত্রুটি পরীক্ষার ফি নিন। মেরামত বা নতুন যন্ত্রের দাম আলাদা জানান। নিয়মিত ফি নিয়ে ইনস্টলারের গ্রাহকদের সাপোর্ট দেওয়ার কথা ভাবুন, তবে আগে দেখুন একই কোম্পানি আবার কাজ দিচ্ছে কি না।',
  '["পাঁচটি সোলার ইনস্টলেশন কোম্পানির কাছে সাম্প্রতিক ইনভার্টারের ত্রুটির খোঁজ নিন। মডেল, ওয়ারেন্টি, সেবা পেতে সময় আর শেষ পর্যন্ত কী করা হয়েছে, লিখে রাখুন। অতিরিক্ত কাজ আপনাকে দেবে কি না, জেনে নিন।","দক্ষ সোলার টেকনিশিয়ান নিয়ে কয়েকটি বাণিজ্যিক ভবনে ফি নিয়ে ত্রুটি পরীক্ষার প্রস্তাব দিন। যন্ত্র খুলে কাজ বা বদলানোর দাম জানানোর আগে প্রস্তুতকারক ও ইনস্টলারের ওয়ারেন্টির নিয়ম দেখুন। নেট মিটারিংয়ের ক্ষেত্রে নতুন মডেলটি মানানসই কি না, মিলিয়ে নিন।","ফি নেওয়া পাঁচটি কাজের প্রথম ফোন থেকে সমাধান পর্যন্ত সময় ও পুরো খরচ লিখুন। টেকনিশিয়ান, পার্টস, যাতায়াত আর ফের গিয়ে কাজ করার খরচও ধরুন। এরপর একই দামে আবার কাজ পাবেন কি না, জেনে নিন।"]',
  'ইনস্টলাররা আবার ফি দিয়ে কাজ দিচ্ছেন, আর প্রতিটি কাজের পুরো খরচ উঠছে।',
  'ইনভার্টারের মডেল, ত্রুটি, ওয়ারেন্টি, টেকনিশিয়ানের সময়, পার্টস, দাম ও কাজের ফল লেখার সহজ খাতা বানান। নমুনা তথ্য দিয়ে পরীক্ষা করুন; চালু বৈদ্যুতিক যন্ত্রের সঙ্গে যুক্ত করবেন না।'
);
