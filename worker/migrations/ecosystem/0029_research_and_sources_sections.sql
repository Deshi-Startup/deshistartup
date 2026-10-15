-- Append bilingual Research & sources cards: Market facts, Market maps, Market size.
-- json_insert only. Do not replace live FAO / GFA / Bangladesh Bank / IDCOL records.
-- IDCOL copy is patched in place. Re-running skips URLs already present.
-- Publication still needs the frozen snapshot pipeline after this migration.
PRAGMA foreign_keys = ON;

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://idcol.org/idcol_new/public/renewable/solar-irrigation-program' THEN json_set(value, '$.en', 'IDCOL describes solar irrigation sold as a service. The same programme page lists 1,523 pumps in operation. That is installed pumps, not software seats.', '$.bn', 'IDCOL সেবা হিসেবে সোলার সেচ দেওয়ার মডেল বর্ণনা করেছে। একই পাতায় চালু পাম্প ১,৫২৩টি। এটি বসানো পাম্প, সফটওয়্যার সিট নয়।') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'solar-irrigation-control-problem';

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics' THEN json_set(value, '$.title', 'Working range for mixed cutting scrap (draft)', '$.date', '2023 volume, 2024 bands', '$.en', '312,000 t × 1,000 kg/t × 24 Tk/kg ÷ 120 Tk/$ = $62.4 million
312,000 t × 1,000 kg/t × 40 Tk/kg ÷ 120 Tk/$ = $104 million

Assumptions
- All 312,000 tonnes of 2023 production-step waste sells at mill gate
- Price is GIZ STILE mixed-grade bands, not sorted white
- FX is 120 taka per dollar
- Not proof recyclers will buy', '$.bn', '312,000 t × 1,000 kg/t × 24 Tk/kg ÷ 120 Tk/$ = $62.4 million
312,000 t × 1,000 kg/t × 40 Tk/kg ÷ 120 Tk/$ = $104 million

অনুমান
- ২০২৩ সালের উৎপাদন ধাপের ৩ লাখ ১২ হাজার টন সব মিলগেটে বিক্রি হয়
- দাম STILE-এর মিশ্র গ্রেড, বাছাই করা সাদা কাপড় নয়
- ১২০ টাকায় এক ডলার
- রিসাইক্লার যে কিনবে তার প্রমাণ নয়', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'garment-offcuts' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/cold-chain-infrastructure' THEN json_set(value, '$.title', 'Working range for mixed-vegetable storage (draft)', '$.date', '2023-24 volume, potato tariff analog', '$.en', '3,408,000 t × 25% × 1,000 kg/t × 6.75 Tk/kg ÷ 120 Tk/$ = $47.9 million

Assumptions
- Non-potato vegetables = 14,009,000 t minus 10,601,000 t potato (BBS 2023-24)
- One quarter of that volume is stored
- Price analog is the DAM potato ceiling of 6.75 taka per kg
- FX is 120 taka per dollar
- Not crate-rental demand in Rajshahi and Bogura
- Occupancy is unknown', '$.bn', '3,408,000 t × 25% × 1,000 kg/t × 6.75 Tk/kg ÷ 120 Tk/$ = $47.9 million

অনুমান
- আলু বাদ দিয়ে সবজি = ১ কোটি ৪০ লাখ ৯ হাজার টন থেকে আলু ১ কোটি ৬ লাখ ১ হাজার টন বাদ (বিবিএস ২০২৩-২৪)
- সেই পরিমাণের এক চতুর্থাংশ রাখা হয়
- দামের তুলনা আলুর DAM সিলিং কেজিতে ৬.৭৫ টাকা
- ১২০ টাকায় এক ডলার
- রাজশাহী ও বগুড়ার ক্রেট ভাড়ার চাহিদা নয়
- কতটা জায়গা ভরে সেটা জানা নেই', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'produce-cold-chain' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/cold-chain-infrastructure');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/primary-community-care-providers' THEN json_set(value, '$.title', 'Working ceiling for private-clinic software (draft)', '$.date', '2024 census, vendor lists as analog', '$.en', '2,898 clinics × 700 Tk/month × 12 ÷ 120 Tk/$ = $202,860
2,898 clinics × 10,000 Tk/month × 12 ÷ 120 Tk/$ = $2.90 million

Assumptions
- Every one of 2,898 registered private hospitals and clinics pays every month
- Low price is ChamberBD Standard 700 taka per month
- High price is a hospital-management list of 10,000 taka per month
- ChamberBD is a full clinic plan, not reminder-only
- Community clinics are out
- FX is 120 taka per dollar
- Attach is unknown, so this is a ceiling, not demand', '$.bn', '2,898 clinics × 700 Tk/month × 12 ÷ 120 Tk/$ = $202,860
2,898 clinics × 10,000 Tk/month × 12 ÷ 120 Tk/$ = $2.90 million

অনুমান
- নিবন্ধিত ২,৮৯৮টি বেসরকারি হাসপাতাল ও ক্লিনিক প্রতি মাসেই দেয়
- নিম্ন দাম ChamberBD স্ট্যান্ডার্ড মাসে ৭০০ টাকা
- উচ্চ দাম হাসপাতাল ম্যানেজমেন্ট তালিকায় মাসে ১০,০০০ টাকা
- ChamberBD পুরো ক্লিনিক প্ল্যান, শুধু রিমাইন্ডার নয়
- কমিউনিটি ক্লিনিক বাদ
- ১২০ টাকায় এক ডলার
- কতজন কিনবে জানা নেই, তাই এটি সিলিং, চাহিদা নয়', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'missed-follow-up' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/primary-community-care-providers');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries' THEN json_set(value, '$.title', 'Working range for intensive-pond water kits (draft)', '$.date', '2023-24 intensive ponds, shop kits as analog', '$.en', '(612,660 + 83,787) ponds × 1,950 Tk ÷ 120 Tk/$ = $11.3 million
(612,660 + 83,787) ponds × 3,990 Tk ÷ 120 Tk/$ = $23.2 million

Assumptions
- Only intensive 612,660 plus highly intensive 83,787 ponds (BBS Table 4.57)
- One shop water-test kit per pond per year
- Low price BIOZYM 1,950 taka, high price Keen 3,990 taka
- Shop kits, not PCR lab tests
- Village ponds are out
- FX is 120 taka per dollar', '$.bn', '(612,660 + 83,787) ponds × 1,950 Tk ÷ 120 Tk/$ = $11.3 million
(612,660 + 83,787) ponds × 3,990 Tk ÷ 120 Tk/$ = $23.2 million

অনুমান
- শুধু নিবিড় ৬,১২,৬৬০ ও অতি নিবিড় ৮৩,৭৮৭ পুকুর (ইয়ারবুক সারণি ৪.৫৭)
- প্রতি পুকুরে বছরে একটি দোকানের পানি পরীক্ষার কিট
- নিম্ন দাম BIOZYM ১,৯৫০ টাকা, উচ্চ দাম Keen ৩,৯৯০ টাকা
- দোকানের কিট, পিসিআর ল্যাব নয়
- গ্রামের পুকুর বাদ
- ১২০ টাকায় এক ডলার', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'aquaculture-diagnostics-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries' THEN json_set(value, '$.title', 'Working figure for intensive-pond handheld meters (draft)', '$.date', '2023-24 intensive ponds, handheld analog', '$.en', '(612,660 + 83,787) ponds × 9,000 Tk ÷ 120 Tk/$ = $52.2 million

Assumptions
- Same intensive and highly intensive ponds as the kit card
- One handheld dissolved-oxygen meter at 9,000 taka
- That meter is not an aerator-control kit
- Village ponds are out
- FX is 120 taka per dollar', '$.bn', '(612,660 + 83,787) ponds × 9,000 Tk ÷ 120 Tk/$ = $52.2 million

অনুমান
- কিট কার্ডের মতোই নিবিড় ও অতি নিবিড় পুকুর
- প্রতিটিতে একটি হাতে ধরা অক্সিজেন মিটার, দাম ৯,০০০ টাকা
- এটি অটোপাইলট কিট নয়
- গ্রামের পুকুর বাদ
- ১২০ টাকায় এক ডলার', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'fish-farm-autopilot-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services' THEN json_set(value, '$.title', 'Working range for merchant recon software (draft)', '$.date', 'Feb 2025 regular merchants, India analog', '$.en', '363,000 × 5% × 3,332 INR/month × 12 ÷ 83 INR/$ = $8.7 million
363,000 × 3,332 INR/month × 12 ÷ 83 INR/$ = $175 million

Assumptions
- No published Bangladesh recon-software price, so an India analog is used
- Working case is 5 percent of 363,000 regular MFS merchants
- Ceiling is every regular merchant
- PRA accounts and payment-gateway take-rate are out
- FX is 83 rupees per dollar', '$.bn', '363,000 × 5% × 3,332 INR/month × 12 ÷ 83 INR/$ = $8.7 million
363,000 × 3,332 INR/month × 12 ÷ 83 INR/$ = $175 million

অনুমান
- বাংলাদেশে রিকন সফটওয়্যারের দাম প্রকাশিত নেই, তাই ভারতের তুলনা ব্যবহার
- কাজ চালানোর হিসাব নিয়মিত এমএফএস মার্চেন্ট ৩ লাখ ৬৩ হাজারের ৫ শতাংশ
- সিলিং সব নিয়মিত মার্চেন্ট
- পিআরএ হিসাব ও গেটওয়ের কমিশন বাদ
- ৮৩ রুপিতে এক ডলার', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'merchant-settlement-reconciliation-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services');

UPDATE problems SET sources_json = (SELECT json_group_array(CASE WHEN json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-solar-powered-pumping-mini-grid-water' THEN json_set(value, '$.title', 'Working figure for pump control kits (draft)', '$.date', 'IDCOL pumps, India analog kit', '$.en', '1,523 pumps × 2,200 INR ÷ 83 INR/$ = $40,369

Assumptions
- Each of IDCOL 1,523 operating pumps buys one kit
- Price analog is 2,200 rupees
- FX is 83 rupees per dollar
- That kit is not IDCOL software sold as a service
- IDCOL already runs the pumps', '$.bn', '1,523 pumps × 2,200 INR ÷ 83 INR/$ = $40,369

অনুমান
- IDCOL-এর চালু ১,৫২৩টি পাম্পের প্রতিটিতে একটি কিট
- দামের তুলনা ২,২০০ রুপি
- ৮৩ রুপিতে এক ডলার
- এটি IDCOL-এর সফটওয়্যার সেবা নয়
- পাম্পগুলো ইতিমধ্যে IDCOL চালায়', '$.section', 'size') ELSE value END) FROM json_each(problems.sources_json)), revision = revision + 1 WHERE id = 'solar-irrigation-control-problem' AND EXISTS (SELECT 1 FROM json_each(sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-solar-powered-pumping-mini-grid-water');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · K-12 education","url":"https://moncho.ai/sectors/k12-education","date":"15 October 2026","en":"Moncho''s k-12 education map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর K-12 education ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'adaptive-bangla-learning-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/k12-education');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · ponds and fish","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Bangladesh Bureau of Statistics, Statistical Yearbook 2024 Table 4.57 records 2,543,869 ponds and 2,368,741 tonnes of pond fish in 2023-24. Table 4.61 records 5,018,483 tonnes of national fish production. That is ponds and catch, not lab-test or sensor revenue.","bn":"বাংলাদেশ পরিসংখ্যান ব্যুরোর ইয়ারবুক ২০২৪, সারণি ৪.৫৭-এ ২০২৩-২৪ সালে পুকুর ২৫ লাখ ৪৩ হাজার ৮৬৯টি আর পুকুরে মাছ ২৩ লাখ ৬৮ হাজার ৭৪১ টন। সারণি ৪.৬১-এ দেশে মোট মাছ ৫০ লাখ ১৮ হাজার ৪৮৩ টন। এটি পুকুর ও উৎপাদন, ল্যাব টেস্ট বা সেন্সরের আয় নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'aquaculture-diagnostics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Aquaculture production","url":"https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production","date":"15 October 2026","en":"Moncho''s aquaculture production map sits inside fisheries. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Aquaculture production ম্যাপ Fisheries খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'aquaculture-diagnostics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/fisheries/landscapes/fisheries-aquaculture-production');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working range for intensive-pond water kits (draft)","url":"https://moncho.ai/sectors/fisheries","date":"2023-24 intensive ponds, shop kits as analog","en":"(612,660 + 83,787) ponds × 1,950 Tk ÷ 120 Tk/$ = $11.3 million\n(612,660 + 83,787) ponds × 3,990 Tk ÷ 120 Tk/$ = $23.2 million\n\nAssumptions\n- Only intensive 612,660 plus highly intensive 83,787 ponds (BBS Table 4.57)\n- One shop water-test kit per pond per year\n- Low price BIOZYM 1,950 taka, high price Keen 3,990 taka\n- Shop kits, not PCR lab tests\n- Village ponds are out\n- FX is 120 taka per dollar","bn":"(612,660 + 83,787) ponds × 1,950 Tk ÷ 120 Tk/$ = $11.3 million\n(612,660 + 83,787) ponds × 3,990 Tk ÷ 120 Tk/$ = $23.2 million\n\nঅনুমান\n- শুধু নিবিড় ৬,১২,৬৬০ ও অতি নিবিড় ৮৩,৭৮৭ পুকুর (ইয়ারবুক সারণি ৪.৫৭)\n- প্রতি পুকুরে বছরে একটি দোকানের পানি পরীক্ষার কিট\n- নিম্ন দাম BIOZYM ১,৯৫০ টাকা, উচ্চ দাম Keen ৩,৯৯০ টাকা\n- দোকানের কিট, পিসিআর ল্যাব নয়\n- গ্রামের পুকুর বাদ\n- ১২০ টাকায় এক ডলার","section":"size"}')), revision = revision + 1
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

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working figure for intensive-pond handheld meters (draft)","url":"https://moncho.ai/sectors/fisheries","date":"2023-24 intensive ponds, handheld analog","en":"(612,660 + 83,787) ponds × 9,000 Tk ÷ 120 Tk/$ = $52.2 million\n\nAssumptions\n- Same intensive and highly intensive ponds as the kit card\n- One handheld dissolved-oxygen meter at 9,000 taka\n- That meter is not an aerator-control kit\n- Village ponds are out\n- FX is 120 taka per dollar","bn":"(612,660 + 83,787) ponds × 9,000 Tk ÷ 120 Tk/$ = $52.2 million\n\nঅনুমান\n- কিট কার্ডের মতোই নিবিড় ও অতি নিবিড় পুকুর\n- প্রতিটিতে একটি হাতে ধরা অক্সিজেন মিটার, দাম ৯,০০০ টাকা\n- এটি অটোপাইলট কিট নয়\n- গ্রামের পুকুর বাদ\n- ১২০ টাকায় এক ডলার","section":"size"}')), revision = revision + 1
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

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working range for mixed cutting scrap (draft)","url":"https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics","date":"2023 volume, 2024 bands","en":"312,000 t × 1,000 kg/t × 24 Tk/kg ÷ 120 Tk/$ = $62.4 million\n312,000 t × 1,000 kg/t × 40 Tk/kg ÷ 120 Tk/$ = $104 million\n\nAssumptions\n- All 312,000 tonnes of 2023 production-step waste sells at mill gate\n- Price is GIZ STILE mixed-grade bands, not sorted white\n- FX is 120 taka per dollar\n- Not proof recyclers will buy","bn":"312,000 t × 1,000 kg/t × 24 Tk/kg ÷ 120 Tk/$ = $62.4 million\n312,000 t × 1,000 kg/t × 40 Tk/kg ÷ 120 Tk/$ = $104 million\n\nঅনুমান\n- ২০২৩ সালের উৎপাদন ধাপের ৩ লাখ ১২ হাজার টন সব মিলগেটে বিক্রি হয়\n- দাম STILE-এর মিশ্র গ্রেড, বাছাই করা সাদা কাপড় নয়\n- ১২০ টাকায় এক ডলার\n- রিসাইক্লার যে কিনবে তার প্রমাণ নয়","section":"size"}')), revision = revision + 1
WHERE id = 'garment-offcuts' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/circular-economy-textiles/landscapes/ce-textiles-collection-reverse-logistics');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Cross-border payments","url":"https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape","date":"15 October 2026","en":"Moncho''s cross-border payments map sits inside financial services. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর Cross-border payments ম্যাপ Financial services খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'invoice-finance-evidence-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services/landscapes/cross-border-payments-trade-finance-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Bangladesh Bank · MFS merchant accounts","url":"https://www.bb.org.bd/en/index.php/financialactivity/mfsdata","date":"February 2025 and February 2026","en":"Bangladesh Bank''s MFS comparative summary for February 2025 lists 1,226,000 merchant accounts (363,000 regular, 864,000 PRA). Its e-banking series for February 2026 lists 547,649 MFS merchant accounts. Those are different series. Neither is a count of shops that buy reconciliation software.","bn":"বাংলাদেশ ব্যাংকের এমএফএস তুলনামূলক বিবরণী, ফেব্রুয়ারি ২০২৫: মার্চেন্ট হিসাব ১২ লাখ ২৬ হাজার (নিয়মিত ৩ লাখ ৬৩ হাজার, পিআরএ ৮ লাখ ৬৪ হাজার)। ই-ব্যাংকিং সিরিজ, ফেব্রুয়ারি ২০২৬: এমএফএস মার্চেন্ট ৫ লাখ ৪৭ হাজার ৬৪৯। দুটো আলাদা হিসাব। কোনোটাই রিকনসিলিয়েশন সফটওয়্যার কেনে এমন দোকানের গণনা নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.bb.org.bd/en/index.php/financialactivity/mfsdata');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · B2B payments","url":"https://moncho.ai/sectors/financial-services/landscapes/b2b-payments-marketplaces-procurement-finance-landscape","date":"15 October 2026","en":"Moncho''s b2b payments map sits inside financial services. It shows neighbouring products and firms. It is a map of the industry, not proof this idea will sell.","bn":"Moncho এর B2B payments ম্যাপ Financial services খাতের ভিতরে। পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services/landscapes/b2b-payments-marketplaces-procurement-finance-landscape');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working range for merchant recon software (draft)","url":"https://moncho.ai/sectors/financial-services","date":"Feb 2025 regular merchants, India analog","en":"363,000 × 5% × 3,332 INR/month × 12 ÷ 83 INR/$ = $8.7 million\n363,000 × 3,332 INR/month × 12 ÷ 83 INR/$ = $175 million\n\nAssumptions\n- No published Bangladesh recon-software price, so an India analog is used\n- Working case is 5 percent of 363,000 regular MFS merchants\n- Ceiling is every regular merchant\n- PRA accounts and payment-gateway take-rate are out\n- FX is 83 rupees per dollar","bn":"363,000 × 5% × 3,332 INR/month × 12 ÷ 83 INR/$ = $8.7 million\n363,000 × 3,332 INR/month × 12 ÷ 83 INR/$ = $175 million\n\nঅনুমান\n- বাংলাদেশে রিকন সফটওয়্যারের দাম প্রকাশিত নেই, তাই ভারতের তুলনা ব্যবহার\n- কাজ চালানোর হিসাব নিয়মিত এমএফএস মার্চেন্ট ৩ লাখ ৬৩ হাজারের ৫ শতাংশ\n- সিলিং সব নিয়মিত মার্চেন্ট\n- পিআরএ হিসাব ও গেটওয়ের কমিশন বাদ\n- ৮৩ রুপিতে এক ডলার","section":"size"}')), revision = revision + 1
WHERE id = 'merchant-settlement-reconciliation-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/financial-services');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · private hospitals and community clinics","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Yearbook 2024 Table 13.01 records 2,898 DGHS-registered private hospitals and clinics. Table 13.12 records 14,360 community clinics in 2024. That is a facility count, not proof clinics will pay for reminder software.","bn":"ইয়ারবুক ২০২৪, সারণি ১৩.০১-এ ডিজিএইচএস-নিবন্ধিত বেসরকারি হাসপাতাল ও ক্লিনিক ২,৮৯৮টি। সারণি ১৩.১২-এ ২০২৪ সালে কমিউনিটি ক্লিনিক ১৪,৩৬০টি। এটি প্রতিষ্ঠানের গণনা, ক্লিনিক যে রিমাইন্ডার সফটওয়্যার কিনবে তার প্রমাণ নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Healthcare","url":"https://moncho.ai/sectors/healthcare","date":"15 October 2026","en":"Moncho''s healthcare map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Healthcare ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working ceiling for private-clinic software (draft)","url":"https://moncho.ai/sectors/healthcare/landscapes/primary-community-care-providers","date":"2024 census, vendor lists as analog","en":"2,898 clinics × 700 Tk/month × 12 ÷ 120 Tk/$ = $202,860\n2,898 clinics × 10,000 Tk/month × 12 ÷ 120 Tk/$ = $2.90 million\n\nAssumptions\n- Every one of 2,898 registered private hospitals and clinics pays every month\n- Low price is ChamberBD Standard 700 taka per month\n- High price is a hospital-management list of 10,000 taka per month\n- ChamberBD is a full clinic plan, not reminder-only\n- Community clinics are out\n- FX is 120 taka per dollar\n- Attach is unknown, so this is a ceiling, not demand","bn":"2,898 clinics × 700 Tk/month × 12 ÷ 120 Tk/$ = $202,860\n2,898 clinics × 10,000 Tk/month × 12 ÷ 120 Tk/$ = $2.90 million\n\nঅনুমান\n- নিবন্ধিত ২,৮৯৮টি বেসরকারি হাসপাতাল ও ক্লিনিক প্রতি মাসেই দেয়\n- নিম্ন দাম ChamberBD স্ট্যান্ডার্ড মাসে ৭০০ টাকা\n- উচ্চ দাম হাসপাতাল ম্যানেজমেন্ট তালিকায় মাসে ১০,০০০ টাকা\n- ChamberBD পুরো ক্লিনিক প্ল্যান, শুধু রিমাইন্ডার নয়\n- কমিউনিটি ক্লিনিক বাদ\n- ১২০ টাকায় এক ডলার\n- কতজন কিনবে জানা নেই, তাই এটি সিলিং, চাহিদা নয়","section":"size"}')), revision = revision + 1
WHERE id = 'missed-follow-up' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/healthcare/landscapes/primary-community-care-providers');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Transportation","url":"https://moncho.ai/sectors/transportation","date":"15 October 2026","en":"Moncho''s transportation map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Transportation ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'pooled-employee-transport-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/transportation');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"BBS Statistical Yearbook 2024 · cold storage and vegetables","url":"https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb","date":"2024","en":"Bangladesh Bureau of Statistics, Statistical Yearbook 2024 Table 7.03 records 4.5 million tonnes of national cold-storage capacity. Table 4.40 for 2023-24 shows vegetable production of 14,009 thousand tonnes, of which potato is 10,601 thousand tonnes. Potato output alone is larger than recorded cold-store capacity, so this is not the market for crate rental of mixed vegetables.","bn":"ইয়ারবুক ২০২৪, সারণি ৭.০৩-এ জাতীয় কোল্ড স্টোরেজ ক্ষমতা ৪৫ লাখ টন। সারণি ৪.৪০-এ ২০২৩-২৪ সালে সবজি ১ কোটি ৪০ লাখ ৯ হাজার টন, যার মধ্যে আলু ১ কোটি ৬ লাখ ১ হাজার টন। শুধু আলুই নথিভুক্ত কোল্ড স্টোরের চেয়ে বেশি। তাই এটি মিশ্র সবজির ক্রেট ভাড়ার বাজার নয়।","section":"facts"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://bbs.gov.bd/site/page/29855dc7-2a78-4cf2-b12c-507b0c65e3fb');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Moncho · Warehousing and storage","url":"https://moncho.ai/sectors/warehousing-and-storage","date":"15 October 2026","en":"Moncho''s warehousing and storage map shows neighbouring products and firms in this industry. It is a map, not proof this idea will sell.","bn":"Moncho এর Warehousing and storage ম্যাপে এই খাতের পাশের পণ্য ও প্রতিষ্ঠান দেখা যায়।","section":"maps"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working range for mixed-vegetable storage (draft)","url":"https://moncho.ai/sectors/warehousing-and-storage/landscapes/cold-chain-infrastructure","date":"2023-24 volume, potato tariff analog","en":"3,408,000 t × 25% × 1,000 kg/t × 6.75 Tk/kg ÷ 120 Tk/$ = $47.9 million\n\nAssumptions\n- Non-potato vegetables = 14,009,000 t minus 10,601,000 t potato (BBS 2023-24)\n- One quarter of that volume is stored\n- Price analog is the DAM potato ceiling of 6.75 taka per kg\n- FX is 120 taka per dollar\n- Not crate-rental demand in Rajshahi and Bogura\n- Occupancy is unknown","bn":"3,408,000 t × 25% × 1,000 kg/t × 6.75 Tk/kg ÷ 120 Tk/$ = $47.9 million\n\nঅনুমান\n- আলু বাদ দিয়ে সবজি = ১ কোটি ৪০ লাখ ৯ হাজার টন থেকে আলু ১ কোটি ৬ লাখ ১ হাজার টন বাদ (বিবিএস ২০২৩-২৪)\n- সেই পরিমাণের এক চতুর্থাংশ রাখা হয়\n- দামের তুলনা আলুর DAM সিলিং কেজিতে ৬.৭৫ টাকা\n- ১২০ টাকায় এক ডলার\n- রাজশাহী ও বগুড়ার ক্রেট ভাড়ার চাহিদা নয়\n- কতটা জায়গা ভরে সেটা জানা নেই","section":"size"}')), revision = revision + 1
WHERE id = 'produce-cold-chain' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/warehousing-and-storage/landscapes/cold-chain-infrastructure');

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

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Working figure for pump control kits (draft)","url":"https://moncho.ai/sectors/energy/landscapes/wm-solar-powered-pumping-mini-grid-water","date":"IDCOL pumps, India analog kit","en":"1,523 pumps × 2,200 INR ÷ 83 INR/$ = $40,369\n\nAssumptions\n- Each of IDCOL 1,523 operating pumps buys one kit\n- Price analog is 2,200 rupees\n- FX is 83 rupees per dollar\n- That kit is not IDCOL software sold as a service\n- IDCOL already runs the pumps","bn":"1,523 pumps × 2,200 INR ÷ 83 INR/$ = $40,369\n\nঅনুমান\n- IDCOL-এর চালু ১,৫২৩টি পাম্পের প্রতিটিতে একটি কিট\n- দামের তুলনা ২,২০০ রুপি\n- ৮৩ রুপিতে এক ডলার\n- এটি IDCOL-এর সফটওয়্যার সেবা নয়\n- পাম্পগুলো ইতিমধ্যে IDCOL চালায়","section":"size"}')), revision = revision + 1
WHERE id = 'solar-irrigation-control-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://moncho.ai/sectors/energy/landscapes/wm-solar-powered-pumping-mini-grid-water');

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
