-- Editorial candidate from an accepted submission. This does not publish it or
-- link private contributor records. Prepare a reviewed public release separately.

UPDATE problem_text SET
  title = 'Rooftop solar systems need dependable upkeep',
  summary = 'Dirty panels and equipment faults can reduce output. Owners need someone to find the cause and get it fixed.',
  customer = 'Owners of commercial rooftop systems and the installers responsible for them.',
  context = 'IEEFA flags maintenance risks in the rooftop-solar programme. CPD recounts neglected checks and early inverter failures in older Dhaka installations. Neither shows demand for a specialist service. Existing firms offer upkeep, and low output can also come from dirty panels, grid outages or wiring faults.',
  unknown = 'When installer or warranty support is slow, who would pay an independent specialist to diagnose the fault? Can qualified technicians resolve cases at a price that covers parts, travel and return visits?'
WHERE problem_id = 'solar-maintenance' AND locale = 'en';

UPDATE problem_text SET
  title = 'ছাদের সোলার সচল রাখতে নির্ভরযোগ্য দেখভাল দরকার',
  summary = 'প্যানেলে ময়লা জমলে বা যন্ত্রে ত্রুটি হলে বিদ্যুৎ কম পাওয়া যায়। কারণটা খুঁজে ঠিক করার লোকও দরকার।',
  customer = 'বাণিজ্যিক ভবনের সোলারের মালিক ও তাঁদের সিস্টেম বসানো কোম্পানি।',
  context = 'IEEFA ছাদের সোলার দেখভালের ঝুঁকির কথা বলেছে। CPD ঢাকার আগের কিছু স্থাপনায় নিয়মিত পরীক্ষা না করা আর ইনভার্টার নষ্ট হওয়ার অভিজ্ঞতা তুলে ধরেছে। এতে আলাদা সার্ভিসের চাহিদা প্রমাণ হয় না। কিছু কোম্পানি আগেই সোলার দেখভাল করে। বিদ্যুৎ কম পেলেই ইনভার্টার নষ্ট হয়েছে ধরে নেবেন না। প্যানেলে ময়লা, গ্রিড বন্ধ থাকা বা তারের সমস্যাও কারণ হতে পারে।',
  unknown = 'ইনস্টলার বা ওয়ারেন্টির সেবা পেতে দেরি হলে আলাদা টেকনিশিয়ানের ত্রুটি পরীক্ষার ফি কে দেবেন? পার্টস, যাতায়াত আর ফের গিয়ে কাজ করার খরচ কি সেই ফি ও পরের কাজের আয় থেকে উঠবে?'
WHERE problem_id = 'solar-maintenance' AND locale = 'bn';

UPDATE problems SET sources_json = json_insert(sources_json,
  '$[#]', json('{"title":"CPD · Rooftop solar programme briefing","url":"https://cpd.org.bd/resources/2025/07/CPD_Briefing_on_National_Rooftop_Project.pdf","date":"July 2025","en":"CPD recounts neglected maintenance and early equipment failures in older Dhaka rooftop systems. This historical evidence does not measure demand for commercial inverter service.","bn":"ঢাকার আগের কিছু ছাদসোলার স্থাপনায় নিয়মিত দেখভালের ঘাটতি ও যন্ত্র নষ্ট হওয়ার অভিজ্ঞতা তুলে ধরেছে CPD। বাণিজ্যিক গ্রাহক নতুন সার্ভিসের জন্য ফি দেবেন কি না, তা এতে জানা যায় না।"}'),
  '$[#]', json('{"title":"SREDA · Approved three-phase inverters","url":"https://nsrra.sreda.gov.bd/solar/nem/gti3ph/index.php","date":"Checked 23 September 2026","en":"SREDA lists approved three-phase models for net metering. Model approval is only one check. Site and utility requirements also matter.","bn":"নেট মিটারিংয়ের জন্য অনুমোদিত থ্রি-ফেজ ইনভার্টারের তালিকা। মডেল মেলার পাশাপাশি স্থাপনা ও বিদ্যুৎ বিতরণ সংস্থার নিয়মও দেখতে হবে।"}'),
  '$[#]', json('{"title":"SREDA · Net Metering Guidelines 2025","url":"https://solar.sreda.gov.bd/doc/Net%20Metering%20Guidelines-2025.pdf","date":"2025","en":"The guideline sets grid-tied inverter and interconnection requirements. Check a replacement with the responsible installer and utility.","bn":"গ্রিডে যুক্ত সোলার ইনভার্টার ও সংযোগের নিয়ম দেওয়া আছে। বদলানোর আগে দায়িত্বে থাকা ইনস্টলার ও বিদ্যুৎ বিতরণ সংস্থার সঙ্গে মিলিয়ে নিন।"}'),
  '$[#]', json('{"title":"SEDCOL · Solar operations and maintenance","url":"https://www.solarland.com.bd/capabilities/om/","date":"Checked 23 September 2026","en":"SEDCOL advertises solar O&M, including inverter inspection and corrective maintenance. These are its own claims, not independent evidence of market share or service quality.","bn":"SEDCOL সোলার দেখভাল, ইনভার্টার পরীক্ষা আর ত্রুটি পেলে ব্যবস্থা নেওয়ার সেবার কথা জানিয়েছে। এগুলো প্রতিষ্ঠানের নিজের দাবি। বাজারে তাদের অংশ বা সেবার মানের স্বাধীন প্রমাণ নয়।"}')),
  revision = revision + 1
WHERE id = 'solar-maintenance';

INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json)
VALUES ('solar-inverter-repair', 'solar-maintenance', 'service', '1', '2026-09-23',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]');

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'en',
  'Fix faults in rooftop solar inverters',
  'Diagnose inverter faults on commercial rooftops, then arrange safe repair, warranty service or a compatible replacement.',
  'An inverter turns power from solar panels into electricity a building can use. Start as a specialist support partner for installers with commercial rooftop customers in one area. A qualified technician checks whether the inverter is actually at fault, records the model and warranty, then works with the installer or manufacturer on the right fix. Some solar firms already offer this support; a need for outside help is a hypothesis to test, not a proven gap.',
  'Agree whether the installer or site owner pays for diagnosis before a visit. Quote any authorised repair or replacement separately. Offer after-sales support contracts only if repeat paid work appears.',
  '["Ask five installers about recent inverter callouts: fault, model, warranty, response time, payer and outcome. Find out whether they would refer work to an outside specialist.","Offer paid diagnosis with a qualified solar technician. Follow site safety and warranty instructions. Arrange repair through the installer or manufacturer-approved service process, and check current net-metering requirements before replacement.","Track five paid cases from first call to resolution. Count labour, parts, travel and return visits, then ask whether installers will send another job at a price that covers those costs."]',
  'Installers send repeat paid work, and revenue from diagnosis and follow-on work covers the full cost of resolving each case.',
  'Make a simple job log for inverter model, fault report, warranty, technician time, parts, quote and outcome. Test it with sample cases; it should not connect to live electrical equipment.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'bn',
  'ছাদের সোলার ইনভার্টারের ত্রুটি সারান',
  'বাণিজ্যিক ভবনে ইনভার্টারের ত্রুটি খুঁজে নিরাপদে মেরামত, ওয়ারেন্টি সেবা বা মানানসই যন্ত্র বদলের ব্যবস্থা করুন।',
  'ইনভার্টার সোলার প্যানেলের বিদ্যুৎ ভবনে ব্যবহারযোগ্য করে। শুরুতে এক এলাকার বাণিজ্যিক ভবনে সোলার বসানো কোম্পানিগুলোর সঙ্গে কাজ করুন। দক্ষ টেকনিশিয়ান দেখে নেবেন, সমস্যা সত্যিই ইনভার্টারে কি না। এরপর মডেল ও ওয়ারেন্টি দেখে ইনস্টলার বা প্রস্তুতকারকের সঙ্গে করণীয় ঠিক করুন। কিছু সোলার কোম্পানি আগে থেকেই এমন কাজ করে। তাদের কোন কাজ সামলাতে দেরি হচ্ছে, তা আগে জেনে নিন।',
  'যাওয়ার আগেই ঠিক করুন, ত্রুটি পরীক্ষার ফি ইনস্টলার দেবেন, নাকি ভবনের মালিক। মেরামত বা নতুন যন্ত্রের খরচ আলাদা করে জানান। বারবার ফি দিয়ে কাজ পেলে তবেই নিয়মিত সাপোর্টের চুক্তি ভাবুন।',
  '["পাঁচটি সোলার ইনস্টলেশন কোম্পানির কাছে সাম্প্রতিক ইনভার্টারের ত্রুটির খোঁজ নিন। মডেল, ওয়ারেন্টি, সাড়া পেতে সময়, কে বিল দিয়েছেন আর শেষে কী করা হয়েছে, লিখে রাখুন। বাইরে কাউকে দিয়ে ত্রুটি পরীক্ষা করাতে তাঁরা রাজি কি না, জেনে নিন।","দক্ষ সোলার টেকনিশিয়ানের সঙ্গে ত্রুটি পরীক্ষার প্রস্তাব দিন। শুরুতেই ফি ঠিক করুন। স্থাপনার নিরাপত্তা বিধি ও প্রস্তুতকারকের ওয়ারেন্টির নিয়ম মেনে কাজ করুন। অনুমোদন ছাড়া যন্ত্র খুলে মেরামত করবেন না। বদলাতে হলে নেট মিটারিংয়ের বর্তমান নিয়মও দেখে নিন।","ফি নেওয়া পাঁচটি কাজের প্রথম ফোন থেকে সমাধান পর্যন্ত সময় ও পুরো খরচ লিখুন। টেকনিশিয়ান, পার্টস, যাতায়াত আর ফের গিয়ে কাজ করার খরচও ধরুন। এরপর একই দামে আবার কাজ পাবেন কি না, জেনে নিন।"]',
  'একই ইনস্টলার আবার কাজ দিচ্ছেন, আর ত্রুটি পরীক্ষা ও পরের কাজের আয় থেকে প্রতিটি কাজের পুরো খরচ উঠছে।',
  'ইনভার্টারের মডেল, ত্রুটি, ওয়ারেন্টি, টেকনিশিয়ানের সময়, পার্টস, দাম ও কাজের ফল লেখার সহজ খাতা বানান। নমুনা তথ্য দিয়ে পরীক্ষা করুন। চালু বৈদ্যুতিক যন্ত্রের সঙ্গে যুক্ত করবেন না।'
);
