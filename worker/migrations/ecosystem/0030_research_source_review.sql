-- Correct reviewed source cards without rewriting migration 0029.
-- Prices below were checked on the linked vendor pages on 16 October 2026.
-- Preserve source URLs, unrelated notes and the frozen publication pointer.
PRAGMA foreign_keys = ON;

-- garment-offcuts
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics'
      THEN json_patch(value, json('{
  "title": "Mixed cutting scrap (draft estimate)",
  "titleBn": "পোশাক কারখানার মিশ্র কাপড়ের উচ্ছিষ্ট: খসড়া হিসাব",
  "dateBn": "SWITCH2CE ২০২৩ · GIZ STILE ২০২৪"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'garment-offcuts'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- produce-cold-chain
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/warehousing-and-storage'
      THEN json_patch(value, json('{
  "title": "Mixed-vegetable storage (draft estimate)",
  "titleBn": "মিশ্র সবজি সংরক্ষণ: খসড়া হিসাব",
  "dateBn": "বিবিএস ইয়ারবুক ২০২৪ · আলুর সংরক্ষণ ভাড়ার সীমা, মার্চ ২০২৫"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'produce-cold-chain'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- missed-follow-up
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/digital-health-platforms-telemedicine-human-vet-landscape'
      THEN json_patch(value, json('{
  "title": "Private-clinic software (draft estimate)",
  "titleBn": "বেসরকারি ক্লিনিকের সফটওয়্যার: খসড়া হিসাব",
  "dateBn": "বিবিএস ইয়ারবুক ২০২৪ · দাম দেখা: ১৬ অক্টোবর ২০২৬",
  "date": "BBS Yearbook 2024 · prices checked 16 October 2026",
  "en": "$144,900\nAt 500 taka per clinic per month\n\n$2.90 million\nAt 10,000 taka per clinic per month\n\nWhat went into it\n2,898\nprivate hospitals and clinics\n12 months\nannualise a monthly fee\n120 taka\nper US dollar\n\nAssumptions\n- Every registered private hospital and clinic pays every month\n- ChamberBD Clinic Starter is a full clinic plan, not reminder-only\n- Monthly subscriptions only: annual discounts and the hospital plan''s 50,000 taka setup fee are excluded\n- We have not considered the community clinics count\n- We do not know how many would buy, so this is not demand\n\nSources\n- BBS Yearbook 2024 Table 13.01 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- ChamberBD Clinic Starter, checked 16 October 2026 https://clinic.chamberbd.com/pricing\n- Software Agency BD hospital management, checked 16 October 2026 https://softwareagencybd.com/products/hospital-management",
  "bn": "১ লাখ ৪৪ হাজার ৯০০ ডলার\nপ্রতি ক্লিনিকে মাসে ৫০০ টাকায়\n\n২৯ লাখ ডলার\nপ্রতি ক্লিনিকে মাসে ১০,০০০ টাকায়\n\nহিসাবের অংশ\n২,৮৯৮\nবেসরকারি হাসপাতাল ও ক্লিনিক\n১২ মাস\nমাসিক ফি বার্ষিক করা\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- ধরে নেওয়া হয়েছে, প্রতিটি নিবন্ধিত বেসরকারি হাসপাতাল ও ক্লিনিক প্রতি মাসে ফি দেবে\n- ChamberBD Clinic Starter পুরো ক্লিনিক প্ল্যান, শুধু রিমাইন্ডার নয়\n- শুধু মাসিক ফি ধরা হয়েছে। বার্ষিক ছাড় ও হাসপাতালের প্ল্যান চালু করার ৫০,০০০ টাকা ধরা হয়নি\n- কমিউনিটি ক্লিনিকের সংখ্যা আমরা ধরিনি\n- কতজন কিনবে জানি না, তাই এটি চাহিদা নয়\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ১৩.০১ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- ChamberBD Clinic Starter, দাম দেখা: ১৬ অক্টোবর ২০২৬ https://clinic.chamberbd.com/pricing\n- Software Agency BD হাসপাতাল ম্যানেজমেন্ট, দাম দেখা: ১৬ অক্টোবর ২০২৬ https://softwareagencybd.com/products/hospital-management"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'missed-follow-up'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- aquaculture-diagnostics-problem
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries'
      THEN json_patch(value, json('{
  "title": "Intensive-pond water kits (draft estimate)",
  "titleBn": "নিবিড় চাষের পুকুরে পানি পরীক্ষার কিট: খসড়া হিসাব",
  "dateBn": "বিবিএস ইয়ারবুক ২০২৪ · দোকানের দাম দেখা: ১৬ অক্টোবর ২০২৬",
  "date": "BBS Yearbook 2024 · shop prices checked 16 October 2026",
  "en": "$11.3 million\nAt 1,950 taka per shop water-test kit\n\n$23.2 million\nAt 3,990 taka per shop water-test kit\n\nWhat went into it\n696,447 ponds\nintensive plus highly intensive\n120 taka\nper US dollar\n\nAssumptions\n- 696,447 = 612,660 intensive ponds plus 83,787 highly intensive ponds\n- One shop water-test kit per pond per year\n- Shop kits, not PCR lab tests\n- We have not considered the village ponds count\n\nSources\n- BBS Yearbook 2024 Table 4.57 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- Aqua Fish Farm BD BIOZYM 3-in-1 kit, checked 16 October 2026 https://aquafishfarmbd.com/product/biozym-test-kit-3-in-1-%28ph%2C-nh3-nh4%2B-%26-no2%29-for-fish-tank-or-pond-water-246\n- TM Online 24 Keen pH/ammonia kit, checked 16 October 2026 https://tmonline24.com/product/415",
  "bn": "১ কোটি ১৩ লাখ ডলার\nকিট প্রতি ১,৯৫০ টাকায়\n\n২ কোটি ৩২ লাখ ডলার\nকিট প্রতি ৩,৯৯০ টাকায়\n\nহিসাবের অংশ\n৬,৯৬,৪৪৭ পুকুর\nনিবিড় ও অতি নিবিড়\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- ৬,৯৬,৪৪৭ = নিবিড় ৬,১২,৬৬০ ও অতি নিবিড় ৮৩,৭৮৭ পুকুর\n- প্রতি পুকুরে বছরে একটি দোকানের পানি পরীক্ষার কিট\n- দোকানের কিট, পিসিআর ল্যাব নয়\n- গ্রামের পুকুরের সংখ্যা আমরা ধরিনি\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৫৭ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- Aqua Fish Farm BD-এর BIOZYM কিট, দাম দেখা: ১৬ অক্টোবর ২০২৬ https://aquafishfarmbd.com/product/biozym-test-kit-3-in-1-%28ph%2C-nh3-nh4%2B-%26-no2%29-for-fish-tank-or-pond-water-246\n- TM Online 24-এর Keen কিট, দাম দেখা: ১৬ অক্টোবর ২০২৬ https://tmonline24.com/product/415"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'aquaculture-diagnostics-problem'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- merchant-settlement-reconciliation-problem
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services'
      THEN json_patch(value, json('{
  "title": "Merchant reconciliation software (draft estimate)",
  "titleBn": "মার্চেন্টের লেনদেন মেলানোর সফটওয়্যার: খসড়া হিসাব",
  "dateBn": "বাংলাদেশ ব্যাংক, ফেব্রুয়ারি ২০২৫ · ReconPe-এর দামের তুলনা"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'merchant-settlement-reconciliation-problem'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- fish-farm-autopilot-problem
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries'
      THEN json_patch(value, json('{
  "title": "Intensive-pond handheld meters (draft estimate)",
  "titleBn": "নিবিড় চাষের পুকুরে হাতে ধরা মিটার: খসড়া হিসাব",
  "dateBn": "বিবিএস ইয়ারবুক ২০২৪ · Astzbd-এর দামের তালিকা"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'fish-farm-autopilot-problem'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- solar-irrigation-control-problem
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-decentralised-offgrid-landscape'
      THEN json_patch(value, json('{
  "title": "Pump monitoring kits (draft estimate)",
  "titleBn": "সেচপাম্প পর্যবেক্ষণের কিট: খসড়া হিসাব",
  "dateBn": "IDCOL · IndiaMART-এর দামের তুলনা",
  "en": "$40,369\nOne monitor kit per operating pump\n\nWhat went into it\n1,523 pumps\nIDCOL solar irrigation, in operation\n2,200 Indian rupees\nper monitor kit\n83 rupees\nper US dollar\n\nAssumptions\n- That kit is not IDCOL software sold as a service\n- IDCOL financed these operating pumps. This does not establish demand for monitoring kits\n\nSources\n- IDCOL solar irrigation programme https://idcol.org/idcol_new/public/renewable/solar-irrigation-program\n- IndiaMART analog RMS https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html",
  "bn": "৪০,৩৬৯ ডলার\nচালু পাম্পে একটি মনিটর কিট\n\nহিসাবের অংশ\n১,৫২৩টি পাম্প\nIDCOL সোলার সেচ, চালু\n২,২০০ ভারতীয় রুপি\nমনিটর কিট প্রতি\n৮৩ রুপি\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- এটি IDCOL-এর সফটওয়্যার সেবা নয়\n- এই চালু পাম্পগুলোতে IDCOL অর্থায়ন করেছে। এতে পর্যবেক্ষণের কিটের চাহিদা প্রমাণ হয় না\n\nউৎস\n- IDCOL সোলার সেচ কর্মসূচি https://idcol.org/idcol_new/public/renewable/solar-irrigation-program\n- IndiaMART তুলনা https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html"
}'))
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  WHERE problems.id = 'solar-irrigation-control-problem'
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);

-- Match the existing English qualification in every Moncho map note.
WITH amended AS (
  SELECT problems.id, json_group_array(json(CASE
    WHEN json_extract(value, '$.section') = 'maps'
      AND json_extract(value, '$.url') LIKE 'https://moncho.ai/%'
      AND instr(json_extract(value, '$.bn'), 'শুধু এই ম্যাপ দেখে আইডিয়ার চাহিদা আছে কি না বোঝা যায় না।') = 0
      THEN json_set(value, '$.bn', json_extract(value, '$.bn') || ' শুধু এই ম্যাপ দেখে আইডিয়ার চাহিদা আছে কি না বোঝা যায় না।')
    ELSE value END)) AS sources_json
  FROM problems, json_each(problems.sources_json)
  GROUP BY problems.id
)
UPDATE problems
SET sources_json = (SELECT sources_json FROM amended WHERE amended.id = problems.id),
    revision = revision + 1
WHERE id IN (SELECT id FROM amended)
  AND sources_json <> (SELECT sources_json FROM amended WHERE amended.id = problems.id);
