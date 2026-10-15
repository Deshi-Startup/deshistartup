-- Append bilingual Research & sources cards: Market facts, Market maps, Market size.
-- json_insert only. Do not replace live FAO / GFA / Bangladesh Bank / IDCOL records.
-- IDCOL copy is patched in place. Re-running skips URLs already present.
-- Publication still needs the frozen snapshot pipeline after this migration.
PRAGMA foreign_keys = ON;

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://idcol.org/idcol_new/public/renewable/solar-irrigation-program' THEN json_set(value, '$.en', 'IDCOL describes solar irrigation sold as a service. The same programme page lists 1,523 pumps in operation. That is installed pumps, not software seats.', '$.bn', 'IDCOL সেবা হিসেবে সোলার সেচ দেওয়ার মডেল বর্ণনা করেছে। একই পাতায় চালু পাম্প ১,৫২৩টি। এটি বসানো পাম্প, সফটওয়্যার সিট নয়।') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'solar-irrigation-control-problem';

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics' THEN json_set(value, '$.title', 'Mixed cutting scrap (draft)', '$.date', 'SWITCH2CE 2023 · GIZ STILE 2024', '$.en', '$62.4 million
At 24 taka per kilogram of fabric offcuts

$104 million
At 40 taka per kilogram of factory local sale

What went into it
312,000 tonnes
cutting-floor waste
1,000 kilograms
in each tonne
120 taka
per US dollar

Assumptions
- All 312,000 tonnes of 2023 production-step waste sells at mill gate
- Price is GIZ STILE mixed-grade bands, not sorted white
- Not proof recyclers will buy

Sources
- SWITCH2CE citing Reverse Resources, 2023 https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023
- GIZ STILE mill-gate bands, 2024 https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf', '$.bn', '৬ কোটি ২৪ লাখ ডলার
কাপড়ের উচ্ছিষ্ট কেজিতে ২৪ টাকায়

১০ কোটি ৪০ লাখ ডলার
কারখানার স্থানীয় বিক্রি কেজিতে ৪০ টাকায়

হিসাবের অংশ
৩,১২,০০০ টন
কাটিং ফ্লোরের বর্জ্য
১,০০০ কেজি
প্রতি টনে
১২০ টাকা
প্রতি মার্কিন ডলারে

অনুমান
- ২০২৩ সালের উৎপাদন ধাপের ৩ লাখ ১২ হাজার টন সব মিলগেটে বিক্রি হয়
- দাম STILE-এর মিশ্র গ্রেড, বাছাই করা সাদা কাপড় নয়
- রিসাইক্লার যে কিনবে তার প্রমাণ নয়

উৎস
- SWITCH2CE, Reverse Resources, ২০২৩ https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023
- জিআইজেড STILE মিলগেট দাম, ২০২৪ https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'garment-offcuts' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/warehousing-and-storage' THEN json_set(value, '$.title', 'Mixed-vegetable storage (draft)', '$.date', 'BBS Yearbook 2024 · DAM potato ceiling', '$.en', '$47.9 million
Using potato-store rent as the price

What went into it
3,408,000 tonnes
non-potato vegetables
25 percent
stored, an assumption, not a BBS table
1,000 kilograms
in each tonne
6.75 taka
per kilogram of potato-store rent
120 taka
per US dollar

Assumptions
- Non-potato vegetables = 14,009,000 tonnes of vegetables minus 10,601,000 tonnes of potato
- Price analog is the DAM potato rent cap, not mixed-vegetable crate rental
- We have not sized crate rental in Rajshahi and Bogura
- We do not know how full the stores stay

Sources
- BBS Yearbook 2024 Table 4.40 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- DAM potato rent ceiling, March 2025. No stable DAM page', '$.bn', '৪ কোটি ৭৯ লাখ ডলার
দাম হিসেবে আলুর ভাড়া ধরা হয়েছে

হিসাবের অংশ
৩৪ লাখ ৮ হাজার টন
আলু বাদ দিয়ে সবজি
২৫ শতাংশ
রাখা হয়, অনুমান, বিবিএস সারণি নয়
১,০০০ কেজি
প্রতি টনে
৬.৭৫ টাকা
আলুর ভাড়া কেজিতে
১২০ টাকা
প্রতি মার্কিন ডলারে

অনুমান
- আলু বাদ দিয়ে সবজি = ১ কোটি ৪০ লাখ ৯ হাজার টন থেকে আলু ১ কোটি ৬ লাখ ১ হাজার টন বাদ
- দামের তুলনা আলুর DAM ভাড়া সীমা, মিশ্র সবজির ক্রেট ভাড়া নয়
- রাজশাহী ও বগুড়ার ক্রেট ভাড়া আমরা হিসাব করিনি
- কতটা জায়গা ভরে থাকে, সেটা আমরা জানি না

উৎস
- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৪০ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- DAM আলুর ভাড়া সিলিং, মার্চ ২০২৫। স্থায়ী DAM পাতা নেই', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'produce-cold-chain' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/warehousing-and-storage');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/digital-health-platforms-telemedicine-human-vet-landscape' THEN json_set(value, '$.title', 'Private-clinic software (draft)', '$.date', 'BBS Yearbook 2024 · ChamberBD list', '$.en', '$202,860
At 700 taka per clinic per month

$2.90 million
At 10,000 taka per clinic per month

What went into it
2,898
private hospitals and clinics
12 months
annualise a monthly fee
120 taka
per US dollar

Assumptions
- Every registered private hospital and clinic pays every month
- ChamberBD Standard is a full clinic plan, not reminder-only
- We have not considered the community clinics count
- We do not know how many would buy, so this is not demand

Sources
- BBS Yearbook 2024 Table 13.01 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- ChamberBD Standard list https://clinic.chamberbd.com/pricing
- Software Agency BD hospital management list https://softwareagencybd.com/products/hospital-management', '$.bn', '২,০২,৮৬০ ডলার
প্রতি ক্লিনিকে মাসে ৭০০ টাকায়

২৯ লাখ ডলার
প্রতি ক্লিনিকে মাসে ১০,০০০ টাকায়

হিসাবের অংশ
২,৮৯৮
বেসরকারি হাসপাতাল ও ক্লিনিক
১২ মাস
মাসিক ফি বার্ষিক করা
১২০ টাকা
প্রতি মার্কিন ডলারে

অনুমান
- নিবন্ধিত বেসরকারি হাসপাতাল ও ক্লিনিক প্রতি মাসেই দেয়
- ChamberBD স্ট্যান্ডার্ড পুরো ক্লিনিক প্ল্যান, শুধু রিমাইন্ডার নয়
- কমিউনিটি ক্লিনিকের সংখ্যা আমরা ধরিনি
- কতজন কিনবে জানি না, তাই এটি চাহিদা নয়

উৎস
- বিবিএস ইয়ারবুক ২০২৪, সারণি ১৩.০১ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- ChamberBD স্ট্যান্ডার্ড তালিকা https://clinic.chamberbd.com/pricing
- Software Agency BD হাসপাতাল ম্যানেজমেন্ট তালিকা https://softwareagencybd.com/products/hospital-management', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'missed-follow-up' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/digital-health-platforms-telemedicine-human-vet-landscape');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries' THEN json_set(value, '$.title', 'Intensive-pond water kits (draft)', '$.date', 'BBS Yearbook 2024 · shop kit lists', '$.en', '$11.3 million
At 1,950 taka per shop water-test kit

$23.2 million
At 3,990 taka per shop water-test kit

What went into it
696,447 ponds
intensive plus highly intensive
120 taka
per US dollar

Assumptions
- 696,447 = 612,660 intensive ponds plus 83,787 highly intensive ponds
- One shop water-test kit per pond per year
- Shop kits, not PCR lab tests
- We have not considered the village ponds count

Sources
- BBS Yearbook 2024 Table 4.57 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- BIOZYM shop list, fetched 27 Sep 2026
- Keen shop list https://tmonline24.com/product/415', '$.bn', '১ কোটি ১৩ লাখ ডলার
কিট প্রতি ১,৯৫০ টাকায়

২ কোটি ৩২ লাখ ডলার
কিট প্রতি ৩,৯৯০ টাকায়

হিসাবের অংশ
৬,৯৬,৪৪৭ পুকুর
নিবিড় ও অতি নিবিড়
১২০ টাকা
প্রতি মার্কিন ডলারে

অনুমান
- ৬,৯৬,৪৪৭ = নিবিড় ৬,১২,৬৬০ ও অতি নিবিড় ৮৩,৭৮৭ পুকুর
- প্রতি পুকুরে বছরে একটি দোকানের পানি পরীক্ষার কিট
- দোকানের কিট, পিসিআর ল্যাব নয়
- গ্রামের পুকুরের সংখ্যা আমরা ধরিনি

উৎস
- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৫৭ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- BIOZYM দোকানের তালিকা, ২৭ সেপ্টেম্বর ২০২৬
- Keen দোকানের তালিকা https://tmonline24.com/product/415', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'aquaculture-diagnostics-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries' THEN json_set(value, '$.title', 'Intensive-pond handheld meters (draft)', '$.date', 'BBS Yearbook 2024 · Astzbd list', '$.en', '$52.2 million
At 9,000 taka per handheld dissolved-oxygen meter

What went into it
696,447 ponds
intensive plus highly intensive
120 taka
per US dollar

Assumptions
- Same intensive and highly intensive ponds as the kit card
- One handheld dissolved-oxygen meter per pond, not an aerator-control kit
- We have not considered the village ponds count

Sources
- BBS Yearbook 2024 Table 4.57 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- Astzbd DO9100 https://astzbd.com/product/do9100-dissolved-oxygen-meter-bangladesh/', '$.bn', '৫ কোটি ২২ লাখ ডলার
হাতে ধরা মিটার ৯,০০০ টাকায়

হিসাবের অংশ
৬,৯৬,৪৪৭ পুকুর
নিবিড় ও অতি নিবিড়
১২০ টাকা
প্রতি মার্কিন ডলারে

অনুমান
- কিট কার্ডের মতোই নিবিড় ও অতি নিবিড় পুকুর
- প্রতিটিতে একটি হাতে ধরা অক্সিজেন মিটার, অটোপাইলট কিট নয়
- গ্রামের পুকুরের সংখ্যা আমরা ধরিনি

উৎস
- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৫৭ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb
- Astzbd DO9100 https://astzbd.com/product/do9100-dissolved-oxygen-meter-bangladesh/', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'fish-farm-autopilot-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services' THEN json_set(value, '$.title', 'Merchant recon software (draft)', '$.date', 'Bangladesh Bank Feb 2025 · ReconPe analog', '$.en', '$8.7 million
If 5 percent of regular MFS merchants buy

$175 million
If every regular merchant buys

What went into it
363,000
regular MFS merchants
3,332 Indian rupees
per merchant per month
12 months
annualise a monthly fee
83 rupees
per US dollar

Assumptions
- No published Bangladesh recon-software price, so an India analog is used
- We have not considered PRA accounts or payment-gateway fees

Sources
- Bangladesh Bank MFS, February 2025 https://www.bb.org.bd/en/index.php/financialactivity/mfsdata
- ReconPe Starter, India analog https://reconpe.com/pricing/', '$.bn', '৮৭ লাখ ডলার
নিয়মিত মার্চেন্টের ৫ শতাংশ কিনলে

১৭ কোটি ৫০ লাখ ডলার
সব নিয়মিত মার্চেন্ট কিনলে

হিসাবের অংশ
৩,৬৩,০০০
নিয়মিত এমএফএস মার্চেন্ট
৩,৩৩২ ভারতীয় রুপি
প্রতি মার্চেন্টে মাসে
১২ মাস
মাসিক ফি বার্ষিক করা
৮৩ রুপি
প্রতি মার্কিন ডলারে

অনুমান
- বাংলাদেশে রিকন সফটওয়্যারের দাম প্রকাশিত নেই, তাই ভারতের তুলনা ব্যবহার
- পিআরএ হিসাব ও গেটওয়ের কমিশন আমরা ধরিনি

উৎস
- বাংলাদেশ ব্যাংক এমএফএস, ফেব্রুয়ারি ২০২৫ https://www.bb.org.bd/en/index.php/financialactivity/mfsdata
- ReconPe স্টার্টার, ভারতের তুলনা https://reconpe.com/pricing/', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'merchant-settlement-reconciliation-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-decentralised-offgrid-landscape' THEN json_set(value, '$.title', 'Pump control kits (draft)', '$.date', 'IDCOL · IndiaMART analog', '$.en', '$40,369
One monitor kit per operating pump

What went into it
1,523 pumps
IDCOL solar irrigation, in operation
2,200 Indian rupees
per monitor kit
83 rupees
per US dollar

Assumptions
- That kit is not IDCOL software sold as a service
- IDCOL already runs the pumps

Sources
- IDCOL solar irrigation programme https://idcol.org/idcol_new/public/renewable/solar-irrigation-program
- IndiaMART analog RMS https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html', '$.bn', '৪০,৩৬৯ ডলার
চালু পাম্পে একটি মনিটর কিট

হিসাবের অংশ
১,৫২৩টি পাম্প
IDCOL সোলার সেচ, চালু
২,২০০ ভারতীয় রুপি
মনিটর কিট প্রতি
৮৩ রুপি
প্রতি মার্কিন ডলারে

অনুমান
- এটি IDCOL-এর সফটওয়্যার সেবা নয়
- পাম্পগুলো ইতিমধ্যে IDCOL চালায়

উৎস
- IDCOL সোলার সেচ কর্মসূচি https://idcol.org/idcol_new/public/renewable/solar-irrigation-program
- IndiaMART তুলনা https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'solar-irrigation-control-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-decentralised-offgrid-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · K-12 education","url":"https://moncho.ai/sectors/k12-education","date":"15 October 2026","en":"Moncho''s k-12 education map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর K-12 education ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'adaptive-bangla-learning-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/k12-education');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · ponds and fish","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Bangladesh Bureau of Statistics, Statistical Yearbook 2024 Table 4.57 records 2,543,869 ponds and 2,368,741 tonnes of pond fish in 2023-24. Table 4.61 records 5,018,483 tonnes of national fish production. That is ponds and catch, not lab-test or sensor revenue.","bn":"বাংলাদেশ পরিসংখ্যান ব্যুরোর ইয়ারবুক ২০২৪, সারণি ৪.৫৭-এ ২০২৩-২৪ সালে পুকুর ২৫ লাখ ৪৩ হাজার ৮৬৯টি আর পুকুরে মাছ ২৩ লাখ ৬৮ হাজার ৭৪১ টন। সারণি ৪.৬১-এ দেশে মোট মাছ ৫০ লাখ ১৮ হাজার ৪৮৩ টন। এটি পুকুর ও উৎপাদন, ল্যাব টেস্ট বা সেন্সরের আয় নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'aquaculture-diagnostics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Aquaculture production","url":"https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production","date":"15 October 2026","en":"Moncho''s aquaculture production map sits inside fisheries. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Aquaculture production ম্যাপ Fisheries খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'aquaculture-diagnostics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Intensive-pond water kits (draft)","url":"https://moncho.ai/sectors/fisheries","date":"BBS Yearbook 2024 · shop kit lists","en":"$11.3 million\nAt 1,950 taka per shop water-test kit\n\n$23.2 million\nAt 3,990 taka per shop water-test kit\n\nWhat went into it\n696,447 ponds\nintensive plus highly intensive\n120 taka\nper US dollar\n\nAssumptions\n- 696,447 = 612,660 intensive ponds plus 83,787 highly intensive ponds\n- One shop water-test kit per pond per year\n- Shop kits, not PCR lab tests\n- We have not considered the village ponds count\n\nSources\n- BBS Yearbook 2024 Table 4.57 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- BIOZYM shop list, fetched 27 Sep 2026\n- Keen shop list https://tmonline24.com/product/415","bn":"১ কোটি ১৩ লাখ ডলার\nকিট প্রতি ১,৯৫০ টাকায়\n\n২ কোটি ৩২ লাখ ডলার\nকিট প্রতি ৩,৯৯০ টাকায়\n\nহিসাবের অংশ\n৬,৯৬,৪৪৭ পুকুর\nনিবিড় ও অতি নিবিড়\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- ৬,৯৬,৪৪৭ = নিবিড় ৬,১২,৬৬০ ও অতি নিবিড় ৮৩,৭৮৭ পুকুর\n- প্রতি পুকুরে বছরে একটি দোকানের পানি পরীক্ষার কিট\n- দোকানের কিট, পিসিআর ল্যাব নয়\n- গ্রামের পুকুরের সংখ্যা আমরা ধরিনি\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৫৭ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- BIOZYM দোকানের তালিকা, ২৭ সেপ্টেম্বর ২০২৬\n- Keen দোকানের তালিকা https://tmonline24.com/product/415","section":"size"}')), revision = revision + 1
WHERE id = 'aquaculture-diagnostics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · K-12 education","url":"https://moncho.ai/sectors/k12-education","date":"15 October 2026","en":"Moncho''s k-12 education map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর K-12 education ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'bangla-assessment-feedback-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/k12-education');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · ICT services","url":"https://moncho.ai/sectors/ict-services","date":"15 October 2026","en":"Moncho''s ict services map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর ICT services ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'bangla-order-intake-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ict-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · ICT services","url":"https://moncho.ai/sectors/ict-services","date":"15 October 2026","en":"Moncho''s ict services map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর ICT services ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'bangla-speech-infrastructure-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ict-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · ICT services","url":"https://moncho.ai/sectors/ict-services","date":"15 October 2026","en":"Moncho''s ict services map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর ICT services ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'bangla-training-data-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ict-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Cross-border payments","url":"https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape","date":"15 October 2026","en":"Moncho''s cross-border payments map sits inside financial services. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Cross-border payments ম্যাপ Financial services খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'bank-cross-border-connectors-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · AI and semiconductors","url":"https://moncho.ai/sectors/ai-semiconductor","date":"15 October 2026","en":"Moncho''s ai and semiconductors map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর AI and semiconductors ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'chip-verification-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ai-semiconductor');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · ICT services","url":"https://moncho.ai/sectors/ict-services","date":"15 October 2026","en":"Moncho''s ict services map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর ICT services ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'code-change-verification-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ict-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Energy","url":"https://moncho.ai/sectors/energy","date":"15 October 2026","en":"Moncho''s energy map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Energy ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'compressed-air-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Insurance","url":"https://moncho.ai/sectors/insurance","date":"15 October 2026","en":"Moncho''s insurance map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Insurance ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'crop-loss-data-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/insurance');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Freight forwarding","url":"https://moncho.ai/sectors/freight-forwarding-and-brokerage","date":"15 October 2026","en":"Moncho''s freight forwarding map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Freight forwarding ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'direct-export-operations-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/freight-forwarding-and-brokerage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Energy","url":"https://moncho.ai/sectors/energy","date":"15 October 2026","en":"Moncho''s energy map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Energy ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'distributed-energy-orchestration-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Water and sanitation","url":"https://moncho.ai/sectors/water-sanitation","date":"15 October 2026","en":"Moncho''s water and sanitation map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Water and sanitation ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'etp-operations-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/water-sanitation');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Freight forwarding","url":"https://moncho.ai/sectors/freight-forwarding-and-brokerage","date":"15 October 2026","en":"Moncho''s freight forwarding map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Freight forwarding ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'export-document-check-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/freight-forwarding-and-brokerage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · ponds and fish","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Bangladesh Bureau of Statistics, Statistical Yearbook 2024 Table 4.57 records 2,543,869 ponds and 2,368,741 tonnes of pond fish in 2023-24. Table 4.61 records 5,018,483 tonnes of national fish production. That is ponds and catch, not lab-test or sensor revenue.","bn":"বাংলাদেশ পরিসংখ্যান ব্যুরোর ইয়ারবুক ২০২৪, সারণি ৪.৫৭-এ ২০২৩-২৪ সালে পুকুর ২৫ লাখ ৪৩ হাজার ৮৬৯টি আর পুকুরে মাছ ২৩ লাখ ৬৮ হাজার ৭৪১ টন। সারণি ৪.৬১-এ দেশে মোট মাছ ৫০ লাখ ১৮ হাজার ৪৮৩ টন। এটি পুকুর ও উৎপাদন, ল্যাব টেস্ট বা সেন্সরের আয় নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'fish-farm-autopilot-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Aquaculture production","url":"https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production","date":"15 October 2026","en":"Moncho''s aquaculture production map sits inside fisheries. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Aquaculture production ম্যাপ Fisheries খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'fish-farm-autopilot-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Intensive-pond handheld meters (draft)","url":"https://moncho.ai/sectors/fisheries","date":"BBS Yearbook 2024 · Astzbd list","en":"$52.2 million\nAt 9,000 taka per handheld dissolved-oxygen meter\n\nWhat went into it\n696,447 ponds\nintensive plus highly intensive\n120 taka\nper US dollar\n\nAssumptions\n- Same intensive and highly intensive ponds as the kit card\n- One handheld dissolved-oxygen meter per pond, not an aerator-control kit\n- We have not considered the village ponds count\n\nSources\n- BBS Yearbook 2024 Table 4.57 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- Astzbd DO9100 https://astzbd.com/product/do9100-dissolved-oxygen-meter-bangladesh/","bn":"৫ কোটি ২২ লাখ ডলার\nহাতে ধরা মিটার ৯,০০০ টাকায়\n\nহিসাবের অংশ\n৬,৯৬,৪৪৭ পুকুর\nনিবিড় ও অতি নিবিড়\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- কিট কার্ডের মতোই নিবিড় ও অতি নিবিড় পুকুর\n- প্রতিটিতে একটি হাতে ধরা অক্সিজেন মিটার, অটোপাইলট কিট নয়\n- গ্রামের পুকুরের সংখ্যা আমরা ধরিনি\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৫৭ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- Astzbd DO9100 https://astzbd.com/product/do9100-dissolved-oxygen-meter-bangladesh/","section":"size"}')), revision = revision + 1
WHERE id = 'fish-farm-autopilot-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Transportation","url":"https://moncho.ai/sectors/transportation","date":"15 October 2026","en":"Moncho''s transportation map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Transportation ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'fleet-depot-electrification-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/transportation');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Food and beverage","url":"https://moncho.ai/sectors/food-beverage","date":"15 October 2026","en":"Moncho''s food and beverage map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Food and beverage ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'food-sample-runs-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/food-beverage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Logistics software","url":"https://moncho.ai/sectors/logistics-execution-software-and-visibility","date":"15 October 2026","en":"Moncho''s logistics software map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Logistics software ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'forwarder-shipment-control-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/logistics-execution-software-and-visibility');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"SWITCH2CE · Reverse Resources textile-waste Sankey, 2023","url":"https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023","date":"18 February 2025","en":"Reverse Resources, cited by SWITCH2CE, put RMG production-step waste at 312,000 tonnes in 2023, inside about 830,000 tonnes of all textile waste. That is a cutting-floor volume, not proof recyclers will buy a sorted lot.","bn":"SWITCH2CE-তে উল্লিখিত Reverse Resources-এর হিসাবে ২০২৩ সালে তৈরি পোশাকের উৎপাদন ধাপে বর্জ্য ৩ লাখ ১২ হাজার টন। সব ধরনের টেক্সটাইল বর্জ্য মিলিয়ে প্রায় ৮ লাখ ৩০ হাজার টন। এটি কাটিং ফ্লোরের পরিমাণ, বাছাই করা লট যে কেউ কিনবে তার প্রমাণ নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'garment-offcuts' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"GIZ STILE · mill-gate jhut purchase bands, 2024","url":"https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf","date":"2024","en":"The GIZ STILE study records mill-gate purchase bands in 2024: about 10 taka per kg for rejected pieces, 24 taka per kg for fabric offcuts, and 40 taka per kg for factory local sales. These are mixed-grade bands, not a sorted-white invoice.","bn":"জিআইজেড STILE সমীক্ষায় ২০২৪ সালের মিলগেট ক্রয়: ফেলে দেওয়া কাপড় কেজিতে প্রায় ১০ টাকা, কাটার উচ্ছিষ্ট ২৪ টাকা, কারখানার স্থানীয় বিক্রি ৪০ টাকা। এগুলো মিশ্র গ্রেড, বাছাই করা সাদা কাপড়ের চালান নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'garment-offcuts' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Circular economy textiles","url":"https://moncho.ai/sectors/circular-economy-textiles","date":"15 October 2026","en":"Moncho''s circular economy textiles map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Circular economy textiles ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'garment-offcuts' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Mixed cutting scrap (draft)","url":"https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics","date":"SWITCH2CE 2023 · GIZ STILE 2024","en":"$62.4 million\nAt 24 taka per kilogram of fabric offcuts\n\n$104 million\nAt 40 taka per kilogram of factory local sale\n\nWhat went into it\n312,000 tonnes\ncutting-floor waste\n1,000 kilograms\nin each tonne\n120 taka\nper US dollar\n\nAssumptions\n- All 312,000 tonnes of 2023 production-step waste sells at mill gate\n- Price is GIZ STILE mixed-grade bands, not sorted white\n- Not proof recyclers will buy\n\nSources\n- SWITCH2CE citing Reverse Resources, 2023 https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023\n- GIZ STILE mill-gate bands, 2024 https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf","bn":"৬ কোটি ২৪ লাখ ডলার\nকাপড়ের উচ্ছিষ্ট কেজিতে ২৪ টাকায়\n\n১০ কোটি ৪০ লাখ ডলার\nকারখানার স্থানীয় বিক্রি কেজিতে ৪০ টাকায়\n\nহিসাবের অংশ\n৩,১২,০০০ টন\nকাটিং ফ্লোরের বর্জ্য\n১,০০০ কেজি\nপ্রতি টনে\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- ২০২৩ সালের উৎপাদন ধাপের ৩ লাখ ১২ হাজার টন সব মিলগেটে বিক্রি হয়\n- দাম STILE-এর মিশ্র গ্রেড, বাছাই করা সাদা কাপড় নয়\n- রিসাইক্লার যে কিনবে তার প্রমাণ নয়\n\nউৎস\n- SWITCH2CE, Reverse Resources, ২০২৩ https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023\n- জিআইজেড STILE মিলগেট দাম, ২০২৪ https://commonobjective-uploads.storage.googleapis.com/resources/articles/STUDY-Internal-STILE-Jhut-Sector-Project-FINAL-PDF-74c.pdf","section":"size"}')), revision = revision + 1
WHERE id = 'garment-offcuts' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Cross-border payments","url":"https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape","date":"15 October 2026","en":"Moncho''s cross-border payments map sits inside financial services. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Cross-border payments ম্যাপ Financial services খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'invoice-finance-evidence-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Bangladesh Bank · MFS merchant accounts","url":"https://www.bb.org.bd/en/index.php/financialactivity/mfsdata","date":"February 2025 and February 2026","en":"Bangladesh Bank''s MFS comparative summary for February 2025 lists 1,226,000 merchant accounts (363,000 regular, 864,000 PRA). Its e-banking series for February 2026 lists 547,649 MFS merchant accounts. Those are different series. Neither is a count of shops that buy reconciliation software.","bn":"বাংলাদেশ ব্যাংকের এমএফএস তুলনামূলক বিবরণী, ফেব্রুয়ারি ২০২৫: মার্চেন্ট হিসাব ১২ লাখ ২৬ হাজার (নিয়মিত ৩ লাখ ৬৩ হাজার, পিআরএ ৮ লাখ ৬৪ হাজার)। ই-ব্যাংকিং সিরিজ, ফেব্রুয়ারি ২০২৬: এমএফএস মার্চেন্ট ৫ লাখ ৪৭ হাজার ৬৪৯। দুটো আলাদা হিসাব। কোনোটাই রিকনসিলিয়েশন সফটওয়্যার কেনে এমন দোকানের গণনা নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.bb.org.bd/en/index.php/financialactivity/mfsdata');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · B2B payments","url":"https://moncho.ai/sectors/financial-services/landscapes/b2b-payments-marketplaces-procurement-finance-landscape","date":"15 October 2026","en":"Moncho''s b2b payments map sits inside financial services. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর B2B payments ম্যাপ Financial services খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services/landscapes/b2b-payments-marketplaces-procurement-finance-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Merchant recon software (draft)","url":"https://moncho.ai/sectors/financial-services","date":"Bangladesh Bank Feb 2025 · ReconPe analog","en":"$8.7 million\nIf 5 percent of regular MFS merchants buy\n\n$175 million\nIf every regular merchant buys\n\nWhat went into it\n363,000\nregular MFS merchants\n3,332 Indian rupees\nper merchant per month\n12 months\nannualise a monthly fee\n83 rupees\nper US dollar\n\nAssumptions\n- No published Bangladesh recon-software price, so an India analog is used\n- We have not considered PRA accounts or payment-gateway fees\n\nSources\n- Bangladesh Bank MFS, February 2025 https://www.bb.org.bd/en/index.php/financialactivity/mfsdata\n- ReconPe Starter, India analog https://reconpe.com/pricing/","bn":"৮৭ লাখ ডলার\nনিয়মিত মার্চেন্টের ৫ শতাংশ কিনলে\n\n১৭ কোটি ৫০ লাখ ডলার\nসব নিয়মিত মার্চেন্ট কিনলে\n\nহিসাবের অংশ\n৩,৬৩,০০০\nনিয়মিত এমএফএস মার্চেন্ট\n৩,৩৩২ ভারতীয় রুপি\nপ্রতি মার্চেন্টে মাসে\n১২ মাস\nমাসিক ফি বার্ষিক করা\n৮৩ রুপি\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- বাংলাদেশে রিকন সফটওয়্যারের দাম প্রকাশিত নেই, তাই ভারতের তুলনা ব্যবহার\n- পিআরএ হিসাব ও গেটওয়ের কমিশন আমরা ধরিনি\n\nউৎস\n- বাংলাদেশ ব্যাংক এমএফএস, ফেব্রুয়ারি ২০২৫ https://www.bb.org.bd/en/index.php/financialactivity/mfsdata\n- ReconPe স্টার্টার, ভারতের তুলনা https://reconpe.com/pricing/","section":"size"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · private hospitals and community clinics","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Yearbook 2024 Table 13.01 records 2,898 DGHS-registered private hospitals and clinics. Table 13.12 records 14,360 community clinics in 2024. That is a facility count, not proof clinics will pay for reminder software.","bn":"ইয়ারবুক ২০২৪, সারণি ১৩.০১-এ ডিজিএইচএস-নিবন্ধিত বেসরকারি হাসপাতাল ও ক্লিনিক ২,৮৯৮টি। সারণি ১৩.১২-এ ২০২৪ সালে কমিউনিটি ক্লিনিক ১৪,৩৬০টি। এটি প্রতিষ্ঠানের গণনা, ক্লিনিক যে রিমাইন্ডার সফটওয়্যার কিনবে তার প্রমাণ নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Healthcare","url":"https://moncho.ai/sectors/healthcare","date":"15 October 2026","en":"Moncho''s healthcare map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Healthcare ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Private-clinic software (draft)","url":"https://moncho.ai/sectors/healthcare/landscapes/digital-health-platforms-telemedicine-human-vet-landscape","date":"BBS Yearbook 2024 · ChamberBD list","en":"$202,860\nAt 700 taka per clinic per month\n\n$2.90 million\nAt 10,000 taka per clinic per month\n\nWhat went into it\n2,898\nprivate hospitals and clinics\n12 months\nannualise a monthly fee\n120 taka\nper US dollar\n\nAssumptions\n- Every registered private hospital and clinic pays every month\n- ChamberBD Standard is a full clinic plan, not reminder-only\n- We have not considered the community clinics count\n- We do not know how many would buy, so this is not demand\n\nSources\n- BBS Yearbook 2024 Table 13.01 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- ChamberBD Standard list https://clinic.chamberbd.com/pricing\n- Software Agency BD hospital management list https://softwareagencybd.com/products/hospital-management","bn":"২,০২,৮৬০ ডলার\nপ্রতি ক্লিনিকে মাসে ৭০০ টাকায়\n\n২৯ লাখ ডলার\nপ্রতি ক্লিনিকে মাসে ১০,০০০ টাকায়\n\nহিসাবের অংশ\n২,৮৯৮\nবেসরকারি হাসপাতাল ও ক্লিনিক\n১২ মাস\nমাসিক ফি বার্ষিক করা\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- নিবন্ধিত বেসরকারি হাসপাতাল ও ক্লিনিক প্রতি মাসেই দেয়\n- ChamberBD স্ট্যান্ডার্ড পুরো ক্লিনিক প্ল্যান, শুধু রিমাইন্ডার নয়\n- কমিউনিটি ক্লিনিকের সংখ্যা আমরা ধরিনি\n- কতজন কিনবে জানি না, তাই এটি চাহিদা নয়\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ১৩.০১ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- ChamberBD স্ট্যান্ডার্ড তালিকা https://clinic.chamberbd.com/pricing\n- Software Agency BD হাসপাতাল ম্যানেজমেন্ট তালিকা https://softwareagencybd.com/products/hospital-management","section":"size"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/digital-health-platforms-telemedicine-human-vet-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Transportation","url":"https://moncho.ai/sectors/transportation","date":"15 October 2026","en":"Moncho''s transportation map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Transportation ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'pooled-employee-transport-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/transportation');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · cold storage and vegetables","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Bangladesh Bureau of Statistics, Statistical Yearbook 2024 Table 7.03 records 4.5 million tonnes of national cold-storage capacity. Table 4.40 for 2023-24 shows vegetable production of 14,009 thousand tonnes, of which potato is 10,601 thousand tonnes. Potato output alone is larger than recorded cold-store capacity, so this is not the market for crate rental of mixed vegetables.","bn":"ইয়ারবুক ২০২৪, সারণি ৭.০৩-এ জাতীয় কোল্ড স্টোরেজ ক্ষমতা ৪৫ লাখ টন। সারণি ৪.৪০-এ ২০২৩-২৪ সালে সবজি ১ কোটি ৪০ লাখ ৯ হাজার টন, যার মধ্যে আলু ১ কোটি ৬ লাখ ১ হাজার টন। শুধু আলুই নথিভুক্ত কোল্ড স্টোরের চেয়ে বেশি। তাই এটি মিশ্র সবজির ক্রেট ভাড়ার বাজার নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Warehousing and storage","url":"https://moncho.ai/sectors/warehousing-and-storage","date":"15 October 2026","en":"Moncho''s warehousing and storage map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Warehousing and storage ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Mixed-vegetable storage (draft)","url":"https://moncho.ai/sectors/warehousing-and-storage/landscapes/warehousing-and-storage","date":"BBS Yearbook 2024 · DAM potato ceiling","en":"$47.9 million\nUsing potato-store rent as the price\n\nWhat went into it\n3,408,000 tonnes\nnon-potato vegetables\n25 percent\nstored, an assumption, not a BBS table\n1,000 kilograms\nin each tonne\n6.75 taka\nper kilogram of potato-store rent\n120 taka\nper US dollar\n\nAssumptions\n- Non-potato vegetables = 14,009,000 tonnes of vegetables minus 10,601,000 tonnes of potato\n- Price analog is the DAM potato rent cap, not mixed-vegetable crate rental\n- We have not sized crate rental in Rajshahi and Bogura\n- We do not know how full the stores stay\n\nSources\n- BBS Yearbook 2024 Table 4.40 https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- DAM potato rent ceiling, March 2025. No stable DAM page","bn":"৪ কোটি ৭৯ লাখ ডলার\nদাম হিসেবে আলুর ভাড়া ধরা হয়েছে\n\nহিসাবের অংশ\n৩৪ লাখ ৮ হাজার টন\nআলু বাদ দিয়ে সবজি\n২৫ শতাংশ\nরাখা হয়, অনুমান, বিবিএস সারণি নয়\n১,০০০ কেজি\nপ্রতি টনে\n৬.৭৫ টাকা\nআলুর ভাড়া কেজিতে\n১২০ টাকা\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- আলু বাদ দিয়ে সবজি = ১ কোটি ৪০ লাখ ৯ হাজার টন থেকে আলু ১ কোটি ৬ লাখ ১ হাজার টন বাদ\n- দামের তুলনা আলুর DAM ভাড়া সীমা, মিশ্র সবজির ক্রেট ভাড়া নয়\n- রাজশাহী ও বগুড়ার ক্রেট ভাড়া আমরা হিসাব করিনি\n- কতটা জায়গা ভরে থাকে, সেটা আমরা জানি না\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪, সারণি ৪.৪০ https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb\n- DAM আলুর ভাড়া সিলিং, মার্চ ২০২৫। স্থায়ী DAM পাতা নেই","section":"size"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/warehousing-and-storage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Plastics","url":"https://moncho.ai/sectors/plastics-and-polymer-precursors","date":"15 October 2026","en":"Moncho''s plastics map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Plastics ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'recycled-resin-quality-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/plastics-and-polymer-precursors');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Bangladesh National Data Center · rack colocation tariff","url":"https://ndc.bcc.gov.bd/?page_id=178","date":"2026","en":"Bangladesh National Data Center lists rack colocation at 10,000 taka per month for 2U, 20,000 for 4U, 40,000 for 8U and 80,000 for 16U. That is a rack tariff, not the market for disaster-recovery software.","bn":"জাতীয় ডেটা সেন্টারের র্যাক কোলোকেশন: ২ইউ মাসে ১০,০০০ টাকা, ৪ইউ ২০,০০০, ৮ইউ ৪০,০০০, ১৬ইউ ৮০,০০০ টাকা। এটি র্যাক ভাড়া, ডিজাস্টার রিকভারি সফটওয়্যারের বাজার নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'regional-app-recovery' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://ndc.bcc.gov.bd/?page_id=178');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · ICT services","url":"https://moncho.ai/sectors/ict-services","date":"15 October 2026","en":"Moncho''s ict services map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর ICT services ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'regional-app-recovery' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ict-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Early childhood education","url":"https://moncho.ai/sectors/early-childhood-education","date":"15 October 2026","en":"Moncho''s early childhood education map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Early childhood education ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'shared-childcare-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/early-childhood-education');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Agri and agro-processing","url":"https://moncho.ai/sectors/agri-agro-processing","date":"15 October 2026","en":"Moncho''s agri and agro-processing map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Agri and agro-processing ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'shared-farm-robotics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/agri-agro-processing');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Courier","url":"https://moncho.ai/sectors/express-and-courier-delivery","date":"15 October 2026","en":"Moncho''s courier map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Courier ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'shared-parcel-returns-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/express-and-courier-delivery');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Energy","url":"https://moncho.ai/sectors/energy","date":"15 October 2026","en":"Moncho''s energy map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Energy ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'solar-irrigation-control-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Pump control kits (draft)","url":"https://moncho.ai/sectors/energy/landscapes/wm-decentralised-offgrid-landscape","date":"IDCOL · IndiaMART analog","en":"$40,369\nOne monitor kit per operating pump\n\nWhat went into it\n1,523 pumps\nIDCOL solar irrigation, in operation\n2,200 Indian rupees\nper monitor kit\n83 rupees\nper US dollar\n\nAssumptions\n- That kit is not IDCOL software sold as a service\n- IDCOL already runs the pumps\n\nSources\n- IDCOL solar irrigation programme https://idcol.org/idcol_new/public/renewable/solar-irrigation-program\n- IndiaMART analog RMS https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html","bn":"৪০,৩৬৯ ডলার\nচালু পাম্পে একটি মনিটর কিট\n\nহিসাবের অংশ\n১,৫২৩টি পাম্প\nIDCOL সোলার সেচ, চালু\n২,২০০ ভারতীয় রুপি\nমনিটর কিট প্রতি\n৮৩ রুপি\nপ্রতি মার্কিন ডলারে\n\nঅনুমান\n- এটি IDCOL-এর সফটওয়্যার সেবা নয়\n- পাম্পগুলো ইতিমধ্যে IDCOL চালায়\n\nউৎস\n- IDCOL সোলার সেচ কর্মসূচি https://idcol.org/idcol_new/public/renewable/solar-irrigation-program\n- IndiaMART তুলনা https://www.indiamart.com/proddetail/iot-based-solar-pump-rms-4g-2g-as-per-mnre-guideline-and-all-features-covered-as-per-eesl-25140841097.html","section":"size"}')), revision = revision + 1
WHERE id = 'solar-irrigation-control-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-decentralised-offgrid-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"SREDA · net-metered rooftop systems","url":"https://nsrra.sreda.gov.bd/solar/nem/nemstatistics.php","date":"2023","en":"SREDA''s net-metering statistics page lists 1,941 net-metered systems and 84.592 MWp of capacity in 2023. That is rooftop stock, not a cleaning or inverter-repair contract count.","bn":"এসআরইডিএ-র নেট মিটারিং পরিসংখ্যানে ২০২৩ সালে নেট মিটারযুক্ত সিস্টেম ১,৯৪১টি আর ক্ষমতা ৮৪.৫৯২ মেগাওয়াট পিক। এটি ছাদের সোলারের মজুদ, পরিষ্কার বা ইনভার্টার মেরামতের চুক্তির গণনা নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'solar-maintenance' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://nsrra.sreda.gov.bd/solar/nem/nemstatistics.php');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Energy","url":"https://moncho.ai/sectors/energy","date":"15 October 2026","en":"Moncho''s energy map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Energy ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'solar-maintenance' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Ready-made garments","url":"https://moncho.ai/sectors/ready-made-garments-rmg","date":"15 October 2026","en":"Moncho''s ready-made garments map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Ready-made garments ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'supplier-evidence-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/ready-made-garments-rmg');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Workforce training","url":"https://moncho.ai/sectors/workforce-training","date":"15 October 2026","en":"Moncho''s workforce training map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Workforce training ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'technician-proof-of-skill-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/workforce-training');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Digital tourism","url":"https://moncho.ai/sectors/tourism/landscapes/digital-tourism-technology-solutions-landscape","date":"15 October 2026","en":"Moncho''s digital tourism map sits inside tourism. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Digital tourism ম্যাপ Tourism খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'tour-operator-software-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/tourism/landscapes/digital-tourism-technology-solutions-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Ports and maritime","url":"https://moncho.ai/sectors/port-and-maritime-sector","date":"15 October 2026","en":"Moncho''s ports and maritime map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Ports and maritime ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'underwater-inspection-robotics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/port-and-maritime-sector');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Light engineering","url":"https://moncho.ai/sectors/light-engineering","date":"15 October 2026","en":"Moncho''s light engineering map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Light engineering ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'verified-spares-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/light-engineering');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Water and sanitation","url":"https://moncho.ai/sectors/water-sanitation","date":"15 October 2026","en":"Moncho''s water and sanitation map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Water and sanitation ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'water-system-maintenance' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/water-sanitation');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Construction","url":"https://moncho.ai/sectors/construction","date":"15 October 2026","en":"Moncho''s construction map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Construction ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'workplace-heat' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/construction');
