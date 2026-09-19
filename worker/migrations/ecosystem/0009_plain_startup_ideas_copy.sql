-- Simplify startup ideas copy to casual eighth-grade English and natural spoken Bangladeshi founder Bangla.

-- 1. Garment offcuts
UPDATE problem_text SET
  title = 'Factories throw away fabric scraps that recyclers want',
  summary = 'Leftover fabric gets mixed together into junk, making it hard for recyclers to reuse.',
  customer = 'Garment factories, local scrap dealers, and textile recycling mills.',
  context = 'Clothing factories in Bangladesh toss out tons of fabric scraps every day. Recycling mills want to buy these scraps, but only if they are clean and sorted by fabric type (like 100% cotton). There are big software tools to track scraps, but someone still needs to do the hands-on work: checking the cloth at the factory, sorting it into clean piles, and getting it onto trucks.',
  unknown = 'Which types of fabric will recyclers guarantee to buy? After paying for sorting, trucks, and a fair cut to local scrap dealers, is there enough profit left over?'
WHERE problem_id = 'garment-offcuts' AND locale = 'en';

UPDATE problem_text SET
  title = 'কারখানার ঝুট কাপড় আলাদা না থাকায় রিসাইক্লিং কঠিন হয়',
  summary = 'নানা পদের কাপড় একসাথে মিশে গেলে রিসাইক্লিং কারখানায় তা আর ব্যবহার করা যায় না।',
  customer = 'পোশাক কারখানা, স্থানীয় ঝুট ব্যবসায়ী আর টেক্সটাইল রিসাইক্লিং মিল।',
  context = 'বাংলাদেশের পোশাক কারখানায় প্রতিদিন কাটিংয়ের পর প্রচুর কাপড় বেঁচে যায় (ঝুট)। রিসাইক্লিং কারখানাগুলো এগুলো কিনে সুতা বানাতে চায়, কিন্তু কাপড়গুলো পরিষ্কার আর এক জাতের (যেমন ১০০% সুতি) হতে হয়। কাপড়ের হিসাব রাখার সফটওয়্যার বাজারে থাকলেও মাঠে নেমে কাজ করার লোক কম: কারখানায় গিয়ে কাপড় যাচাই করা, ভালো করে বাছাই করা আর ট্রাকে তোলার কাজটা কাউকে করতে হয়।',
  unknown = 'কোন কোন জাতের কাপড় রিসাইক্লাররা নিয়মিত কিনতে রাজি হবেন? বাছাই, ট্রাক ভাড়া আর ঝুট ব্যবসায়ীকে ভালো দাম দেওয়ার পর ব্যবসায় লাভ থাকবে কি?'
WHERE problem_id = 'garment-offcuts' AND locale = 'bn';

UPDATE approach_text SET
  title = 'Sell sorted garment scraps directly to recyclers',
  summary = 'Connect factories that have leftover fabric with recycling mills that need that exact cloth.',
  description = 'First, ask two recycling mills what fabric they need (like pure white cotton scraps). Then, team up with a garment factory and its local scrap dealer to sort, weigh, and pack only that cloth. Finally, hire a truck to deliver it straight to the mill.',
  business_model = 'Take a small commission or service fee on every delivery the buyer accepts. Make sure the sale price easily covers the sorting labor, truck rental, and a fair payout to the scrap dealer.',
  steps_json = '["Talk to two textile recyclers. Find out what fabric they buy, why they reject loads, and the smallest order they will take.", "Work with one clothing factory and its scrap dealer. Pack and weigh a small test batch that matches what the recycler asked for, and get their approval before collecting more.", "Deliver one paid load. Check the final weight, pay all truck and labor bills, and ask both sides if they want to do another run."]',
  signal = 'The recycler places another order for the same cloth, and you make a profit after paying all costs.',
  prototype = 'Create a simple shipment log on your phone or spreadsheet. Record the fabric type, factory name, weight, quality check notes, truck fee, and what the recycler paid. Use made-up test numbers to make sure your math works before real deliveries.'
WHERE approach_id = 'garment-offcuts-approach' AND locale = 'en';

UPDATE approach_text SET
  title = 'পোশাক কারখানার ঝুট কাপড় রিসাইক্লিং মিলে বিক্রি করুন',
  summary = 'কারখানার বেঁচে যাওয়া কাপড় বাছাই করে সরাসরি রিসাইক্লিং মিলের কাছে পৌঁছে দিন।',
  description = 'প্রথমে দুটি রিসাইক্লিং মিলের সাথে কথা বলে জেনে নিন তাদের ঠিক কী ধরনের কাপড় দরকার (যেমন ১০০% সাদা সুতি কাপড়)। এরপর একটি পোশাক কারখানা ও তাদের ঝুট ব্যবসায়ীর সাথে চুক্তি করে শুধু সেই কাপড় আলাদা করে ওজন করুন। সবশেষে ট্রাকে করে কাপড়টি সরাসরি রিসাইক্লিং কারখানায় পৌঁছে দিন।',
  business_model = 'মিল কাপড় বুঝে নেওয়ার পর প্রতি চালানে একটি নির্দিষ্ট কমিশন বা সার্ভিস ফি নিন। বিক্রির টাকা দিয়ে যেন বাছাইয়ের মজুরি, ট্রাক ভাড়া আর ঝুট ব্যবসায়ীর পাওনা মিটিয়েও আপনার হাতে ভালো লাভ থাকে।',
  steps_json = '["দুটি রিসাইক্লিং মিলের সাথে কথা বলুন। তারা কোন কাপড় কেনে, কী কারণে চালান ফেরত দেয় আর একবারে কত কেজি মাল নেয়, জেনে নিন।", "একটি পোশাক কারখানা ও তাদের ঝুট ব্যবসায়ীর সাথে মিলে অল্প কিছু বাছাই করা কাপড়ের বস্তা রেডি করুন। বেশি সংগ্রহের আগে মিলের ম্যানেজারকে স্যাম্পল দেখিয়ে নিশ্চিত হয়ে নিন।", "প্রথম চালানটি পৌঁছে দিয়ে পেমেন্ট বুঝে নিন। ট্রাক ভাড়া ও মজুরির সব খরচ বাদ দিয়ে লাভ কেমন থাকে দেখুন। দুই পক্ষই আবার কাজ করতে রাজি কি না জেনে নিন।"]',
  signal = 'রিসাইক্লিং মিল আবার একই কাপড়ের অর্ডার দিচ্ছে এবং সব খরচ মিটিয়ে আপনার হাতে পরিষ্কার লাভ থাকছে।',
  prototype = 'ফোন বা স্প্রেডশিটে চালানের হিসাব রাখার একটি সহজ খসড়া বানান। কাপড়ের জাত, কারখানার নাম, ওজন, বাছাইয়ের নোট, ট্রাক ভাড়া আর মিল কত টাকা দিল, তা লিখে রাখুন। আসল কাজে নামার আগেই কাল্পনিক সংখ্যা বসিয়ে লাভ-লোকসান মিলিয়ে দেখুন।'
WHERE approach_id = 'garment-offcuts-approach' AND locale = 'bn';

-- 2. Cold storage by the crate (harvest-cooling)
UPDATE problem_text SET
  title = 'Fresh vegetables rot in the heat before finding a buyer',
  summary = 'Freshly picked crops spoil fast if farmers cannot keep them cool for a few days.',
  customer = 'Farmer groups and produce wholesalers near major harvest hubs.',
  context = 'When crops come off the fields, heat and humidity start spoiling them right away. Farmers often have to dump their fresh vegetables at dirt-cheap prices because they have no place to keep them cool. Big cold storage facilities in Bangladesh mostly keep potatoes for months. Fresh vegetables only need a chilled room for two to four days while farmers line up a good buyer.',
  unknown = 'Does chilling the vegetables bring in enough extra money to cover electricity, storage rent, and trucks? Who takes the hit if crops still go bad? How do you make money when harvest season ends?'
WHERE problem_id = 'produce-cold-chain' AND locale = 'en';

UPDATE problem_text SET
  title = 'ভালো ক্রেতা পাওয়ার আগেই গরমে শাকসবজি নষ্ট হয়ে যায়',
  summary = 'ফসল তোলার পর কয়েক দিন ঠাণ্ডায় রাখার ব্যবস্থা না থাকলে শাকসবজি দ্রুত পচে যায়।',
  customer = 'কাঁচাবাজারের পাইকারি ক্রেতা ও ফসল তোলার এলাকার চাষিদের দল।',
  context = 'জমি থেকে ফসল তোলার পরপরই গরম আর ভ্যাপসা আবহাওয়ায় শাকসবজি দ্রুত নষ্ট হতে থাকে। ঠাণ্ডায় রাখার জায়গা না থাকায় চাষিরা অনেক সময় পানির দরে সবজি বিক্রি করতে বাধ্য হন। দেশের বড় কোল্ড স্টোরেজগুলো মূলত আলু রাখার জন্য তৈরি। অথচ টাটকা শাকসবজি কেবল ২ থেকে ৪ দিন ঠাণ্ডা ঘরে রাখতে পারলেই চাষিরা ভালো ক্রেতা খুঁজে নেওয়ার সময় পান।',
  unknown = 'বিদ্যুৎ, ভাড়া আর ট্রাকের খরচ মিটিয়ে সবজি ঠাণ্ডায় রাখলে বাড়তি লাভ থাকবে কি? কোনো কারণে সবজি নষ্ট হলে ক্ষতিপূরণ কে দেবে? আর ফসল তোলার মৌসুম শেষ হলে বাকি দিনগুলোতে আয় আসবে কীভাবে?'
WHERE problem_id = 'produce-cold-chain' AND locale = 'bn';

UPDATE approach_text SET
  title = 'Rent cold storage by the crate for fresh harvests',
  summary = 'Help farmers keep vegetables and fruits fresh for a few days until they find a good buyer.',
  description = 'Partner with an existing cold storage building instead of building your own. Rent out cool space by the plastic crate so farmers can store vegetables for two to four days. Check the crop quality when crates arrive, keep them cold, and deliver them as soon as a wholesale buyer is ready.',
  business_model = 'Farmers or wholesale buyers pay a small daily fee per crate. They gladly pay because selling crisp, fresh vegetables earns them far more money than selling wilted produce.',
  steps_json = '["Pick one vegetable (like tomatoes or peppers). Talk to five local farmers and two wholesale buyers about loads that spoiled recently.", "Partner with a nearby cold storage owner to set up a cool room. Run a small paid test with 20 crates, while keeping a matching batch at normal room temperature to compare.", "Track how much good produce sells, the final price, and all electricity and rental costs. Check if the farmer made more money and wants to book again."]',
  signal = 'The customer books another batch because selling crisp vegetables paid for your fee and left them with extra profit.',
  prototype = 'Create a simple mobile log for crate bookings. Record the vegetable type, crate count, arrival condition, daily storage temperature, buyer details, and final sale price. Compare profits against normal uncooled crops to show the value.'
WHERE approach_id = 'harvest-cooling' AND locale = 'en';

UPDATE approach_text SET
  title = 'ফসল তোলার পর ক্রেট হিসেবে হিমাগারের জায়গা ভাড়া দিন',
  summary = 'ভালো পাইকার না পাওয়া পর্যন্ত শাকসবজি যেন গরমে নষ্ট না হয়, সেই ব্যবস্থা করুন।',
  description = 'নিজের কোল্ড স্টোরেজ বানানোর দরকার নেই, এলাকার চালু কোনো হিমাগারের সাথে চুক্তি করে কিছু জায়গা নিন। চাষিদের কাছ থেকে প্লাস্টিকের ক্রেট হিসেবে শাকসবজি রাখুন। ফসল আসার সময় মান যাচাই করে নিন, ঠাণ্ডা ঘরে ভালো রাখুন আর পাইকার ঠিক হলে দ্রুত ডেলিভারি দিন।',
  business_model = 'চাষি বা পাইকারি ব্যবসায়ী প্রতি ক্রেট আর দিন হিসেবে ছোট একটি ভাড়া দেবেন। সবজি সতেজ থাকায় বাজারে ভালো দামে বিক্রি হবে, ফলে এই ভাড়া দিয়েও তাঁদের বেশ ভালো লাভ থাকবে।',
  steps_json = '["টমেটো বা মরিচের মতো একটি নির্দিষ্ট সবজি বেছে নিন। সম্প্রতি সবজি পচে লোকসান হয়েছে এমন পাঁচজন চাষি ও দুজন পাইকারের সাথে কথা বলুন।", "স্থানীয় একটি কোল্ড স্টোরেজের সাথে কথা বলে ঠাণ্ডা ঘরের ব্যবস্থা করুন। অল্প ভাড়ায় ২০ ক্রেট সবজি রেখে পরীক্ষা করুন, আর সাধারণ তাপমাত্রায় রাখা সবজির সাথে মান তুলনা করে দেখুন।", "কত কেজি সবজি ভালো থাকল, কত দামে বিক্রি হলো আর মোট কত খরচ হলো লিখে রাখুন। চাষি বেশি লাভ করতে পেরেছেন কি না আর আবার বুকিং দিতে চান কি না জেনে নিন।"]',
  signal = 'হিমাগারের ভাড়া মেটানোর পরও চাষি বা পাইকারের হাতে বাড়তি লাভ থাকছে এবং তিনি পরের চালানের জন্যও বুকিং দিচ্ছেন।',
  prototype = 'মোবাইলে ক্রেট বুকিংয়ের হিসাব রাখার একটি সহজ ফর্ম বানান। ফসলের নাম, ক্রেট সংখ্যা, আসার সময় সবজির অবস্থা, ঘরের তাপমাত্রা, ক্রেতার তথ্য আর বিক্রির দাম লিখে রাখুন। ঠাণ্ডা ছাড়া সাধারণ সবজির চেয়ে কত বাড়তি আয় হলো, তা হিসাব করে দেখুন।'
WHERE approach_id = 'harvest-cooling' AND locale = 'bn';

-- 3. Reliable drinking water (reliable-water)
UPDATE problem_text SET
  title = 'Community water filters break down with no one to fix them',
  summary = 'Clean water taps stop working when pumps and filters are left without routine repairs.',
  customer = 'Schools, rural health clinics, and charities that run community water plants.',
  context = 'In coastal areas like Khulna, charities and donors install expensive water treatment plants to filter out salt and dirt. But when a small pump, valve, or pipe breaks, nobody is responsible for fixing it. Taps sit dry for months, forcing children and families to drink salty or unsafe water again.',
  unknown = 'Who actually controls the local budget to pay for monthly upkeep? Can a repair technician visit enough nearby water points in one neighborhood to make a full-time living?'
WHERE problem_id = 'water-system-maintenance' AND locale = 'en';

UPDATE problem_text SET
  title = 'নিয়মিত মেরামতের অভাবে এলাকার পানির ফিল্টার নষ্ট হয়ে পড়ে থাকে',
  summary = 'পানির পাম্প আর ফিল্টার নিয়মিত দেখভাল না করলে কল দিয়ে আর নিরাপদ পানি মেলে না।',
  customer = 'স্কুল, ইউনিয়ন স্বাস্থ্য ক্লিনিক ও এলাকার যেসব সংস্থা পানির প্ল্যান্ট চালায়।',
  context = 'উপকূলীয় খুলনার মতো এলাকায় দাতাসংস্থাগুলো লবণ ও ময়লা দূর করতে অনেক টাকা দিয়ে ওয়াটার ফিল্টার বসায়। কিন্তু ছোটখাটো একটা ভালভ, পাইপ বা পাম্প নষ্ট হলে সেটা সারানোর কোনো লোক থাকে না। মাসের পর মাস কল বন্ধ থাকে, ফলে মানুষ আবার বাধ্য হয়ে লবণাক্ত বা অনিরাপদ পানি খেতে শুরু করে।',
  unknown = 'নিয়মিত মেরামতের বাজেট আসলে কার হাতে থাকে? একজন টেকনিশিয়ান এক এলাকায় ঘুরে ঘুরে সার্ভিস দিয়ে নিজের সংসার চালানোর মতো আয় করতে পারবেন কি?'
WHERE problem_id = 'water-system-maintenance' AND locale = 'bn';

UPDATE approach_text SET
  title = 'A regular repair and testing service for clean drinking water',
  summary = 'Keep water filters and pumps running in schools and clinics with scheduled checkups and quick repairs.',
  description = 'Group five to ten nearby schools or clinics under one shared maintenance plan. Hire a trusted local mechanic to handle urgent breakdowns, send water samples to a certified lab once a month, and keep a clean repair log for the building managers.',
  business_model = 'School boards, clinic managers, or donors pay a flat monthly subscription. They get guaranteed water testing and same-day repair visits without chasing down random plumbers.',
  steps_json = '["Visit five schools or clinics that have water filters. Ask the managers how often the filters break, how much past repairs cost, and who pays the bills.", "Sign a one-month paid trial with one or two sites. Line up a reliable local plumber and a certified lab, and set a promise to fix broken taps within 24 hours.", "Run the service for a full month. Show the managers that taps stayed on and water tested clean, then ask them to sign an annual maintenance contract."]',
  signal = 'The school or clinic signs a yearly contract because their water never stopped running and repairs happened right away.',
  prototype = 'Build a simple checklist on your phone for site visits. Log water filter condition, test dates, lab results, repair notes, and response times. Keep it focused on tracking maintenance rather than building fancy automated sensors.'
WHERE approach_id = 'reliable-water' AND locale = 'en';

UPDATE approach_text SET
  title = 'খাবার পানির ফিল্টার ও পাম্প নিয়মিত মেরামতের সার্ভিস',
  summary = 'নিয়মিত পরীক্ষা ও দ্রুত মেরামতের দায়িত্ব নিয়ে স্কুল আর ক্লিনিকের পানির ব্যবস্থা সচল রাখুন।',
  description = 'পাশাপাশি থাকা ৫ থেকে ১০টি স্কুল বা ক্লিনিক নিয়ে একটি মাসিক সার্ভিস প্ল্যান তৈরি করুন। স্থানীয় একজন দক্ষ মিস্ত্রি ঠিক রাখুন যেন কিছু নষ্ট হলে সাথে সাথে সারিয়ে দেওয়া যায়। মাসে একবার ল্যাবে পানি পরীক্ষা করান আর পুরো কাজের রিপোর্ট ক্লায়েন্টকে বুঝিয়ে দিন।',
  business_model = 'স্কুল কমিটি, ক্লিনিক কর্তৃপক্ষ বা দাতা সংস্থা প্রতি মাসে একটি নির্দিষ্ট সাবস্ক্রিপশন ফি দেবে। এর বদলে তারা নিয়মিত পানি পরীক্ষা আর দিনে দিনেই নষ্ট কল সারানোর নিশ্চয়তা পাবে।',
  steps_json = '["পানির ফিল্টার আছে এমন পাঁচটি স্কুল বা ক্লিনিক ঘুরে দেখুন। তাদের ফিল্টার কত দিন পর পর নষ্ট হয়, আগে মেরামতে কত খরচ হয়েছে আর বিল কে দেয়, জেনে নিন।", "এক বা দুটি প্রতিষ্ঠানের সাথে এক মাসের পেইড ট্রায়াল শুরু করুন। স্থানীয় একজন মিস্ত্রি ও টেস্টিং ল্যাব ঠিক রাখুন, যেন কল নষ্ট হলে ২৪ ঘণ্টার মধ্যে সারিয়ে দেওয়া যায়।", "পুরো এক মাস সার্ভিস দিন। পানি বন্ধ হয়নি আর ল্যাবে পানি নিরাপদ এসেছে দেখিয়ে প্রতিষ্ঠানটিকে সারা বছরের জন্য চুক্তি করতে বলুন।"]',
  signal = 'পানি কখনো বন্ধ না থাকায় এবং দ্রুত মেরামত হওয়ায় স্কুল বা ক্লিনিক পুরো বছরের চুক্তি নবায়ন করছে।',
  prototype = 'পরিদর্শনের হিসাব রাখার জন্য ফোনে একটি সহজ চেকলিস্ট বানান। ফিল্টারের অবস্থা, পরীক্ষার তারিখ, ল্যাবের রেজাল্ট, মেরামতের বিবরণ আর মিস্ত্রির আসার সময় লিখে রাখুন। জটিল সেন্সর বানানোর বদলে নিয়মিত কাজের হিসাব রাখার ওপর জোর দিন।'
WHERE approach_id = 'reliable-water' AND locale = 'bn';

-- 4. Clinic follow-up (clinic-follow-up)
UPDATE problem_text SET
  title = 'Patients with chronic illnesses stop coming back for checkups',
  summary = 'Small clinics struggle to track patients who miss routine visits for high blood pressure or diabetes.',
  customer = 'Small private clinics, diagnostic centres, and NGOs treating long-term conditions.',
  context = 'Many patients in Bangladesh visit a doctor once, take medicine for a week or two, and never return for their follow-up visit. Without regular checkups, conditions like high blood pressure and diabetes quietly get worse. Small clinics do not have fancy hospital systems; receptionists are busy and paper registers make it almost impossible to see who was supposed to come in today.',
  unknown = 'Why do patients skip their visits—do they forget, can they not afford travel, or are clinic lines too long? Will a busy clinic owner pay money every month just to bring patients back?'
WHERE problem_id = 'missed-follow-up' AND locale = 'en';

UPDATE problem_text SET
  title = 'প্রেসার বা ডায়াবেটিসের রোগীরা প্রথমবার দেখিয়ে আর ফলোআপে আসেন না',
  summary = 'যেসব রোগী নিয়মিত চেকআপের দিন মিস করেন, ছোট ক্লিনিকগুলো সহজে তাদের খোঁজ রাখতে পারে না।',
  customer = 'ছোট প্রাইভেট ক্লিনিক, ডায়াগনস্টিক সেন্টার ও ডায়াবেটিস বা প্রেসারের চিকিৎসা দেওয়া প্রতিষ্ঠান।',
  context = 'বাংলাদেশে অনেকেই ডাক্তারের কাছে একবার গিয়ে দুই সপ্তাহ ওষুধ খেয়ে আর ফলোআপে যান না। কিন্তু নিয়মিত চেকআপ না করালে প্রেসার বা ডায়াবেটিসের মতো রোগ ধীরে ধীরে বড় ক্ষতি করে। ছোট ক্লিনিকগুলোতে বড় হাসপাতালের মতো সফটওয়্যার থাকে না। খাতার পাতায় নাম লিখে রাখায় আজ কার আসার কথা ছিল তা রিসেপশনিস্টদের পক্ষে খুঁজে বের করা কঠিন হয়ে পড়ে।',
  unknown = 'রোগীরা কেন আসেন না – স্রেফ ভুলে যান, নাকি যাতায়াতের খরচ ও লম্বা লাইনের কারণে আসেন না? নিয়মিত রোগী ফিরিয়ে আনতে ক্লিনিক কি প্রতি মাসে সফটওয়্যার ফি দিতে রাজি হবে?'
WHERE problem_id = 'missed-follow-up' AND locale = 'bn';

UPDATE approach_text SET
  title = 'A simple reminder tool for small medical clinics',
  summary = 'Help clinic receptionists call patients who missed their checkups and rebook their visits.',
  description = 'Build a dead-simple daily list for the clinic receptionist: which patients are overdue for a visit, their phone number, and a checkbox to log whether someone called them. Doctors focus on medical care; your tool helps the front desk keep the appointment calendar full.',
  business_model = 'Clinics pay a small monthly software fee. The tool pays for itself because bringing back even a few extra patients covers the monthly fee through doctor and test charges.',
  steps_json = '["Spend a morning at a small clinic. Ask the receptionist and doctor how they currently keep track of patients who do not show up.", "Make a simple one-page calling list with pretend patient names on paper or a spreadsheet. Let the receptionist test it and see if it takes less than five minutes a day.", "Run a two-week paid trial with the clinic''s permission. Track how many overdue patients pick up the phone, say thank you, and book a visit."]',
  signal = 'The receptionist checks the list every morning, and the clinic owner happily pays for the next month.',
  prototype = 'Create a simple web screen with fake patient names, appointment due dates, and call status buttons (Called, Busy, Rebooked). Keep all real patient medical details out of the tool.'
WHERE approach_id = 'clinic-follow-up' AND locale = 'en';

UPDATE approach_text SET
  title = 'ছোট ক্লিনিকের রোগীদের ফলোআপে ডাকার সহজ রিমাইন্ডার টুল',
  summary = 'যেসব রোগী চেকআপের দিন মিস করেছেন, ক্লিনিকের কর্মীদের তাদের ফোন দিয়ে নতুন তারিখ নেওয়ার ব্যবস্থা করে দিন।',
  description = 'ক্লিনিকের রিসেপশনিস্টের জন্য একটি সহজ দৈনিক তালিকা বানিয়ে দিন: আজ কার আসার কথা ছিল, রোগীর ফোন নম্বর আর ফোন করার পর কী কথা হলো তা লিখে রাখার অপশন। ডাক্তার চিকিৎসা করবেন, আর আপনার এই টুল রিসেপশনকে প্রতিদিনের রোগী ঠিক রাখতে সাহায্য করবে।',
  business_model = 'ক্লিনিক প্রতি মাসে একটি ছোট সফটওয়্যার ফি দেবে। মাসে কয়েকজন বাড়তি রোগী ফিরে এলেই ক্লিনিকের যে ডাক্তার ও টেস্টের ফি বাড়ে, তা দিয়ে এই সফটওয়্যারের খরচ অনায়াসে উঠে যায়।',
  steps_json = '["একটি ছোট ক্লিনিকে কিছুটা সময় কাটান। রোগী না এলে কর্মীরা কীভাবে ট্র্যাক করেন আর ডাক্তাররা কী চান, দেখে নিন।", "কাল্পনিক নাম দিয়ে কাগজে বা স্প্রেডশিটে এক পাতার একটি সহজ কল লিস্ট বানান। রিসেপশনিস্টকে দিয়ে চালিয়ে দেখুন দিনে ৫ মিনিটের মধ্যে ব্যবহার করা যায় কি না।", "ক্লিনিকের অনুমতি নিয়ে দুই সপ্তাহের পেইড ট্রায়াল চালান। ফোন পাওয়ার পর কতজন রোগী আবার ক্লিনিকে আসতে রাজি হলেন, হিসাব রাখুন।"]',
  signal = 'রিসেপশনিস্ট প্রতিদিন সকালে তালিকাটি ব্যবহার করছেন এবং ক্লিনিক মালিক পরের মাসের জন্য ফি দিতে রাজি হচ্ছেন।',
  prototype = 'কাল্পনিক নাম, অ্যাপয়েন্টমেন্টের তারিখ আর কল স্ট্যাটাস (ফোন দেওয়া হয়েছে, রিং হয়েছে, নতুন তারিখ নিয়েছে) দিয়ে একটি সহজ স্ক্রিন বানান। কোনো রোগীর আসল স্বাস্থ্য তথ্য এতে রাখবেন না।'
WHERE approach_id = 'clinic-follow-up' AND locale = 'bn';

-- 5. Cooler workplaces (cooler-workplaces)
UPDATE problem_text SET
  title = 'Hot tin roofs make factory floors dangerous during summer',
  summary = 'Factory workers get exhausted in high heat, but central air conditioning is too expensive.',
  customer = 'Owners and factory managers of garment factories, bakeries, and workshops.',
  context = 'During the summer months, temperatures under tin factory roofs in Gazipur and Dhaka frequently soar above 35°C (95°F). Extreme heat makes workers dizzy, slows down production, and causes safety accidents. Putting central air conditioning across an entire factory floor uses huge amounts of electricity and costs too much for most small and medium owners.',
  unknown = 'Which low-cost fixes work best on typical industrial tin roofs? Will factory owners write a check for cooling if foreign buyers or labor inspectors are not forcing them to?'
WHERE problem_id = 'workplace-heat' AND locale = 'en';

UPDATE problem_text SET
  title = 'গরমের দিনে টিনের চালার নিচে কারখানার পরিবেশ অসহনীয় হয়ে ওঠে',
  summary = 'প্রচণ্ড গরমে কারখানার শ্রমিকরা অসুস্থ হয়ে পড়েন, কিন্তু সেন্ট্রাল এসি লাগানো অনেক খরুচে।',
  customer = 'তৈরি পোশাক কারখানা, বেকারি ও টিনের নিচে থাকা নানা কারখানার মালিক ও ম্যানেজার।',
  context = 'গরমের দিনে গাজীপুর বা ঢাকার টিনের চালার কারখানার ভেতরের তাপমাত্রা প্রায়ই ৩৫ ডিগ্রি ছাড়িয়ে যায়। তীব্র গরমে শ্রমিকরা দুর্বল হয়ে পড়েন, কাজে ভুল হয় এবং দুর্ঘটনার ঝুঁকি বাড়ে। পুরো কারখানায় সেন্ট্রাল এসি লাগালে যে পরিমাণ বিদ্যুৎ খরচ হয়, তা ছোট ও মাঝারি কারখানাগুলোর সাধ্যের বাইরে।',
  unknown = 'সাধারণ টিনের চালে কম খরচে কোন সমাধানগুলো সবচেয়ে ভালো কাজ করে? বিদেশি ক্রেতা বা পরিদর্শকের চাপ না থাকলে মালিকরা কি নিজ গরজে শ্রমিকদের আরাম দিতে টাকা খরচ করবেন?'
WHERE problem_id = 'workplace-heat' AND locale = 'bn';

UPDATE approach_text SET
  title = 'Simple cooling upgrades for hot factory floors',
  summary = 'Help factory owners bring down scorching floor temperatures without remodeling the whole building.',
  description = 'Offer practical, targeted fixes to cut room temperatures: heat-reflective white roof paint, extra roof exhaust vents, or shade netting. Measure the temperature on the floor before and after the work so the factory owner sees clear proof that it worked.',
  business_model = 'The factory owner pays a fixed price for the inspection, materials, and installation work. You can also offer an annual maintenance contract to wash the roof and service the vents.',
  steps_json = '["Walk a hot factory floor with the safety manager. Measure the room temperature and ask workers where the air feels most trapped.", "Pick one simple, affordable fix—like painting a section of the tin roof with heat-reflective coating—and get the owner to pay for a small test area.", "Measure the indoor temperature during the next hot week. Ask workers if they feel cooler and check if the owner wants to coat the rest of the roof."]',
  signal = 'The test section cools down by a few degrees, workers feel the relief, and the owner pays to upgrade the rest of the factory.',
  prototype = 'Create a simple survey and temperature comparison report. Track outside weather, indoor temperatures before and after painting, and feedback from workers. Show the owner clear numbers showing that the room got cooler.'
WHERE approach_id = 'cooler-workplaces' AND locale = 'en';

UPDATE approach_text SET
  title = 'বড় খরচ ছাড়াই কারখানার গরম কমানোর সহজ উপায়',
  summary = 'পুরো ভবন নতুন করে না বানিয়েও টিনের চালার কারখানার তাপমাত্রা কমানোর উপায় দিন।',
  description = 'কারখানার ভেতরের তাপমাত্রা কমাতে সাশ্রয়ী কিছু ব্যবস্থা দিন: ছাদে হিট-রিফ্লেক্টিভ সাদা রং লাগানো, চালের ওপর এগজস্ট ভেন্ট বসানো বা শেড নেট টানানো। কাজ শুরুর আগে ও পরে ঘরের তাপমাত্রা মেপে মালিককে প্রমাণ দেখান যে গরম সত্যিই কমেছে।',
  business_model = 'পরিদর্শন, মালপত্র ও কাজের জন্য কারখানা মালিক এককালীন ফি দেবেন। চাইলে প্রতি বছর ছাদ পরিষ্কার ও ভেন্টিলেশন সার্ভিসিংয়ের জন্য বার্ষিক চুক্তি করতে পারেন।',
  steps_json = '["ম্যানেজারের সাথে কারখানার সবচেয়ে গরম ফ্লোরটি ঘুরে দেখুন। তাপমাত্রা মাপুন এবং কর্মীদের কাছে শুনুন কোথায় বাতাস আটকে থাকে।", "একটি সহজ সমাধান বেছে নিন – যেমন ছাদের নির্দিষ্ট অংশে হিট-প্রুফ সাদা রং লাগানো – এবং মালিককে একটি ছোট অংশে পরীক্ষা চালানোর খরচ দিতে রাজি করান।", "পরের গরমের দিনে ঘরের তাপমাত্রা মেপে দেখুন। কর্মীরা আরাম পাচ্ছেন কি না জেনে নিয়ে মালিককে পুরো ছাদে কাজ করানোর প্রস্তাব দিন।"]',
  signal = 'পরীক্ষার অংশে তাপমাত্রা কয়েক ডিগ্রি কমেছে, কর্মীরা স্বস্তি পাচ্ছেন এবং মালিক পুরো কারখানার ছাদে কাজ করানোর জন্য বুকিং দিচ্ছেন।',
  prototype = 'পরিদর্শনের হিসাব ও তাপমাত্রা তুলনার একটি সহজ রিপোর্ট বানান। বাইরের গরম, কাজের আগের ও পরের ঘরের তাপমাত্রা আর কর্মীদের মতামত লিখে রাখুন। তাপমাত্রা কমেছে এমন স্পষ্ট প্রমাণ মালিককে দেখান।'
WHERE approach_id = 'cooler-workplaces' AND locale = 'bn';

-- 6. Rooftop solar upkeep (solar-upkeep)
UPDATE problem_text SET
  title = 'Rooftop solar panels lose power when dust and soot pile up',
  summary = 'Factory owners invest in rooftop solar, but power drops quickly if no one cleans or inspects the panels.',
  customer = 'Factory owners, commercial building managers, and solar installers.',
  context = 'Many factories in Bangladesh have installed solar panels on their roofs to save on soaring electricity bills. But industrial areas are full of thick dust, diesel soot, and bird droppings. When panels get dirty, they generate 15% to 30% less electricity. Factory maintenance staff do not know how to wash solar panels safely or how to check for loose electrical wires.',
  unknown = 'Does regular panel washing save enough money on the main power bill to easily cover your service fee? Can your cleaning crew move safely across slippery, sloped tin factory roofs?'
WHERE problem_id = 'solar-maintenance' AND locale = 'en';

UPDATE problem_text SET
  title = 'ধুলোবালি জমে ছাদের সোলার প্যানেলের বিদ্যুৎ উৎপাদন কমে যায়',
  summary = 'কারখানার মালিকরা সোলার বসান ঠিকই, কিন্তু নিয়মিত পরিষ্কার না করায় বিদ্যুৎ উৎপাদন দ্রুত কমতে থাকে।',
  customer = 'কারখানার মালিক, বড় ভবনের ম্যানেজার ও সোলার ইনস্টলেশন কোম্পানি।',
  context = 'চড়া বিদ্যুৎ বিল থেকে বাঁচতে অনেক কারখানা ছাদে বড় বড় সোলার প্যানেল বসায়। কিন্তু শিল্প এলাকার ঘন ধুলো, ডিজেলের ধোঁয়া আর পাখির মলে সোলারের কাচ দ্রুত ঢেকে যায়। প্যানেল নোংরা থাকলে বিদ্যুৎ তৈরি ১৫% থেকে ৩০% পর্যন্ত কমে যায়। কারখানার নিয়মিত কর্মীদের পক্ষে ঢালু টিনের ছাদে উঠে নিরাপদে প্যানেল ধোয়া বা তারের ত্রুটি ধরা সম্ভব হয় না।',
  unknown = 'নিয়মিত প্যানেল পরিষ্কার করলে যে বিদ্যুৎ সাশ্রয় হয়, তা দিয়ে কি এই সার্ভিসের খরচ উঠে আসবে? ঢালু ও পিচ্ছিল টিনের ছাদে কর্মীরা নিরাপদে কাজ করতে পারবেন কি?'
WHERE problem_id = 'solar-maintenance' AND locale = 'bn';

UPDATE approach_text SET
  title = 'Cleaning and repair service for rooftop solar panels',
  summary = 'Find out why solar panels are losing power and send trained technicians to wash and fix them.',
  description = 'Offer a regular upkeep service for commercial rooftop solar: safely wash dust and grime off the panels, test the electrical inverters, and fix loose connections. You make sure the building gets all the cheap, clean electricity its solar system was built to produce.',
  business_model = 'Building owners or solar installation firms pay a recurring monthly or quarterly fee per roof. Larger electrical replacement parts are quoted and billed separately.',
  steps_json = '["Interview three factory owners with rooftop solar. Ask how often they wash their panels and how they know if a panel stops producing power.", "Offer a one-time paid maintenance checkup with a trained solar technician. Safely wash the panels, inspect the wiring, and measure power generation immediately after.", "Show the owner the electricity numbers before and after cleaning. If the extra power saved them more money than your fee, offer a quarterly cleaning subscription."]',
  signal = 'The owner renews the service because the extra electricity generated pays for your fee and lowers their overall bill.',
  prototype = 'Create a simple rooftop report template. Record panel condition, dust levels, power output before and after cleaning, and any broken wires. Show the factory owner how much extra electricity their clean panels generated today.'
WHERE approach_id = 'solar-upkeep' AND locale = 'en';

UPDATE approach_text SET
  title = 'ছাদের সোলার প্যানেল পরিষ্কার ও মেরামতের সার্ভিস',
  summary = 'সোলার প্যানেলে কেন কম বিদ্যুৎ তৈরি হচ্ছে তা খুঁজে বের করুন এবং টেকনিশিয়ান পাঠিয়ে ধুয়ে ঠিক করে দিন।',
  description = 'বাণিজ্যিক ভবনের ছাদের সোলারের জন্য একটি নিয়মিত সার্ভিস দিন: প্যানেল থেকে নিরাপদে ধুলোবালি ধুয়ে দেওয়া, ইনভার্টার পরীক্ষা করা ও আলগা তার ঠিক করা। আপনার কাজ হবে পুরো সিস্টেম যেন সবচেয়ে বেশি বিদ্যুৎ দেয় তা নিশ্চিত করা।',
  business_model = 'ভবনের মালিক বা সোলার কোম্পানি প্রতি ছাদের জন্য তিন মাসের বা মাসিক সাবস্ক্রিপশন ফি দেবে। বড় কোনো পার্টস বদলাতে হলে তার খরচ আলাদা নেওয়া হবে।',
  steps_json = '["ছাদে সোলার আছে এমন তিনজন কারখানা মালিকের সাথে কথা বলুন। তারা কত দিন পর পর প্যানেল পরিষ্কার করান আর উৎপাদন কমলে কীভাবে বোঝেন, জেনে নিন।", "টেকনিশিয়ান নিয়ে একটি কারখানায় পেইড ইন্সপেকশনের প্রস্তাব দিন। প্যানেল ভালো করে ধুয়ে দিন, তারগুলো চেক করুন এবং পরিষ্কারের পরপরই কতটা বেশি বিদ্যুৎ পাওয়া গেল তা মেপে দেখান।", "পরিষ্কারের আগে ও পরের বিদ্যুতের হিসাব মালিককে দেখান। বিদ্যুৎ বিলের সাশ্রয় যদি সার্ভিসের খরচের চেয়ে বেশি হয়, তবে নিয়মিত তিন মাসের চুক্তির প্রস্তাব দিন।"]',
  signal = 'প্যানেল পরিষ্কার রাখলে যে বিদ্যুৎ বিল বাঁচে তা দেখে মালিক প্রতি তিন মাস পর পর সার্ভিস নেওয়ার চুক্তি নবায়ন করছেন।',
  prototype = 'ছাদের কাজের হিসাব রাখার জন্য একটি সহজ রিপোর্ট বানান। প্যানেলের অবস্থা, ধুলার পরিমাণ, পরিষ্কারের আগে ও পরের বিদ্যুৎ উৎপাদন আর নষ্ট তারের বিবরণ লিখে রাখুন। পরিষ্কারের পর আজ কত ইউনিট বাড়তি বিদ্যুৎ তৈরি হলো, তা মালিককে স্পষ্ট দেখান।'
WHERE approach_id = 'solar-upkeep' AND locale = 'bn';
