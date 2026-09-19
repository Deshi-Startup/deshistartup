-- Retain plain-language ideas while grounding claims and first tests in evidence.
-- Forward-only: 0009 may already be applied in a collaborator’s local database.

UPDATE problem_text SET
  title = 'Mixed garment scraps are hard for recyclers to use',
  summary = 'Recyclers need fabric sorted by type, with reliable records of what each batch contains.',
  context = 'Garment factories produce leftover fabric, known as jhut. A Bangladesh recycling pilot found that poor sorting and missing fabric records made it hard for mills to find suitable material. Sorting improved during the pilot. A new service could help more factories and scrap dealers prepare batches that meet a recycler’s requirements.',
  unknown = 'Which types of fabric will recyclers buy regularly? After paying for sorting, trucks, and a fair cut to local scrap dealers, is there enough profit left over?'
WHERE problem_id = 'garment-offcuts' AND locale = 'en';

UPDATE problem_text SET
  summary = 'নানা ধরনের কাপড় মিশে গেলে রিসাইক্লিং কঠিন হয়। মিলে পাঠানোর আগে কাপড়ের ধরন আলাদা করে হিসাব রাখতে হয়।',
  context = 'কারখানায় কাটিংয়ের পর যে কাপড় বেঁচে যায়, সেটাই ঝুট। বাংলাদেশে একটি রিসাইক্লিং প্রকল্পে দেখা গেছে, কাপড় আলাদা করে বাছাই না করায় আর সুতার ধরন লিখে না রাখায় মিলের উপযোগী ঝুট খুঁজে পাওয়া কঠিন হচ্ছিল। প্রকল্প চলাকালে এই ব্যবস্থা উন্নত হয়েছে। আরও কারখানা ও ঝুট ব্যবসায়ীকে মিলের চাহিদামতো চালান তৈরি করে দিতে পারেন।'
WHERE problem_id = 'garment-offcuts' AND locale = 'bn';

UPDATE problem_text SET
  context = 'FAO’s 2022 Bangladesh investment plan identifies losses after harvest and a need for better cold storage, including for tomatoes. A short-term storage service could give farmers more time to sell. The right temperature and storage time depend on the crop and its condition.'
WHERE problem_id = 'produce-cold-chain' AND locale = 'en';

UPDATE problem_text SET
  context = 'FAO-এর ২০২২ সালের বাংলাদেশ বিনিয়োগ পরিকল্পনায় ফসল তোলার পর নষ্ট হয়ে যাওয়ার কথা এসেছে। টমেটোসহ কয়েকটি ফসলের জন্য ভালো হিমাগারের প্রয়োজনও তুলে ধরা হয়েছে। কয়েক দিন সংরক্ষণের ব্যবস্থা থাকলে চাষি বিক্রির জন্য কিছুটা সময় পেতে পারেন। কোন ফসল কত দিন ও কত তাপমাত্রায় ভালো থাকে, তা আগে জেনে নিতে হবে।'
WHERE problem_id = 'produce-cold-chain' AND locale = 'bn';

UPDATE approach_text SET
  description = 'Partner with an existing cold store that can keep your chosen crop at the right temperature. Rent out space by the crate. Check the crop quality on arrival, agree how long to store it, and arrange delivery when a wholesale buyer is ready.',
  business_model = 'Charge farmers or wholesale buyers a daily fee per crate. Test whether less spoilage or a better sale price leaves them with more money after storage and transport costs.',
  steps_json = '["Pick one vegetable (like tomatoes or peppers). Talk to five local farmers and two wholesale buyers about loads that spoiled recently.", "Agree the crop’s storage conditions with an experienced operator. Run a paid test with 20 crates and compare with a similar batch handled as usual.", "Track saleable weight, price, and all storage, handling, and transport costs. Check whether the farmer earned more than on the usual batch and wants to book again."]',
  prototype = 'Create a simple mobile log for crate bookings. Record crop type, crate count, arrival condition, storage temperature, costs, and final sale price. Compare net earnings with a similar batch handled as usual.'
WHERE approach_id = 'harvest-cooling' AND locale = 'en';

UPDATE approach_text SET
  description = 'নিজের হিমাগার বানানোর আগে এলাকার চালু হিমাগারের সাথে চুক্তি করে জায়গা নিন। বেছে নেওয়া ফসলের জন্য ঠিক তাপমাত্রা রাখা যাবে কি না, দেখে নিন। ক্রেট হিসেবে ভাড়া দিন, আসার সময় ফসলের মান যাচাই করুন আর কত দিন রাখা হবে তা ঠিক করে নিন। পাইকার ঠিক হলে ডেলিভারি দিন।',
  business_model = 'চাষি বা পাইকারের কাছ থেকে প্রতি ক্রেটের জন্য দৈনিক ভাড়া নিন। সবজি কম নষ্ট হলে বা ভালো দামে বিক্রি হলে বাড়তি যা আয় হবে, তা দিয়ে ভাড়া ও যাতায়াতের খরচ মিটিয়ে লাভ থাকে কি না দেখুন।',
  steps_json = '["টমেটো বা মরিচের মতো একটি নির্দিষ্ট সবজি বেছে নিন। সম্প্রতি সবজি পচে লোকসান হয়েছে এমন পাঁচজন চাষি ও দুজন পাইকারের সাথে কথা বলুন।", "অভিজ্ঞ হিমাগার পরিচালকের সাথে ফসল রাখার তাপমাত্রা ও সময় ঠিক করে নিন। ভাড়া নিয়ে ২০ ক্রেট দিয়ে পরীক্ষা করুন। একই রকম আরেক চালান আগের নিয়মে রেখে তুলনা করুন।", "কত কেজি বিক্রি হলো, কত দাম পাওয়া গেল আর রাখা, ওঠানো-নামানো ও যাতায়াতে মোট কত খরচ হলো লিখে রাখুন। আগের নিয়মের চেয়ে চাষির লাভ বেড়েছে কি না আর তিনি আবার বুকিং চান কি না জেনে নিন।"]',
  prototype = 'মোবাইলে ক্রেট বুকিংয়ের হিসাব রাখার একটি সহজ ফর্ম বানান। ফসলের নাম, ক্রেট সংখ্যা, আসার সময় অবস্থা, ঘরের তাপমাত্রা, খরচ আর বিক্রির দাম লিখে রাখুন। আগের নিয়মে রাখা একই রকম আরেক চালানের সাথে লাভ-লোকসান মিলিয়ে দেখুন।'
WHERE approach_id = 'harvest-cooling' AND locale = 'bn';

UPDATE problem_text SET
  context = 'REACH’s research in Khulna schools found gaps in water-quality checks and responsibility for repairs. Complex systems can fall out of use without maintenance. SafePani already tests a professional service model in schools and health centres. A new provider would need to find sites still missing reliable upkeep.'
WHERE problem_id = 'water-system-maintenance' AND locale = 'en';

UPDATE problem_text SET
  context = 'খুলনার স্কুলগুলো নিয়ে REACH-এর গবেষণায় নিয়মিত পানির মান পরীক্ষা ও মেরামতের দায়িত্বে ঘাটতি পাওয়া গেছে। দেখভাল না হলে জটিল পানির ব্যবস্থা নষ্ট হয়ে পড়ে থাকতে পারে। SafePani ইতিমধ্যে স্কুল ও স্বাস্থ্যকেন্দ্রে পেশাদার সার্ভিস দিয়ে এই সমস্যা সমাধানের কাজ করছে। নতুন করে শুরু করতে হলে কোথায় এখনো নিয়মিত সার্ভিস মেলে না, খুঁজে নিতে হবে।'
WHERE problem_id = 'water-system-maintenance' AND locale = 'bn';

UPDATE approach_text SET
  description = 'Group nearby schools or clinics under one maintenance plan. Arrange a trained technician for repairs and a qualified water-testing lab to set the tests and schedule for each site. Keep a simple record of results, breakdowns, and repairs for the managers.',
  business_model = 'School boards, clinic managers, or donors pay a monthly fee for agreed water tests, inspections, and repair visits. Quote major parts separately.',
  steps_json = '["Visit five schools or clinics that have water filters. Ask the managers how often the filters break, how much past repairs cost, and who pays the bills.", "Agree a one-month paid trial with one or two sites. Set testing and repair response times with the technician and lab, including what to do if water fails a safety test.", "Review the month’s lab results, breakdowns, response times, and costs with the manager. Ask whether they will pay to continue the service."]',
  signal = 'The manager renews because testing and repairs happen as agreed, and the fee covers your service costs.'
WHERE approach_id = 'reliable-water' AND locale = 'en';

UPDATE approach_text SET
  description = 'কাছাকাছি কয়েকটি স্কুল বা ক্লিনিক নিয়ে মাসিক সার্ভিসের চুক্তি করুন। মেরামতের জন্য প্রশিক্ষিত মিস্ত্রি রাখুন। পানি পরীক্ষায় দক্ষ ল্যাবের সাথে ঠিক করে নিন কোথায় কোন পরীক্ষা কত দিন পর পর দরকার। ফলাফল, ত্রুটি আর মেরামতের হিসাব কর্তৃপক্ষকে বুঝিয়ে দিন।',
  business_model = 'পানি পরীক্ষা, পরিদর্শন ও মেরামতের জন্য স্কুল কমিটি, ক্লিনিক বা দাতা সংস্থা মাসিক ফি দেবে। বড় কোনো যন্ত্রাংশ বদলানোর খরচ আলাদা করে জানান।',
  steps_json = '["পানির ফিল্টার আছে এমন পাঁচটি স্কুল বা ক্লিনিক ঘুরে দেখুন। তাদের ফিল্টার কত দিন পর পর নষ্ট হয়, আগে মেরামতে কত খরচ হয়েছে আর বিল কে দেয়, জেনে নিন।", "এক বা দুটি প্রতিষ্ঠানের সাথে ফি নিয়ে এক মাসের কাজ ঠিক করুন। মিস্ত্রি ও ল্যাবের সাথে পরীক্ষার সময় আর মেরামতে কত দ্রুত পৌঁছাবেন, ঠিক করে নিন। পরীক্ষায় পানি অনিরাপদ এলে কী করবেন, তাও ঠিক রাখুন।", "মাস শেষে ল্যাবের ফলাফল, কতবার পানি বন্ধ ছিল, সারাতে কত সময় লেগেছে আর খরচ কত হয়েছে, কর্তৃপক্ষকে দেখান। তাঁরা ফি দিয়ে সার্ভিস চালিয়ে যেতে চান কি না জেনে নিন।"]',
  signal = 'কথামতো পরীক্ষা ও মেরামত হওয়ায় কর্তৃপক্ষ চুক্তি নবায়ন করছে। পাওয়া ফি দিয়েও সার্ভিসের সব খরচ মিটছে।'
WHERE approach_id = 'reliable-water' AND locale = 'bn';

UPDATE problem_text SET
  title = 'Patients miss follow-up visits for long-term conditions',
  context = 'Simple’s work with a Bangladesh hypertension programme shows that patients miss follow-up visits and that calling can help bring them back. Simple already provides calling lists. The opportunity is to find smaller clinics whose existing tools do not meet their follow-up needs.'
WHERE problem_id = 'missed-follow-up' AND locale = 'en';

UPDATE problem_text SET
  title = 'প্রেসার বা ডায়াবেটিসের রোগীরা নিয়মিত ফলোআপে আসেন না',
  context = 'বাংলাদেশে উচ্চ রক্তচাপের চিকিৎসার একটি কর্মসূচিতে Simple-এর কাজ থেকে দেখা যায়, অনেক রোগী নিয়মিত ফলোআপে আসেন না। ফোন করে যোগাযোগ করলে তাঁদের ফিরিয়ে আনতে সাহায্য হয়। Simple-এ এমন কল লিস্ট আগেই আছে। ছোট ক্লিনিকের বর্তমান ব্যবস্থায় কোথায় ঘাটতি রয়ে গেছে, তা খুঁজে দেখতে হবে।'
WHERE problem_id = 'missed-follow-up' AND locale = 'bn';

UPDATE approach_text SET
  description = 'Give the clinic receptionist a simple daily list of patients who missed a doctor-requested follow-up, their contact number, and call status. Keep access limited to authorised clinic staff so they can arrange the next visit.',
  business_model = 'Charge clinics a monthly software fee. Test whether easier follow-up and less staff time are worth the fee to the clinic.',
  steps_json = '["Spend a morning at a small clinic. Ask the receptionist and doctor how they currently keep track of patients who do not show up.", "Make a one-page calling list with pretend patient names. Let the receptionist try it and compare the work with their current process.", "Run a two-week paid trial with the clinic’s approval and patients who agree to reminders. Keep records within the clinic. Track staff time and completed follow-up visits, not just bookings."]',
  prototype = 'Create a simple screen with fake patient names, appointment due dates, and call status buttons (Called, Busy, Rebooked). Include staff-only access. Use no real patient data in the prototype.'
WHERE approach_id = 'clinic-follow-up' AND locale = 'en';

UPDATE approach_text SET
  description = 'ডাক্তারের দেওয়া ফলোআপের তারিখে যাঁরা আসেননি, তাঁদের তালিকা রিসেপশনিস্টকে দিন। ফোন নম্বর আর কল করা হয়েছে কি না, সেটুকু থাকলেই শুরু করা যায়। কেবল দায়িত্বপ্রাপ্ত ক্লিনিককর্মী যেন তালিকাটি দেখতে পারেন ও পরের তারিখ ঠিক করে দিতে পারেন।',
  business_model = 'ক্লিনিকের কাছ থেকে মাসিক সফটওয়্যার ফি নিন। ফলোআপের কাজ সহজ হলে আর কর্মীদের সময় বাঁচলে ক্লিনিক এই ফি দিতে রাজি কি না, পরীক্ষা করুন।',
  steps_json = '["একটি ছোট ক্লিনিকে কিছুটা সময় কাটান। রোগী না এলে কর্মীরা কীভাবে ট্র্যাক করেন আর ডাক্তাররা কী চান, দেখে নিন।", "কাল্পনিক নাম দিয়ে এক পাতার কল লিস্ট বানান। রিসেপশনিস্টকে দিয়ে ব্যবহার করিয়ে দেখুন আগের নিয়মের চেয়ে কাজ সহজ হচ্ছে কি না।", "ক্লিনিকের অনুমতি নিয়ে দুই সপ্তাহ ফি নিয়ে কাজ করুন। যাঁরা রিমাইন্ডার পেতে রাজি, শুধু তাঁদের সাথে যোগাযোগ করুন। রোগীর তথ্য ক্লিনিকের মধ্যেই রাখুন। কর্মীদের কত সময় লাগল আর কতজন রোগী সত্যিই ফিরে এলেন, লিখে রাখুন।"]',
  prototype = 'কাল্পনিক নাম, অ্যাপয়েন্টমেন্টের তারিখ আর কলের অবস্থা দিয়ে একটি সহজ স্ক্রিন বানান। ফোন করা হয়েছে, নম্বর ব্যস্ত বা নতুন তারিখ নিয়েছেন, এমন অপশন রাখুন। কেবল দায়িত্বপ্রাপ্ত কর্মী ঢুকতে পারবেন। প্রোটোটাইপে আসল রোগীর কোনো তথ্য রাখবেন না।'
WHERE approach_id = 'clinic-follow-up' AND locale = 'bn';

UPDATE problem_text SET
  context = 'The World Bank’s 2025 Bangladesh heat study links rising heat to health problems and lost workdays. It makes workplace cooling worth investigating. Each factory needs an assessment of its roof, ventilation, and heat from machinery before choosing an upgrade.',
  unknown = 'Which affordable fixes help workers in this factory? Who approves the work, and what evidence would make the owner pay for it?'
WHERE problem_id = 'workplace-heat' AND locale = 'en';

UPDATE problem_text SET
  context = 'বিশ্বব্যাংকের ২০২৫ সালের বাংলাদেশবিষয়ক গবেষণায় বাড়তি গরমের সাথে অসুস্থতা ও কর্মদিবস হারানোর সম্পর্ক উঠে এসেছে। তাই কারখানার গরম কমানোর সুযোগ খুঁজে দেখা যায়। কাজ বেছে নেওয়ার আগে প্রতিটি কারখানার ছাদ, বাতাস চলাচল আর যন্ত্রের তাপ বুঝে নিতে হবে।',
  unknown = 'এই কারখানায় কম খরচের কোন ব্যবস্থায় কর্মীদের স্বস্তি মিলবে? কাজের অনুমতি কে দেবেন আর কী ফল দেখলে মালিক টাকা খরচ করতে রাজি হবেন?'
WHERE problem_id = 'workplace-heat' AND locale = 'bn';

UPDATE approach_text SET
  description = 'Offer targeted fixes such as reflective roof coatings, better ventilation, or shade. Work with a qualified engineer to choose a suitable change. Measure conditions before and after the work to see whether it helps.',
  steps_json = '["Walk a hot factory floor with the safety manager. Measure the room temperature and ask workers where the air feels most trapped.", "With a qualified engineer, choose one affordable fix and agree a small paid test. Keep existing worker protections in place.", "Compare temperatures and worker feedback on shifts with similar weather and production. If conditions improve, ask whether the owner will pay to extend the work."]',
  signal = 'Comparable measurements and worker feedback show an improvement, and the owner pays to extend the work.',
  prototype = 'Create a simple survey and comparison report. Record weather, production conditions, indoor temperatures, and worker feedback before and after the work. Show what changed, including results that did not improve.'
WHERE approach_id = 'cooler-workplaces' AND locale = 'en';

UPDATE approach_text SET
  description = 'ছাদে তাপ ফেরত পাঠায় এমন রং, বাতাস চলাচলের ব্যবস্থা বা ছায়া দিয়ে গরম কমানোর কাজ নিতে পারেন। কোনটা ওই ভবনে ঠিক হবে, দক্ষ প্রকৌশলীকে দিয়ে দেখে নিন। কাজের আগে ও পরের পরিবেশ মেপে বুঝুন কতটা কাজে লাগল।',
  steps_json = '["নিরাপত্তার দায়িত্বে থাকা ম্যানেজারের সাথে সবচেয়ে গরম ফ্লোরটি ঘুরে দেখুন। তাপমাত্রা মাপুন আর কর্মীদের কাছে শুনুন কোথায় বাতাস আটকে থাকে।", "দক্ষ প্রকৌশলীর পরামর্শে কম খরচের একটি ব্যবস্থা বেছে নিন। ছোট অংশে পরীক্ষা করার খরচ মালিকের সাথে ঠিক করে নিন। কর্মীদের জন্য চালু সুরক্ষার ব্যবস্থা বজায় রাখুন।", "একই রকম আবহাওয়া ও উৎপাদনের শিফটে আগের ও পরের তাপমাত্রা মিলিয়ে দেখুন। কর্মীদের মতামতও নিন। উন্নতি হলে মালিক আরও কাজ করাতে চান কি না জেনে নিন।"]',
  signal = 'তুলনা করার মতো মাপজোক ও কর্মীদের মতামতে উন্নতি দেখা যাচ্ছে। মালিক আরও জায়গায় কাজ করাতে ফি দিচ্ছেন।',
  prototype = 'পরিবেশ মাপার ও তুলনা করার একটি সহজ রিপোর্ট বানান। আবহাওয়া, উৎপাদনের অবস্থা, ঘরের তাপমাত্রা আর কর্মীদের মতামত আগে-পরে লিখে রাখুন। কোথায় উন্নতি হলো আর কোথায় হলো না, দুটোই দেখান।'
WHERE approach_id = 'cooler-workplaces' AND locale = 'bn';

UPDATE problem_text SET
  context = 'IEEFA’s 2025 Bangladesh rooftop solar analysis identifies maintenance gaps and dust buildup as risks to electricity output. Grid outages can also reduce generation. A service should find the cause of low output before promising savings from cleaning.'
WHERE problem_id = 'solar-maintenance' AND locale = 'en';

UPDATE problem_text SET
  context = 'IEEFA-এর ২০২৫ সালের বাংলাদেশবিষয়ক বিশ্লেষণে সোলারের নিয়মিত রক্ষণাবেক্ষণের ঘাটতি ও ধুলো জমে উৎপাদন কমার ঝুঁকি এসেছে। গ্রিডের বিদ্যুৎ বন্ধ থাকলেও উৎপাদন কমতে পারে। তাই পরিষ্কার করে কতটা সাশ্রয় হবে বলার আগে বিদ্যুৎ কম হওয়ার কারণ খুঁজে নিতে হবে।'
WHERE problem_id = 'solar-maintenance' AND locale = 'bn';

UPDATE approach_text SET
  description = 'Arrange regular upkeep by trained solar technicians: clean panels, inspect inverters and wiring, and fix faults. Coordinate with the installer and follow the equipment’s maintenance and warranty instructions.',
  steps_json = '["Interview three factory owners with rooftop solar. Ask how often they wash their panels and how they know if a panel stops producing power.", "Offer a paid checkup with a trained solar technician. Agree safe roof access and the maintenance method with the installer, then inspect and clean the system.", "Compare generation before and after, accounting for sunlight and grid outages. If measured savings cover your fee, offer a quarterly maintenance contract."]',
  prototype = 'Create a rooftop maintenance report. Record panel condition, faults, work done, generation, sunlight, and grid outages. Compare output under similar conditions to estimate any savings from the work.'
WHERE approach_id = 'solar-upkeep' AND locale = 'en';

UPDATE approach_text SET
  summary = 'সোলার প্যানেলে কেন কম বিদ্যুৎ তৈরি হচ্ছে তা খুঁজে বের করুন। প্রশিক্ষিত টেকনিশিয়ান দিয়ে পরিষ্কার ও মেরামত করান।',
  description = 'সোলারের প্রশিক্ষিত টেকনিশিয়ান দিয়ে নিয়মিত প্যানেল পরিষ্কার, ইনভার্টার ও তার পরীক্ষা আর ত্রুটি সারানোর সার্ভিস দিন। যাঁরা সিস্টেম বসিয়েছেন তাঁদের সাথে কাজ মিলিয়ে নিন। যন্ত্রের রক্ষণাবেক্ষণ ও ওয়ারেন্টির নিয়ম মেনে চলুন।',
  steps_json = '["ছাদে সোলার আছে এমন তিনজন কারখানা মালিকের সাথে কথা বলুন। তাঁরা কত দিন পর পর প্যানেল পরিষ্কার করান আর উৎপাদন কমলে কীভাবে বোঝেন, জেনে নিন।", "প্রশিক্ষিত সোলার টেকনিশিয়ান নিয়ে ফি নিয়ে পরিদর্শনের প্রস্তাব দিন। সোলার বসানোর কোম্পানির সাথে ছাদে নিরাপদে ওঠা ও কাজের পদ্ধতি ঠিক করে সিস্টেম পরীক্ষা ও পরিষ্কার করান।", "আগে-পরের বিদ্যুৎ উৎপাদন মিলিয়ে দেখুন। রোদ কতটা ছিল আর গ্রিড কতক্ষণ বন্ধ ছিল, তাও হিসাবে নিন। মেপে পাওয়া সাশ্রয়ে ফি উঠে এলে তিন মাসের সার্ভিস চুক্তির প্রস্তাব দিন।"]',
  prototype = 'ছাদের কাজের একটি সহজ রিপোর্ট বানান। প্যানেলের অবস্থা, ত্রুটি, কী কাজ হলো, বিদ্যুৎ উৎপাদন, রোদের অবস্থা আর গ্রিড বন্ধ থাকার সময় লিখে রাখুন। একই রকম পরিবেশের হিসাব মিলিয়ে কাজ থেকে কতটা সাশ্রয় হলো, বের করুন।'
WHERE approach_id = 'solar-upkeep' AND locale = 'bn';
