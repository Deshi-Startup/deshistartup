-- Recover and fact-check the September 2026 bilingual idea drafts.
-- Keep the conversational wording; remove unsupported figures and promises.
-- Stable IDs, credits, dates, relationships and editorial selections are unchanged.
-- Original draft prototype text was recovered from complete session records.

-- supplier-evidence
UPDATE problem_text SET
  title = 'Foreign clothing buyers ask for records factories do not have in one place',
  summary = 'Invoices, fabric receipts, and test certificates sit with different teams, making it hard to answer buyer questions quickly.',
  customer = 'Garment factories in Bangladesh that export clothes to overseas brands.',
  context = 'Buyer requests can cover where fabric and yarn came from, invoices and test records. When the invoice sits with accounts and the test report with the lab, putting the answer together takes work. Start by finding out which records one factory struggles to collect.',
  unknown = 'Which buyer questions take the longest to answer? Are factories willing to pay an outside helper to organize these files for them?'
WHERE problem_id = 'supplier-evidence-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'বিদেশি বায়াররা এমন সব রেকর্ড চায়, যেগুলো ফ্যাক্টরির এক জায়গায় গোছানো থাকে না',
  summary = 'ইনভয়েস, ফেব্রিক রিসিট আর টেস্ট সার্টিফিকেট একেক টিমের কাছে ছড়ানো থাকে। তাই বায়ারের প্রশ্নের উত্তর দ্রুত দেওয়া কঠিন হয়ে যায়।',
  customer = 'বাংলাদেশের গার্মেন্ট ফ্যাক্টরি, যারা বিদেশি ব্র্যান্ডের কাছে কাপড় এক্সপোর্ট করে।',
  context = 'বায়ার জানতে চাইতে পারেন সুতা আর কাপড় কোথা থেকে এসেছে, ইনভয়েস কোথায় বা টেস্টের রিপোর্ট আছে কি না। ইনভয়েস অ্যাকাউন্টস টিমের কাছে আর রিপোর্ট ল্যাবে থাকলে, সব এক করতে সময় লাগে। শুরুতে একটা ফ্যাক্টরির কোন কাগজগুলো জোগাড় করতে সমস্যা হয়, সেটা জেনে নিন।',
  unknown = 'বায়ারের কোন প্রশ্নগুলোর উত্তর দিতে সবচেয়ে বেশি সময় লাগে? ফ্যাক্টরিগুলো কি বাইরের কাউকে টাকা দিয়ে এসব ফাইল গুছিয়ে রাখার কাজটা করাতে রাজি হবে?'
WHERE problem_id = 'supplier-evidence-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Put factory supplier records together for foreign buyers',
  summary = 'Help clothing factories collect, check, and pack the supplier records their foreign buyers ask for.',
  description = 'Start with one factory and one buyer order. Collect the fabric bills, dye test sheets, and supplier certificates from the factory staff. Match each document against the buyer''s checklist and flag anything missing. Put everything into a neat folder in the format the buyer wants. Once you do this by hand for a few orders, build simple software to speed up repeated checks.',
  business_model = 'Charge a setup fee to organize past records, then a monthly fee or a flat fee per order pack. Make sure your price covers the time spent hunting down missing papers.',
  steps_json = '["Talk to five factory managers. Ask permission to see a recent buyer checklist and find out what took the most work.","Charge one factory to prepare the paperwork for two real orders. Check each answer against the original records.","Track time spent, missing papers and buyer feedback. Check whether your fee covers the work and the factory orders again."]',
  signal = 'The factory hires you again for their next order, and each pack takes less time to finish.',
  prototype = 'Create a simple checklist spreadsheet. List each buyer question, link the matching document, and mark missing papers in red.'
WHERE approach_id = 'supplier-evidence' AND locale = 'en';
UPDATE approach_text SET
  title = 'বিদেশি বায়ারদের জন্য ফ্যাক্টরির সাপ্লায়ার রেকর্ড গুছিয়ে দিন',
  summary = 'গার্মেন্ট ফ্যাক্টরিগুলোকে বিদেশি বায়ারের চাওয়া সাপ্লায়ার রেকর্ড জোগাড় করতে, চেক করতে আর গুছিয়ে পাঠাতে সাহায্য করা।',
  description = 'একটা ফ্যাক্টরির মাত্র একটা বায়ার অর্ডার দিয়ে কাজ শুরু করুন। ফ্যাক্টরির স্টাফদের কাছ থেকে ফেব্রিক বিল, ডাই টেস্ট রিপোর্ট আর সাপ্লায়ার সার্টিফিকেটগুলো জোগাড় করুন। বায়ারের চেকলিস্টের সাথে প্রতিটি কাগজ মিলিয়ে দেখুন আর কোনটা বাদ পড়লে তা আলাদা করে মার্ক করুন। বায়ার ঠিক যেভাবে চায়, সেভাবে একটা সুন্দর ফোল্ডারে সবকিছু গুছিয়ে ফেলুন। এভাবে কয়েকটা অর্ডারের কাজ হাতে করার পর, বারবার চেক করার কাজটা দ্রুত করতে একটা সিম্পল সফটওয়্যার বানিয়ে ফেলুন।',
  business_model = 'পুরোনো রেকর্ড গুছিয়ে দেওয়ার জন্য একটা সেটআপ ফি নিন। এরপর প্রতি মাসের জন্য একটা ফিক্সড ফি বা প্রতিটি অর্ডারের প্যাকেটের জন্য আলাদা পেমেন্ট নিতে পারেন। খেয়াল রাখবেন, হারানো কাগজ খুঁজতে গিয়ে আপনার যে সময় যাচ্ছে, সেটা যেন আপনার প্রাইসিং দিয়ে কভার হয়।',
  steps_json = '["৫ জন ফ্যাক্টরি ম্যানেজারের সাথে কথা বলুন। অনুমতি নিয়ে সম্প্রতি আসা একটা বায়ার চেকলিস্ট দেখুন আর কোন কাজটায় বেশি সময় লেগেছে, তা জেনে নিন।","একটা ফ্যাক্টরির কাছ থেকে ফি নিয়ে তাদের ২টি আসল অর্ডারের কাগজ গুছিয়ে দিন। প্রতিটি উত্তর মূল কাগজের সাথে মিলিয়ে দেখুন।","কত সময় লাগল, কোন কাগজ পাওয়া গেল না আর বায়ার কী বললেন, তার হিসাব রাখুন। ফি থেকে খরচ উঠছে কি না আর ফ্যাক্টরি আবার কাজ দিচ্ছে কি না, দেখুন।"]',
  signal = 'ফ্যাক্টরি তাদের পরের অর্ডারের জন্যও আপনাকে হায়ার করবে, আর প্রতিটি প্যাক রেডি করতে আপনার আগের চেয়ে কম সময় লাগবে।',
  prototype = 'একটা সিম্পল চেকলিস্ট স্প্রেডশিট বানান। বায়ারের প্রতিটি প্রশ্ন লিস্ট করুন, সেটার সাথে দরকারি কাগজটার লিংক দিন, আর মিসিং কাগজগুলো লাল রঙে মার্ক করে রাখুন।'
WHERE approach_id = 'supplier-evidence' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'supplier-evidence-problem';

-- compressed-air
UPDATE problem_text SET
  title = 'Air pipe leaks silently waste factory electricity',
  summary = 'Leaks in compressed-air pipes make the compressor work harder, increasing electricity use.',
  customer = 'Factories that use compressed air, starting in one industrial area like Gazipur or Savar.',
  context = 'Factories use compressed air to run tools and parts of production lines. Air escaping from pipes, valves or joints makes the compressor work harder to maintain pressure. A leak survey can find these losses, but the savings need to be measured under similar production conditions.',
  unknown = 'Does fixing leaks save enough power to easily cover the cost of your inspection and repair service?'
WHERE problem_id = 'compressed-air-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'এয়ার পাইপের লিক নীরবে ফ্যাক্টরির কারেন্ট বিল বাড়িয়ে দেয়',
  summary = 'কমপ্রেসড এয়ারের পাইপে লিক থাকলে কম্প্রেসরকে বাড়তি কাজ করতে হয়। এতে বিদ্যুতের খরচ বাড়ে।',
  customer = 'যেসব ফ্যাক্টরিতে কমপ্রেসড এয়ার ব্যবহার করা হয়। শুরুতে গাজীপুর বা সাভারের মতো কোনো একটা ইন্ডাস্ট্রিয়াল এরিয়া টার্গেট করতে পারেন।',
  context = 'ফ্যাক্টরির নানা টুল আর মেশিনের কিছু অংশ চালাতে কমপ্রেসড এয়ার লাগে। পাইপ, ভালভ বা জয়েন্ট দিয়ে বাতাস বেরিয়ে গেলে প্রেসার ধরে রাখতে কম্প্রেসরকে বাড়তি কাজ করতে হয়। লিক খুঁজে ঠিক করলে কত বিদ্যুৎ বাঁচে, সেটা কাছাকাছি পরিমাণ উৎপাদন চলার সময় মেপে দেখতে হবে।',
  unknown = 'লিক ঠিক করলে কারেন্ট বিল কি এতটাই বাঁচে, যা দিয়ে আপনার ইন্সপেকশন আর সার্ভিস চার্জ খুব সহজেই উঠে আসে?'
WHERE problem_id = 'compressed-air-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Find and seal air pipe leaks in factories',
  summary = 'Walk factory floors with leak detectors, find hissing air pipes, and fix them so the factory burns less electricity.',
  description = 'Team up with an experienced technician. Use an ultrasonic detector to find air leaks, including ones you cannot hear. Tag each leak, estimate the loss and agree on a repair price. Have the technician isolate the equipment safely before repairs. Compare power use before and after, allowing for changes in production.',
  business_model = 'Charge a flat inspection fee plus a fixed price for each repair, with replacement parts billed separately. Later, offer monthly maintenance checkups.',
  steps_json = '["Interview five factory maintenance managers. Ask how they look for air leaks right now and how often they inspect their pipes.","Rent a leak detector and do a paid test survey in one factory with a skilled technician. Measure power use before and after you fix the leaks.","Count up your tool rental, technician pay, travel, and time. Make sure the factory owner''s power savings are much higher than your bill."]',
  prototype = 'Build a simple one-page inspection sheet. Write down the room, machine number, leak size, repair cost, and estimated taka saved per month.'
WHERE approach_id = 'compressed-air' AND locale = 'en';
UPDATE approach_text SET
  title = 'ফ্যাক্টরির এয়ার পাইপের লিক খুঁজে সিল করে দিন',
  summary = 'লিক ডিটেক্টর হাতে নিয়ে ফ্যাক্টরির ফ্লোরে ঘুরে ঘুরে লিক হওয়া পাইপ খুঁজে বের করা আর মেরামত করা, যাতে ফ্যাক্টরির কারেন্ট খরচ কমে যায়।',
  description = 'একজন অভিজ্ঞ টেকনিশিয়ানকে সাথে নিন। আলট্রাসনিক ডিটেক্টর দিয়ে এয়ার লিক খুঁজুন, কানে শোনা যায় না এমন লিকও ধরা যায়। প্রতিটি লিক চিহ্নিত করে কতটা ক্ষতি হচ্ছে তার আনুমানিক হিসাব করুন আর মেরামতের দাম ঠিক করুন। মেরামতের আগে টেকনিশিয়ানকে দিয়ে যন্ত্রের বিদ্যুৎ ও বাতাসের সংযোগ নিরাপদে বন্ধ করান। উৎপাদনের পরিমাণের পার্থক্য ধরে, আগের ও পরের বিদ্যুৎ খরচ মিলিয়ে দেখুন।',
  business_model = 'একটা ফিক্সড ইন্সপেকশন ফি নিন, আর প্রতিটি মেরামতের জন্য আলাদা ফিক্সড চার্জ রাখুন। নষ্ট পার্টস বদলানোর বিলটা আলাদা করবেন। পরে গিয়ে তাদের মান্থলি মেইনটেন্যান্স চেকআপের অফার দিতে পারেন।',
  steps_json = '["৫ জন ফ্যাক্টরি মেইনটেন্যান্স ম্যানেজারের সাথে কথা বলুন। এখন তারা কীভাবে এয়ার লিক খোঁজেন আর কতদিন পরপর পাইপ চেক করেন, তা জানতে চান।","একটা লিক ডিটেক্টর ভাড়া করুন আর একজন দক্ষ টেকনিশিয়ানকে সাথে নিয়ে একটা ফ্যাক্টরিতে পেইড টেস্ট সার্ভে করুন। লিক ঠিক করার আগে আর পরে কারেন্টের ব্যবহার মেপে দেখুন।","টুল ভাড়া, টেকনিশিয়ানের পেমেন্ট, যাতায়াত আর সময়ের হিসাব করুন। খেয়াল রাখবেন ফ্যাক্টরি মালিকের যে কারেন্ট বিল বাঁচছে, সেটা যেন আপনার বিলের চেয়ে অনেক বেশি হয়।"]',
  prototype = 'এক পৃষ্ঠার একটা সিম্পল ইন্সপেকশন শিট বানান। সেখানে রুম, মেশিন নম্বর, লিকের সাইজ, মেরামতের খরচ আর প্রতি মাসে আনুমানিক কত টাকা বাঁচল, তা লিখে রাখুন।'
WHERE approach_id = 'compressed-air' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'compressed-air-problem';

-- etp-operations
UPDATE problem_text SET
  title = 'Factory wastewater plants break down without daily care',
  summary = 'Treatment plants need daily checks of pumps, chemicals and water quality. Missed problems can disrupt treatment.',
  customer = 'Dyeing, washing, and textile finishing factories that run their own wastewater treatment plants (ETPs).',
  context = 'Dyeing and washing leave chemicals in wastewater. An effluent treatment plant, or ETP, treats this water before discharge. Keeping it working takes more than buying equipment: staff need to check pumps, control chemical doses and keep records. A qualified engineer and suitable lab tests help identify where treatment is failing.',
  unknown = 'Will factory owners pay a monthly fee to an outside team to keep their plant running smoothly?'
WHERE problem_id = 'etp-operations-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'রেগুলার মেইনটেন্যান্স না করলে ফ্যাক্টরির বর্জ্যপানি শোধনাগার বা ইটিপি নষ্ট হয়ে যায়',
  summary = 'পাম্প, কেমিক্যাল আর পানির মান প্রতিদিন চেক করতে হয়। সমস্যা চোখ এড়িয়ে গেলে ইটিপির কাজ ব্যাহত হতে পারে।',
  customer = 'যেসব ডাইং, ওয়াশিং আর টেক্সটাইল ফিনিশিং ফ্যাক্টরি নিজেদের ইটিপি চালায়।',
  context = 'ডাইং আর ওয়াশিংয়ের পর পানিতে কেমিক্যাল মিশে থাকে। এই পানি বাইরে ছাড়ার আগে শোধন করার প্ল্যান্টকে ইটিপি বলে। শুধু যন্ত্র কিনলেই কাজ শেষ নয়। পাম্প চেক করা, কেমিক্যালের মাত্রা ঠিক রাখা আর নিয়মিত হিসাব রাখাও লাগে। কোথায় সমস্যা হচ্ছে, সেটা বুঝতে অভিজ্ঞ ইঞ্জিনিয়ার আর প্রয়োজনমতো ল্যাব টেস্ট কাজে লাগে।',
  unknown = 'ফ্যাক্টরি মালিকরা কি তাদের ইটিপি ঠিকঠাক চালাতে বাইরের কোনো টিমকে মাসে মাসে পেমেন্ট করতে রাজি হবে?'
WHERE problem_id = 'etp-operations-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Keep factory wastewater treatment plants working properly',
  summary = 'Help factory operators check pumps, manage chemical doses and track treated-water test results.',
  description = 'Partner with an experienced wastewater engineer. Visit a treatment plant, find recurring problems and train the on-site operator. Set up a daily log for chemical doses and pump checks. Agree on sampling and testing with a suitable lab, based on the plant’s requirements. A service visit alone does not prove that the water meets discharge rules.',
  business_model = 'Charge a fee for the initial plant audit, then a monthly retainer for regular visits, operator training, emergency repairs, and lab tests.',
  steps_json = '["Visit three dyeing factories with a wastewater engineer. Look at their daily logs, find out what breaks most often, and ask who signs off on repair budgets.","Run a one-month paid trial at one factory. Fix recurring pump issues, teach the operator the right chemical mix, and send water to a lab for testing.","Record plant downtime, chemical savings, and all your technician and lab costs. Show the factory owner how much money they saved on wasted chemicals and downtime."]',
  prototype = 'Create a simple daily log sheet for the plant operator: pH levels, chemical doses, pump hours, and simple steps to take if alarms go off.'
WHERE approach_id = 'etp-operations' AND locale = 'en';
UPDATE approach_text SET
  title = 'ফ্যাক্টরির ইটিপি ঠিকমতো চালু রাখতে সাহায্য করুন',
  summary = 'ফ্যাক্টরির অপারেটরদের পাম্প চেক করতে, কেমিক্যালের মাত্রা ঠিক রাখতে আর শোধন করা পানির টেস্ট রিপোর্টের হিসাব রাখতে সাহায্য করুন।',
  description = 'একজন অভিজ্ঞ বর্জ্যপানি শোধন ইঞ্জিনিয়ারকে সাথে নিন। ফ্যাক্টরির ইটিপিতে গিয়ে বারবার কী সমস্যা হচ্ছে, তা বের করুন আর অপারেটরকে ট্রেইনিং দিন। কেমিক্যালের ডোজ আর পাম্প চেক করার জন্য একটা ডেইলি লগবুক তৈরি করে দিন। প্ল্যান্টের প্রয়োজন অনুযায়ী উপযুক্ত ল্যাবের সাথে স্যাম্পল নেওয়া ও টেস্টের নিয়ম ঠিক করুন। শুধু সার্ভিস করলেই পানি ছাড়ার নিয়ম মানা হচ্ছে, এমন ধরে নেওয়া যাবে না।',
  business_model = 'প্রথমবার প্ল্যান্ট অডিটের জন্য একটা ফি নিন। এরপর রেগুলার ভিজিট, অপারেটর ট্রেইনিং, ইমার্জেন্সি মেরামত আর ল্যাব টেস্টের জন্য মাসে মাসে একটা রিটেইনার ফি সেট করুন।',
  steps_json = '["ওয়াটার ইঞ্জিনিয়ারকে সাথে নিয়ে ৩টি ডাইং ফ্যাক্টরিতে যান। তাদের ডেইলি লগগুলো দেখুন, বোঝার চেষ্টা করুন কোন জিনিসটা সবচেয়ে বেশি নষ্ট হয়, আর মেরামতের বাজেটে কে সাইন করে তা জেনে নিন।","একটা ফ্যাক্টরিতে ১ মাসের পেইড ট্রায়াল রান করুন। বারবার হওয়া পাম্পের সমস্যা ঠিক করুন, অপারেটরকে সঠিক কেমিক্যাল মিক্স করা শেখান আর পানি টেস্টের জন্য ল্যাবে পাঠান।","ইটিপি কতক্ষণ বন্ধ ছিল, কতটুকু কেমিক্যাল বাঁচল আর আপনার টেকনিশিয়ান ও ল্যাবের খরচের হিসাব রাখুন। ফ্যাক্টরি মালিককে দেখিয়ে দিন কেমিক্যাল আর ইটিপি বন্ধ থাকার কারণে হওয়া লোকসান থেকে তারা আসলে কত টাকা বাঁচিয়েছে।"]',
  prototype = 'ইটিপি অপারেটরের জন্য একটা সিম্পল ডেইলি লগ শিট বানান – যেখানে পিএইচ লেভেল, কেমিক্যালের পরিমাণ, পাম্প কত ঘণ্টা চলল আর অ্যালার্ম বাজলে সাথে সাথে কী কী করতে হবে, তা লেখা থাকবে।'
WHERE approach_id = 'etp-operations' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'etp-operations-problem';

-- verified-spares
UPDATE problem_text SET
  title = 'Factories need local spare parts they can trust',
  summary = 'An imported spare can take time to arrive. A local replacement still needs the right material, measurements and tests.',
  customer = 'Maintenance and purchasing managers at garment and light manufacturing factories.',
  context = 'Factories replace worn brackets, rollers and other machine parts. A local workshop may be able to make a replacement, but matching the shape is not enough. The material, fit and strength also matter. Check actual delivery times and rejection records before claiming a local part will be cheaper or faster.',
  unknown = 'Can you find local machine shops that can make parts with exact measurements at a price that leaves you a healthy profit?'
WHERE problem_id = 'verified-spares-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ফ্যাক্টরির এমন লোকাল স্পেয়ার পার্টস দরকার, যার মানে ভরসা করা যায়',
  summary = 'ইম্পোর্ট করা পার্টস আসতে সময় লাগতে পারে। লোকাল পার্টস বানালেও ধাতুর মান, মাপ আর টেস্ট ঠিক রাখা দরকার।',
  customer = 'গার্মেন্ট আর লাইট ম্যানুফ্যাকচারিং ফ্যাক্টরির মেইনটেন্যান্স আর পারচেজ ম্যানেজার।',
  context = 'ফ্যাক্টরির মেশিনে ব্র্যাকেট, রোলার আর অন্য পার্টস ক্ষয়ে গেলে বদলাতে হয়। লোকাল ওয়ার্কশপে সেগুলো বানানো যেতে পারে, কিন্তু শুধু দেখতে এক হলেই হবে না। ধাতুর মান, মাপ আর শক্তিও ঠিক থাকতে হবে। লোকাল পার্টস সস্তা বা দ্রুত হবে বলার আগে আসল ডেলিভারির সময় আর বাতিল হওয়া পার্টসের হিসাব দেখুন।',
  unknown = 'আপনি কি এমন কোনো লোকাল মেশিন শপ খুঁজে পাবেন, যারা একেবারে সঠিক মাপের পার্টস বানাতে পারবে, আর সেখানে আপনারও ভালো প্রফিট থাকবে?'
WHERE problem_id = 'verified-spares-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Make and check factory spare parts locally',
  summary = 'Have capable local workshops make agreed spare parts, check them against the design and let the factory test them.',
  description = 'Start with parts a qualified engineer confirms are not safety-critical. Get permission to use the drawing and agree on the material, measurements and acceptance tests. Choose a capable local workshop. Check the finished part against those requirements, then have the factory test it. Save the approved drawing for repeat orders.',
  steps_json = '["Talk to three factory maintenance chiefs. Ask which non-critical machine parts wear out every month and take too long to arrive from abroad.","With permission to use the design, have a skilled workshop make two copies of one agreed part. Check the material and required measurements before the factory tests them.","Track delivery speed, workshop costs, and whether the part lasted as long as the imported one. See if the factory orders a full batch."]',
  prototype = 'Build a sample part order sheet with photo, exact dimensions, metal grade, workshop cost, selling price, and a quality check pass/fail stamp.'
WHERE approach_id = 'verified-spares' AND locale = 'en';
UPDATE approach_text SET
  title = 'লোকাল ওয়ার্কশপে ফ্যাক্টরির স্পেয়ার পার্টস বানিয়ে চেক করে দিন',
  summary = 'দক্ষ লোকাল ওয়ার্কশপ দিয়ে ঠিক করা স্পেয়ার পার্টস বানান। ডিজাইনের সাথে মিলিয়ে চেক করুন, তারপর ফ্যাক্টরিকে দিয়ে টেস্ট করান।',
  description = 'অভিজ্ঞ ইঞ্জিনিয়ার যেসব পার্টস নষ্ট হলেও বড় নিরাপত্তার ঝুঁকি নেই বলে নিশ্চিত করেন, সেগুলো দিয়ে শুরু করুন। ড্রয়িং ব্যবহারের অনুমতি নিন। কী ধাতু লাগবে, মাপ কত হবে আর কোন টেস্টে পাস করতে হবে, আগে ঠিক করুন। দক্ষ লোকাল ওয়ার্কশপ দিয়ে পার্টস বানিয়ে এই শর্তগুলো মিলিয়ে দেখুন। তারপর ফ্যাক্টরিকে দিয়ে টেস্ট করান। রিপিট অর্ডারের জন্য অনুমোদিত ড্রয়িং সেভ করে রাখুন।',
  steps_json = '["৩ জন ফ্যাক্টরি মেইনটেন্যান্স চিফের সাথে কথা বলুন। জানতে চান প্রতি মাসে কোন নন-ক্রিটিক্যাল পার্টসগুলো নষ্ট হয় আর সেগুলো বিদেশ থেকে আসতে অনেক বেশি সময় নেয়।","ডিজাইন ব্যবহারের অনুমতি নিয়ে দক্ষ ওয়ার্কশপে ঠিক করা একটি পার্টসের ২টি কপি বানান। ফ্যাক্টরি টেস্ট করার আগে ধাতুর মান আর দরকারি মাপগুলো মিলিয়ে নিন।","ডেলিভারি স্পিড, ওয়ার্কশপের খরচ আর পার্টসটা ইম্পোর্ট করা পার্টসের মতো টেকসই হলো কি না, তার ট্র্যাক রাখুন। এরপর দেখুন ফ্যাক্টরি পুরো ব্যাচের অর্ডার দেয় কি না।"]',
  prototype = 'একটা স্যাম্পল পার্টস অর্ডার শিট বানান। সেখানে ছবি, নিখুঁত মাপ, মেটাল গ্রেড, ওয়ার্কশপ খরচ, সেলিং প্রাইস আর কোয়ালিটি চেক পাস বা ফেল স্ট্যাম্পের জায়গা রাখুন।'
WHERE approach_id = 'verified-spares' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'verified-spares-problem';

-- food-sample-runs
UPDATE problem_text SET
  title = 'Food businesses struggle to send perishable samples to testing labs on time',
  summary = 'Food samples need to reach the right lab within its handling and storage limits. Poor transport can make a sample unusable.',
  customer = 'Bakeries, snack makers, dairy processors, and food exporters in Dhaka and nearby hubs.',
  context = 'Food businesses need different tests for different products and buyer requirements. The right container, temperature and delivery time depend on the sample and test. A pickup service can handle these steps with the lab and keep a record of who collected and received each sample.',
  unknown = 'Will food companies pay a monthly fee or per-trip charge for a reliable courier that collects cold samples and handles lab drop-offs?'
WHERE problem_id = 'food-sample-runs-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'পচনশীল ফুড স্যাম্পল ঠিক সময়ে টেস্টিং ল্যাবে পাঠাতে ফুড কোম্পানিগুলোকে বেশ ঝামেলা পোহাতে হয়',
  summary = 'ফুড স্যাম্পল ল্যাবের ঠিক করা সময় আর সংরক্ষণের নিয়ম মেনে পৌঁছাতে হয়। পথে ঠিকমতো রাখা না হলে স্যাম্পল ব্যবহার করা নাও যেতে পারে।',
  customer = 'ঢাকা আর এর আশপাশের হাবগুলোর বেকারি, স্ন্যাকস মেকার, ডেইরি প্রসেসর আর ফুড এক্সপোর্টার।',
  context = 'খাবারের ধরন আর বায়ারের চাহিদা অনুযায়ী আলাদা টেস্ট লাগে। কোন পাত্রে নিতে হবে, কত তাপমাত্রায় রাখতে হবে আর কত সময়ের মধ্যে ল্যাবে পৌঁছাতে হবে, তা স্যাম্পল ও টেস্টের ওপর নির্ভর করে। একটা পিকআপ সার্ভিস ল্যাবের সাথে এই নিয়মগুলো ঠিক করে কাজ করতে পারে। কে স্যাম্পল নিলেন আর কে বুঝে পেলেন, সেই হিসাবও থাকবে।',
  unknown = 'ফুড কোম্পানিগুলো কি এমন কোনো রিলায়েবল কুরিয়ারকে মাসে মাসে বা ট্রিপ হিসেবে পেমেন্ট করবে, যারা কোল্ড স্যাম্পল পিকআপ করবে আর ল্যাবে পৌঁছে দেবে?'
WHERE problem_id = 'food-sample-runs-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Deliver food samples to labs using their handling rules',
  summary = 'Pick up food samples, follow the testing lab’s transport rules and return its reports to the customer.',
  description = 'Start with one route between food factories and a lab that can run the required tests. Follow the lab’s rules for containers, sample collection, temperature and delivery time; not every sample should be chilled. Log each handover and any temperature checks. Send the lab’s original report to the customer with permission.',
  business_model = 'Charge a fixed pickup and delivery fee per sample, or a discounted monthly bundle for factories that test weekly. Bill the lab''s actual testing fee separately.',
  steps_json = '["Visit five food factories in one zone. Ask how they currently get samples to labs, how often samples spoil on the road, and what they spend.","Agree on handling rules with two labs that can run the required tests. Make two paid pickups. Use cold boxes and temperature records where the lab requires them.","Track travel time, fuel, ice pack costs, and lab acceptance rates. Check if grouping several pickups on one trip covers your vehicle and driver costs."]',
  prototype = 'Create a simple digital trip log: customer name, food type, temperature at pickup, handover time at the lab, and photo of the lab receipt.'
WHERE approach_id = 'food-sample-runs' AND locale = 'en';
UPDATE approach_text SET
  title = 'ল্যাবের নিয়ম মেনে ফুড স্যাম্পল পৌঁছে দিন',
  summary = 'ফুড স্যাম্পল পিকআপ করে টেস্টিং ল্যাবের নিয়ম মেনে পৌঁছে দিন। ল্যাবের রিপোর্ট কাস্টমারকে এনে দিন।',
  description = 'ফুড ফ্যাক্টরি থেকে প্রয়োজনীয় টেস্ট করতে পারে এমন একটা ল্যাব পর্যন্ত একটি রুট দিয়ে শুরু করুন। পাত্র, স্যাম্পল নেওয়া, তাপমাত্রা আর পৌঁছানোর সময় নিয়ে ল্যাবের নিয়ম মেনে চলুন। সব স্যাম্পল ঠান্ডা করতে হয় না। প্রতিবার কার হাতে স্যাম্পল গেল আর তাপমাত্রা চেক করলে কী পাওয়া গেল, লিখে রাখুন। অনুমতি নিয়ে ল্যাবের মূল রিপোর্ট কাস্টমারকে পাঠিয়ে দিন।',
  business_model = 'প্রতি স্যাম্পল পিকআপ আর ডেলিভারির জন্য একটা ফিক্সড ফি নিন। যেসব ফ্যাক্টরি প্রতি সপ্তাহে টেস্ট করায়, তাদের জন্য ডিসকাউন্টসহ মান্থলি প্যাকেজ অফার করতে পারেন। ল্যাবের টেস্টিং বিলটা আলাদা হিসেবে রাখবেন।',
  steps_json = '["কোনো একটা জোনের ৫টি ফুড ফ্যাক্টরিতে যান। জানতে চান এখন তারা কীভাবে ল্যাবে স্যাম্পল পাঠায়, পথে কতবার স্যাম্পল নষ্ট হয় আর এতে তাদের কেমন খরচ হয়।","দরকারি টেস্ট করতে পারে এমন দুটো ল্যাবের সাথে স্যাম্পল রাখার নিয়ম ঠিক করুন। দুটো পেইড পিকআপ করুন। ল্যাবের শর্ত অনুযায়ী কোল্ড বক্স ব্যবহার করুন আর তাপমাত্রার হিসাব রাখুন।","যাতায়াতের সময়, তেল খরচ, আইস প্যাকের দাম আর ল্যাব কয়টা স্যাম্পল অ্যাকসেপ্ট করল, তার ট্র্যাক রাখুন। এক ট্রিপে কয়েকটা পিকআপ করলে আপনার গাড়ি আর ড্রাইভারের খরচ কভার হয় কি না, তা মিলিয়ে দেখুন।"]',
  prototype = 'একটা সিম্পল ডিজিটাল ট্রিপ লগ তৈরি করুন। সেখানে কাস্টমারের নাম, খাবারের ধরন, পিকআপের সময় টেম্পারেচার, ল্যাবে দেওয়ার সময় আর ল্যাবের রিসিটের ছবি থাকবে।'
WHERE approach_id = 'food-sample-runs' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'food-sample-runs-problem';

-- export-document-check
UPDATE problem_text SET
  title = 'Mistakes across export papers can delay shipments or payments',
  summary = 'Different quantities, weights or buyer details across documents can lead to questions and corrections.',
  customer = 'Export teams at garment factories and freight forwarding companies.',
  context = 'Export teams handle invoices, packing lists, orders and shipping papers. The same details often appear in several places. A mismatch can lead to a bank, buyer or customs query. The effect depends on the error and transaction; every typo does not automatically mean a fine.',
  unknown = 'Can the tool catch useful mistakes without overwhelming staff with false alarms?'
WHERE problem_id = 'export-document-check-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'এক্সপোর্টের কাগজে অমিল থাকলে শিপমেন্ট বা পেমেন্ট দেরি হতে পারে',
  summary = 'একেক কাগজে পরিমাণ, ওজন বা বায়ারের তথ্য একেক রকম থাকলে প্রশ্ন ওঠে। তখন কাগজ ঠিক করতে হয়।',
  customer = 'গার্মেন্ট ফ্যাক্টরি আর ফ্রেইট ফরোয়ার্ডিং কোম্পানির এক্সপোর্ট টিম।',
  context = 'এক্সপোর্ট টিমকে ইনভয়েস, প্যাকিং লিস্ট, অর্ডার আর শিপিংয়ের কাগজ সামলাতে হয়। একই তথ্য কয়েক জায়গায় থাকে। কোথাও অমিল থাকলে ব্যাংক, বায়ার বা কাস্টমস থেকে প্রশ্ন আসতে পারে। ভুলটা কী আর লেনদেনের ধরন কেমন, তার ওপর ফল নির্ভর করে। প্রতিটি টাইপো মানেই জরিমানা নয়।',
  unknown = 'টুলটা কি অযথা অ্যালার্ট না দিয়ে কাজে লাগবে এমন ভুলগুলো ধরতে পারবে?'
WHERE problem_id = 'export-document-check-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Catch typos and mismatches across export paperwork',
  summary = 'Compare export invoices, packing lists and shipping papers to flag mismatches before submission.',
  description = 'Pick one export sector, like knitwear. Take the export team''s draft documents: invoice, packing list, and purchase order. Build a simple tool that reads the text, compares item codes, quantities, weights, and addresses across all pages, and highlights any mismatch in bright red. Have an experienced trade clerk double-check the findings before showing the customer.',
  steps_json = '["Talk to three export teams. Ask which document mistakes caused questions, extra costs or delays.","With permission, test 20 old shipment folders after removing private details. Compare the tool’s findings with an experienced trade clerk’s review.","Offer a paid trial for one factory. Have a person review every flagged issue before sending the report to the export manager."]',
  prototype = 'Create a side-by-side comparison screen: invoice on the left, packing list on the right, with mismatched carton counts and weights highlighted in red.'
WHERE approach_id = 'export-document-check' AND locale = 'en';
UPDATE approach_text SET
  title = 'এক্সপোর্টের কাগজপত্রের টাইপো আর অমিলগুলো জাহাজে ওঠার আগেই ধরে দিন',
  summary = 'সাবমিট করার আগে এক্সপোর্ট ইনভয়েস, প্যাকিং লিস্ট আর শিপিংয়ের কাগজ মিলিয়ে অমিলগুলো ধরিয়ে দিন।',
  description = 'নিটওয়্যারের মতো যেকোনো একটা এক্সপোর্ট সেক্টর বেছে নিন। এক্সপোর্ট টিমের ড্রাফট করা কাগজগুলো নিন – যেমন ইনভয়েস, প্যাকিং লিস্ট আর পারচেজ অর্ডার। একটা সিম্পল টুল বানান, যেটা সব কাগজের টেক্সট পড়ে আইটেম কোড, পরিমাণ, ওজন আর ঠিকানা মিলিয়ে দেখবে এবং কোনো গরমিল পেলে তা লাল রঙে হাইলাইট করে দেবে। কাস্টমারকে দেখানোর আগে একজন অভিজ্ঞ ট্রেড ক্লার্ক দিয়ে ফাইন্ডিংসগুলো ডাবল চেক করে নিন।',
  steps_json = '["৩টি এক্সপোর্ট টিমের সাথে কথা বলুন। কাগজের কোন ভুলে প্রশ্ন, বাড়তি খরচ বা দেরি হয়েছিল, জানতে চান।","অনুমতি নিয়ে আগের ২০টি শিপমেন্টের ফোল্ডার থেকে ব্যক্তিগত তথ্য সরিয়ে টেস্ট করুন। টুলের ধরা ভুলগুলো একজন অভিজ্ঞ ট্রেড ক্লার্কের রিভিউয়ের সাথে মিলিয়ে দেখুন।","একটা ফ্যাক্টরিকে পেইড ট্রায়াল অফার করুন। এক্সপোর্ট ম্যানেজারকে রিপোর্ট পাঠানোর আগে প্রতিটি অমিল একজন মানুষকে দিয়ে চেক করিয়ে নিন।"]',
  prototype = 'পাশাপাশি মিলিয়ে দেখার মতো একটা স্ক্রিন বানান – বাঁ দিকে ইনভয়েস আর ডান দিকে প্যাকিং লিস্ট থাকবে। আর কার্টনের সংখ্যা ও ওজনে কোনো গরমিল থাকলে তা লাল রঙে হাইলাইট করা থাকবে।'
WHERE approach_id = 'export-document-check' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'export-document-check-problem';

-- aquaculture-diagnostics
UPDATE problem_text SET
  title = 'Fish farmers guess which medicines to use when fish start dying',
  summary = 'Without checking the fish and water, a farmer can spend money on treatment that does not address the cause.',
  customer = 'Fish hatcheries, commercial fish farms, and pond farmer cooperatives in areas like Mymensingh or Bogura.',
  context = 'Fish that stop eating or gasp at the surface need prompt attention. Water conditions, parasites or other disease can be involved, and the response will differ. Research in Bangladesh describes gaps in disease management and antibiotic use. Testing and qualified advice can help farmers choose a response instead of guessing.',
  unknown = 'Will farms pay for testing and advice when the result arrives soon enough to help them act?'
WHERE problem_id = 'aquaculture-diagnostics-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'মাছ মরতে শুরু করলে ফার্মাররা আন্দাজে ওষুধ ব্যবহার করেন',
  summary = 'মাছ আর পানি পরীক্ষা না করলে, আসল সমস্যা না সারিয়েই ওষুধের পেছনে টাকা খরচ হয়ে যেতে পারে।',
  customer = 'ময়মনসিংহ বা বগুড়ার মতো এলাকার ফিশ হ্যাচারি, কমার্শিয়াল ফিশ ফার্ম আর পুকুর মালিকদের কোঅপারেটিভ।',
  context = 'মাছ খাওয়া বন্ধ করলে বা পানির ওপরে উঠে হাঁপাতে থাকলে দ্রুত খোঁজ নিতে হয়। পানির সমস্যা, পরজীবী বা অন্য রোগ হতে পারে। কারণ অনুযায়ী করণীয়ও আলাদা। বাংলাদেশের গবেষণায় মাছের রোগ সামলানো আর অ্যান্টিবায়োটিক ব্যবহারে ঘাটতির কথা আছে। আন্দাজে ওষুধ না দিয়ে, পরীক্ষা আর অভিজ্ঞ পরামর্শ নিয়ে সিদ্ধান্ত নেওয়ায় সাহায্য করা যায়।',
  unknown = 'কাজে লাগার মতো সময়ে টেস্টের ফল আর পরামর্শ পেলে খামারগুলো কি এর জন্য টাকা দেবে?'
WHERE problem_id = 'aquaculture-diagnostics-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Help fish farms get disease tests and expert advice',
  summary = 'Collect sick fish and water samples from ponds, rush them to a fish health lab, and send the farmer clear treatment advice.',
  description = 'Partner with a qualified aquatic-animal health professional and a suitable lab. Agree on which symptoms need urgent attention and how each sample must be collected and stored. The lab runs the relevant tests. The professional explains the findings and next steps; medicine is not needed in every case, and any dose must fit the diagnosis and treatment method.',
  steps_json = '["Visit five commercial fish farms in Mymensingh. Ask what diseases hit their ponds last season, what they spent on medicines, and how many fish died.","Partner with a certified fisheries lab and a qualified fish doctor. Do two paid test runs for a commercial farm facing a disease scare.","Record how fast results arrive, whether the farmer follows the specialist’s advice and what happens to the fish. Ask whether the farmer would pay to use the service again."]',
  prototype = 'Make a one-page fish-health report with symptoms, sample details, lab findings and the qualified professional’s advice. Mark results still pending.'
WHERE approach_id = 'aquaculture-diagnostics' AND locale = 'en';
UPDATE approach_text SET
  title = 'মাছের খামারে রোগ পরীক্ষা আর বিশেষজ্ঞের পরামর্শের সেবা দিন',
  summary = 'পুকুর থেকে অসুস্থ মাছ আর পানির স্যাম্পল কালেক্ট করে দ্রুত ফিশ হেলথ ল্যাবে পাঠানো আর ফার্মারকে সঠিক ট্রিটমেন্টের পরামর্শ দেওয়া।',
  description = 'মাছের স্বাস্থ্য নিয়ে কাজ করেন এমন যোগ্য বিশেষজ্ঞ আর উপযুক্ত ল্যাবের সাথে পার্টনারশিপ করুন। কোন লক্ষণে জরুরি ব্যবস্থা লাগবে আর কীভাবে স্যাম্পল নিতে ও রাখতে হবে, আগে ঠিক করুন। ল্যাব প্রয়োজনীয় টেস্ট করবে। বিশেষজ্ঞ ফল বুঝিয়ে করণীয় জানাবেন। সব ক্ষেত্রে ওষুধ লাগে না। ওষুধ লাগলে রোগ আর চিকিৎসার ধরন অনুযায়ী মাত্রা ঠিক করতে হবে।',
  steps_json = '["ময়মনসিংহের ৫টি কমার্শিয়াল ফিশ ফার্মে যান। জানতে চান গত সিজনে তাদের পুকুরে কী রোগ এসেছিল, ওষুধের পেছনে কত খরচ হয়েছিল আর কত মাছ মারা গিয়েছিল।","একটা সার্টিফাইড ফিশারিজ ল্যাব আর একজন কোয়ালিফাইড ফিশ ডাক্তারের সাথে পার্টনারশিপ করুন। রোগের আতঙ্কে থাকা একটা কমার্শিয়াল ফার্মের জন্য ২টি পেইড টেস্ট রান করুন।","কত দ্রুত রেজাল্ট এলো, চাষি বিশেষজ্ঞের পরামর্শ মেনেছেন কি না আর মাছের অবস্থা কী হলো, লিখে রাখুন। চাষি আবার টাকা দিয়ে সেবাটি নিতে চান কি না, জিজ্ঞেস করুন।"]',
  prototype = 'এক পৃষ্ঠার ফিশ হেলথ রিপোর্ট বানান। উপসর্গ, স্যাম্পলের তথ্য, ল্যাবের ফল আর যোগ্য বিশেষজ্ঞের পরামর্শ থাকবে। কোন ফল এখনো আসেনি, সেটাও দেখান।'
WHERE approach_id = 'aquaculture-diagnostics' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'aquaculture-diagnostics-problem';

-- recycled-resin-quality
UPDATE problem_text SET
  title = 'Changing recycled-plastic quality makes factory production harder',
  summary = 'Dirt, moisture or the wrong mix of plastic can affect how recycled pellets run in a machine and how the finished product holds up.',
  customer = 'Plastic goods manufacturers making buckets, pipes, crates, furniture, and non-food packaging.',
  context = 'Recycled plastic can help manufacturers reuse material. But the buyer needs to know what each batch contains and how it will behave in production. Colour, moisture, contamination and flow when melted can vary. Start with one plastic type and the tests one buyer needs.',
  unknown = 'Can you supply batches that meet a buyer’s agreed tests at a price that covers sourcing, checks and rejected material?'
WHERE problem_id = 'recycled-resin-quality-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'রিসাইকেলড প্লাস্টিকের মান বদলে গেলে ফ্যাক্টরির উৎপাদনে সমস্যা হয়',
  summary = 'ময়লা, আর্দ্রতা বা অন্য ধরনের প্লাস্টিক মেশানো থাকলে দানা মেশিনে ঠিকমতো কাজ নাও করতে পারে। তৈরি প্রোডাক্টের মানেও প্রভাব পড়ে।',
  customer = 'বালতি, পাইপ, ক্রেট, ফার্নিচার আর নন-ফুড প্যাকেজিং বানায় এমন প্লাস্টিক গুডস ম্যানুফ্যাকচারার।',
  context = 'রিসাইকেলড প্লাস্টিক দিয়ে পুরোনো উপকরণ আবার কাজে লাগানো যায়। তবে প্রতিটি ব্যাচে কী আছে আর উৎপাদনে কেমন কাজ করবে, সেটা বায়ারের জানা দরকার। রং, আর্দ্রতা, ময়লা আর গলানোর পর কত সহজে প্রবাহিত হয়, এসব বদলাতে পারে। এক ধরনের প্লাস্টিক আর একজন বায়ারের দরকারি টেস্ট দিয়ে শুরু করুন।',
  unknown = 'বায়ারের ঠিক করা টেস্টে পাস করে এমন ব্যাচ দিতে পারবেন কি? দামের মধ্যে দানা কেনা, চেক করা আর বাতিল মালামালের খরচ উঠবে তো?'
WHERE problem_id = 'recycled-resin-quality-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Supply checked recycled-plastic pellets to factories',
  summary = 'Source recycled pellets, check the properties a buyer needs and supply batches with clear test records.',
  description = 'Pick one plastic type, such as PP or HDPE for a non-food product. Partner with a capable recycling mill and agree on tests with the buyer and lab. Check each batch’s material, moisture and flow when melted. Keep batches traceable and let the buyer try the material in production before a larger order.',
  steps_json = '["Talk to three plastic factory owners. Ask what recycled pellets they currently use, why they reject batches, and what price difference would make them switch.","Agree on a small HDPE test batch with a recycler and buyer. Have a suitable lab check the properties the buyer needs, such as melt flow and strength.","Deliver one paid test batch to a factory. Watch it run in their molding machines and check if the finished buckets have defects."]',
  prototype = 'Make a batch test sheet with the plastic type, source, test method, results and the buyer’s acceptance limits.'
WHERE approach_id = 'recycled-resin-quality' AND locale = 'en';
UPDATE approach_text SET
  title = 'ফ্যাক্টরির জন্য টেস্ট করা রিসাইকেলড প্লাস্টিক দানা সরবরাহ করুন',
  summary = 'রিসাইকেলড দানা জোগাড় করে বায়ারের দরকারি মানগুলো চেক করুন। প্রতিটি ব্যাচের সাথে টেস্টের পরিষ্কার রেকর্ড দিন।',
  description = 'খাবারের কাজে লাগে না এমন প্রোডাক্টের জন্য এক ধরনের প্লাস্টিক বেছে নিন, যেমন পিপি বা এইচডিপিই। দক্ষ রিসাইক্লিং মিলের সাথে কাজ করুন। বায়ার আর ল্যাবের সাথে কী কী টেস্ট লাগবে, ঠিক করে নিন। প্রতিটি ব্যাচের উপাদান, আর্দ্রতা আর গলানোর পর প্রবাহের মান চেক করুন। কোন ব্যাচ কোথা থেকে এসেছে, হিসাব রাখুন। বড় অর্ডারের আগে বায়ারকে উৎপাদনে ব্যবহার করে দেখতে দিন।',
  steps_json = '["৩ জন প্লাস্টিক ফ্যাক্টরি মালিকের সাথে কথা বলুন। এখন তারা কোন রিসাইকেলড দানা ব্যবহার করেন, কেন মাঝে মাঝে ব্যাচ রিজেক্ট করেন আর দামের পার্থক্য কেমন হলে তারা আপনার দানা কিনবেন – তা জেনে নিন।","রিসাইক্লার আর বায়ারের সাথে কথা বলে এইচডিপিই দানার ছোট একটা টেস্ট ব্যাচ ঠিক করুন। বায়ারের দরকারি মানগুলো উপযুক্ত ল্যাবে চেক করান। যেমন, গলানো প্লাস্টিক কত সহজে প্রবাহিত হয় আর তৈরি প্রোডাক্ট কতটা মজবুত হয়।","একটা ফ্যাক্টরিতে পেইড টেস্ট ব্যাচ ডেলিভারি দিন। খেয়াল রাখুন তাদের মোল্ডিং মেশিনে এটা কেমন চলে আর বানানো বালতিগুলোতে কোনো খুঁত থাকে কি না তা চেক করুন।"]',
  prototype = 'ব্যাচের একটা টেস্ট শিট বানান। প্লাস্টিকের ধরন, উৎস, পরীক্ষার পদ্ধতি, ফল আর বায়ারের গ্রহণযোগ্য সীমা লিখে রাখুন।'
WHERE approach_id = 'recycled-resin-quality' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'recycled-resin-quality-problem';

-- bangla-order-intake
UPDATE problem_text SET
  title = 'Turning dealer voice messages into orders takes extra work',
  summary = 'When dealers order through Bangla voice notes, staff need to check product names and quantities before entering the order.',
  customer = 'Consumer goods and wholesale distributors in Bangladesh whose sales reps and dealers order via messaging apps.',
  context = 'Imagine a dealer sends a voice note: “Please send five cartons of oil and two boxes of soap tomorrow.” Staff need to match the products and pack sizes to the catalogue before entering the order. Unclear names or a later change in quantity mean more checking. Start with a distributor who already receives orders this way.',
  unknown = 'Can speech software accurately extract product names, quantities, and pack sizes from conversational Bangla without requiring extra correction time from staff?'
WHERE problem_id = 'bangla-order-intake-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ডিলারের ভয়েস মেসেজ শুনে অর্ডার লিখতে বাড়তি কাজ হয়',
  summary = 'ডিলার বাংলায় ভয়েস নোট দিয়ে অর্ডার করলে, স্টাফদের প্রোডাক্টের নাম আর পরিমাণ মিলিয়ে অর্ডার লিখতে হয়।',
  customer = 'বাংলাদেশের কনজ্যুমার গুডস আর পাইকারি ডিস্ট্রিবিউটর, যাঁদের সেলস রেপ আর ডিলাররা মেসেজিং অ্যাপ দিয়ে অর্ডার করেন।',
  context = 'ধরুন, একজন ডিলার ভয়েস নোট পাঠালেন: “কালকে ৫ কার্টন তেল আর ২ বক্স সাবান পাঠাবেন।” অর্ডার লেখার আগে স্টাফদের ক্যাটালগের সাথে প্রোডাক্ট আর প্যাক সাইজ মেলাতে হবে। নাম পরিষ্কার না হলে বা পরে পরিমাণ বদলালে আবার চেক করতে হয়। যেসব ডিস্ট্রিবিউটর এভাবে অর্ডার পান, তাঁদের একজনকে নিয়ে শুরু করুন।',
  unknown = 'স্পিচ সফটওয়্যার কি মানুষের মুখের বাংলা শুনে, স্টাফদের অতিরিক্ত সময় নষ্ট না করিয়েই প্রোডাক্টের নাম, পরিমাণ আর প্যাক সাইজ ঠিকভাবে বের করতে পারবে?'
WHERE problem_id = 'bangla-order-intake-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Turn Bangla voice notes into orders staff can check',
  summary = 'Turn dealer voice messages into draft orders, with unclear items marked for staff to check.',
  description = 'With permission, use messages from a distributor’s business account. The tool turns speech into text, matches product names and pack sizes to the catalogue, and prepares a draft order. Highlight anything uncertain. Staff confirm or correct every order before it goes to the warehouse.',
  steps_json = '["Partner with one consumer goods distributor. Get permission to listen to 100 past voice notes from dealers and see how staff entered them.","Build a prototype tool that transcribes 50 real audio clips and matches products to the distributor''s item codes. Measure how many items it gets right.","Run a one-month paid trial with two distributor clerks. Track how many minutes they save per day and whether wrong shipments go down."]',
  prototype = 'Build a simple screen: audio player on top, transcribed Bangla text below, and auto-filled order rows with a green "Confirm and Send" button.'
WHERE approach_id = 'bangla-order-intake' AND locale = 'en';
UPDATE approach_text SET
  title = 'বাংলা ভয়েস নোট থেকে অর্ডার তৈরি করে স্টাফদের চেক করতে দিন',
  summary = 'ডিলারের ভয়েস মেসেজ থেকে ড্রাফট অর্ডার বানান। যা পরিষ্কার বোঝা যায়নি, স্টাফদের চেক করার জন্য তা চিহ্নিত করে দিন।',
  description = 'অনুমতি নিয়ে ডিস্ট্রিবিউটরের বিজনেস অ্যাকাউন্টের মেসেজ ব্যবহার করুন। টুলটা কথাগুলো লিখবে, ক্যাটালগের সাথে প্রোডাক্টের নাম আর প্যাক সাইজ মেলাবে, তারপর ড্রাফট অর্ডার বানাবে। কোনো কিছু পরিষ্কার না হলে সেটা হাইলাইট করবে। ওয়্যারহাউসে পাঠানোর আগে স্টাফ প্রতিটি অর্ডার মিলিয়ে ঠিক করে নেবেন।',
  steps_json = '["১ জন কনজ্যুমার গুডস ডিস্ট্রিবিউটরের সাথে পার্টনারশিপ করুন। ডিলারদের পাঠানো আগের ১০০টি ভয়েস নোট শোনার আর স্টাফরা সেগুলো কীভাবে এন্ট্রি করেছেন তা দেখার পারমিশন নিন।","এমন একটা প্রোটোটাইপ বানান যা ৫০টি আসল অডিও ক্লিপ ট্রান্সক্রাইব করতে পারে এবং প্রোডাক্টগুলোকে ডিস্ট্রিবিউটরের আইটেম কোডের সাথে মেলাতে পারে। সফটওয়্যারটি কতগুলো আইটেম ঠিকভাবে ধরতে পারছে তা মাপুন।","ডিস্ট্রিবিউটরের ২ জন ক্লার্ককে নিয়ে এক মাসের পেইড ট্রায়াল চালান। ট্র্যাক করুন তাদের প্রতিদিন কত মিনিট বাঁচছে এবং ভুল ডেলিভারি কমেছে কি না।"]',
  prototype = 'একটা সিম্পল স্ক্রিন বানান: ওপরে অডিও প্লেয়ার, নিচে বাংলায় ট্রান্সক্রাইব করা টেক্সট, আর অটোমেটিক ফিল হওয়া অর্ডারের সারি, সাথে সবুজ রঙের ''কনফার্ম করে পাঠিয়ে দিন'' বাটন।'
WHERE approach_id = 'bangla-order-intake' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'bangla-order-intake-problem';

-- chip-verification
UPDATE problem_text SET
  title = 'Chip designers need to find mistakes before manufacturing',
  summary = 'Chip teams use simulations to find design bugs before making hardware. This needs engineers with specialist testing skills.',
  customer = 'Overseas semiconductor design startups and chip companies in the US, Europe, and Asia.',
  context = 'A chip design needs testing before it is sent for manufacturing. Some mistakes are expensive to fix once the chip is made. Bangladesh already has firms offering design and verification work, so a new team needs a clear speciality and evidence of good work. A policy announcement alone does not bring customer orders.',
  unknown = 'Can a specialized engineering team in Dhaka prove they can run complex chip verification tests at international quality standards?'
WHERE problem_id = 'chip-verification-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'চিপ বানানোর আগেই ডিজাইনের ভুল ধরতে হয়',
  summary = 'হার্ডওয়্যার বানানোর আগে চিপের ডিজাইনের বাগ ধরতে কম্পিউটারে টেস্ট চালানো হয়। এর জন্য বিশেষ দক্ষতার ইঞ্জিনিয়ার দরকার।',
  customer = 'দেশের বাইরের সেমিকন্ডাক্টর ডিজাইন স্টার্টআপ এবং আমেরিকা, ইউরোপ ও এশিয়ার চিপ কোম্পানি।',
  context = 'চিপ বানাতে পাঠানোর আগে তার ডিজাইন টেস্ট করতে হয়। বানানোর পর কিছু ভুল ঠিক করতে অনেক খরচ হতে পারে। বাংলাদেশে আগেই চিপ ডিজাইন আর ভেরিফিকেশনের কাজ করা কোম্পানি আছে। তাই নতুন টিমের নির্দিষ্ট দক্ষতা আর ভালো কাজের প্রমাণ লাগবে। শুধু নীতির ঘোষণা থাকলেই কাস্টমারের অর্ডার আসবে না।',
  unknown = 'ঢাকার কোনো স্পেশালাইজড ইঞ্জিনিয়ারিং টিম কি প্রমাণ করতে পারবে যে তারা আন্তর্জাতিক মানের জটিল চিপ ভেরিফিকেশন টেস্ট চালাতে পারে?'
WHERE problem_id = 'chip-verification-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Test microchip designs for overseas semiconductor companies',
  summary = 'Build a skilled Bangladeshi engineering team that runs rigorous simulation tests on microchip designs for overseas semiconductor companies.',
  description = 'Form a small team with real chip-verification experience. Engineers may use SystemVerilog, a hardware design and testing language, and UVM, a reusable testing methodology. Start with one chip block, such as a memory controller. Agree on tests, tool licences and design privacy with the client. Deliver the bugs found, test results and what remains untested.',
  steps_json = '["Assemble two senior chip engineers with real verification experience. Create a portfolio of sample verification testbenches on open-source chip components.","Reach out to overseas semiconductor startups through personal networks and industry conferences to land one small, paid trial project.","Deliver the test suite within the agreed deadline, document all bugs found, and ask the client for an ongoing retainer contract."]',
  signal = 'The overseas chip startup renews the contract and asks your team to test their next major chip design.',
  prototype = 'Build a sample public testbench on GitHub: show test cases, simulation coverage reports, and a clean bug-tracking dashboard for an open-source processor core.'
WHERE approach_id = 'chip-verification' AND locale = 'en';
UPDATE approach_text SET
  title = 'দেশের বাইরের সেমিকন্ডাক্টর কোম্পানিগুলোর জন্য মাইক্রোচিপ ডিজাইন টেস্ট করুন',
  summary = 'বাংলাদেশের এমন একটি দক্ষ ইঞ্জিনিয়ারিং টিম বানান যাঁরা বাইরের দেশের সেমিকন্ডাক্টর কোম্পানিগুলোর জন্য মাইক্রোচিপ ডিজাইনে কড়া সিমুলেশন টেস্ট চালাবেন।',
  description = 'চিপ ভেরিফিকেশনের কাজের অভিজ্ঞতা আছে এমন ছোট একটা টিম বানান। SystemVerilog দিয়ে হার্ডওয়্যারের ডিজাইন আর টেস্ট লেখা যায়। UVM টেস্টের কাজ বারবার ব্যবহার করার একটা পদ্ধতি, আলাদা ভাষা নয়। মেমরি কন্ট্রোলারের মতো চিপের একটি অংশ দিয়ে শুরু করুন। ক্লায়েন্টের সাথে টেস্টের পরিধি, টুলের লাইসেন্স আর ডিজাইনের গোপনীয়তা ঠিক করে নিন। কী বাগ পাওয়া গেল, কোন টেস্ট পাস করল আর কী এখনো টেস্ট হয়নি, সব রিপোর্টে দিন।',
  steps_json = '["রিয়েল ভেরিফিকেশন কাজের অভিজ্ঞতা আছে এমন ২ জন সিনিয়র চিপ ইঞ্জিনিয়ার জোগাড় করুন। ওপেন-সোর্স চিপ কম্পোনেন্ট নিয়ে স্যাম্পল ভেরিফিকেশন টেস্টবেঞ্চের একটা পোর্টফোলিও বানান।","পরিচিত নেটওয়ার্ক আর ইন্ডাস্ট্রি কনফারেন্সের মাধ্যমে বিদেশের সেমিকন্ডাক্টর স্টার্টআপগুলোর সাথে কথা বলে একটা ছোট পেইড ট্রায়াল প্রজেক্ট নামান।","ঠিক করা ডেডলাইনের মধ্যে টেস্ট স্যুট জমা দিন, খুঁজে পাওয়া সব বাগগুলোর ডকুমেন্ট দিন, এবং ক্লায়েন্টের কাছে রেগুলার কাজ করার জন্য রিটেইনার কন্ট্রাক্ট চান।"]',
  signal = 'বিদেশের চিপ স্টার্টআপ কন্ট্রাক্ট রিনিউ করবে এবং তাদের পরের বড় চিপ ডিজাইনটাও আপনার টিমকে টেস্ট করতে বলবে।',
  prototype = 'গিটহাবে একটা স্যাম্পল পাবলিক টেস্টবেঞ্চ বানান: ওপেন-সোর্স প্রসেসর কোরের জন্য টেস্ট কেস, সিমুলেশন কভারেজ রিপোর্ট, আর সুন্দর একটা বাগ-ট্র্যাকিং ড্যাশবোর্ড দেখান।'
WHERE approach_id = 'chip-verification' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'chip-verification-problem';

-- technician-proof-of-skill
UPDATE problem_text SET
  title = 'Paper certificates do not prove whether a factory technician can actually fix a machine',
  summary = 'Factory owners struggle to hire skilled mechanics and electricians because resumes and diplomas do not show hands-on troubleshooting skill.',
  customer = 'Factory managers, HR directors, and industrial employers looking for machine maintenance technicians.',
  context = 'A factory needs to know whether a candidate can diagnose the faults they will face at work. A CV and certificate give useful background, but a supervised practical task can show how the person works. The test should match the job and check safe working as well as the result.',
  unknown = 'Will factory employers pay a testing fee to send shortlisted candidates through a hands-on practical skills test before hiring?'
WHERE problem_id = 'technician-proof-of-skill-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ফ্যাক্টরির টেকনিশিয়ান আসল মেশিন ঠিক করতে পারেন কি না, তা কাগজের সার্টিফিকেট দিয়ে বোঝা যায় না',
  summary = 'ফ্যাক্টরি মালিকরা ভালো মেকানিক আর ইলেকট্রিশিয়ান হায়ার করতে গিয়ে বিপদে পড়েন, কারণ সিভি বা ডিপ্লোমা দেখে মানুষের হাতেকলমে কাজ করার দক্ষতা বোঝা যায় না।',
  customer = 'ফ্যাক্টরি ম্যানেজার, এইচআর ডিরেক্টর, এবং যেসব ইন্ডাস্ট্রিয়াল প্রতিষ্ঠানে মেশিন মেইনটেইন করার জন্য টেকনিশিয়ান দরকার হয়।',
  context = 'ফ্যাক্টরির জানা দরকার, কাজে যে সমস্যা আসবে ক্যান্ডিডেট সেটা ধরতে পারবেন কি না। সিভি আর সার্টিফিকেট থেকে কিছু তথ্য পাওয়া যায়। তবে তত্ত্বাবধানে হাতেকলমে কাজ করালে বোঝা যায় তিনি কীভাবে কাজ করেন। টেস্টটা চাকরির সাথে মিলতে হবে। শুধু ফল নয়, নিরাপদে কাজ করছেন কি না, সেটাও দেখতে হবে।',
  unknown = 'হায়ার করার আগে শর্টলিস্ট করা ক্যান্ডিডেটদের হাতেকলমে কাজ করানোর টেস্ট দিতে ফ্যাক্টরি মালিকরা কি টেস্টিং ফি দেবেন?'
WHERE problem_id = 'technician-proof-of-skill-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Practical hands-on skills testing for factory technicians',
  summary = 'Test candidates on supervised job tasks and show employers which skills they have demonstrated.',
  description = 'Partner with a technical school or workshop and experienced assessors. Agree on practical tasks for one job with the employer. Use a supervised training setup, not a live production line. Assess how candidates find faults, use tools and work safely. Give the employer a scorecard with evidence and the test’s limits.',
  steps_json = '["Interview five factory engineering heads. Ask which specific skills their current technicians lack and what a candidate must do on day one.","Design a hands-on 3-task test for one specific role (like industrial electrician). Test 5 candidates for a partner factory that is actively hiring.","Check if the candidate hired through your test performed better on the job after 30 days than their usual hires. Ask the employer to pay for the next opening."]',
  prototype = 'Create a 1-page candidate scorecard: practical tasks tested, safety score, troubleshooting speed, tools used correctly, and final hire/skip recommendation.'
WHERE approach_id = 'technician-proof-of-skill' AND locale = 'en';
UPDATE approach_text SET
  title = 'ফ্যাক্টরি টেকনিশিয়ানদের জন্য প্র্যাকটিক্যাল হাতেকলমে স্কিল টেস্টের ব্যবস্থা করুন',
  summary = 'তত্ত্বাবধানে কাজ করিয়ে ক্যান্ডিডেটদের টেস্ট করুন। কোন কাজগুলো তাঁরা করে দেখাতে পেরেছেন, মালিকদের জানান।',
  description = 'টেকনিক্যাল স্কুল বা ওয়ার্কশপ আর অভিজ্ঞ অ্যাসেসরদের সাথে কাজ করুন। একটি পদের জন্য কী কাজ করিয়ে দেখবেন, মালিকের সাথে ঠিক করুন। চালু প্রোডাকশন লাইনে নয়, তত্ত্বাবধানে ট্রেইনিংয়ের সেটআপে টেস্ট নিন। ক্যান্ডিডেট কীভাবে সমস্যা ধরেন, টুল চালান আর নিরাপদে কাজ করেন, তা দেখুন। মালিককে প্রমাণসহ স্কোরকার্ড দিন। এই টেস্টে কী যাচাই হয়নি, সেটাও লিখুন।',
  steps_json = '["৫ জন ফ্যাক্টরির ইঞ্জিনিয়ারিং হেডের ইন্টারভিউ নিন। জানুন বর্তমানে তাঁদের টেকনিশিয়ানদের কোন স্কিলগুলোর অভাব আছে এবং প্রথম দিনেই একজন ক্যান্ডিডেটকে ঠিক কী কী করতে হয়।","একটি নির্দিষ্ট রোলের (যেমন ইন্ডাস্ট্রিয়াল ইলেকট্রিশিয়ান) জন্য হাতেকলমে ৩টি কাজের একটা টেস্ট বানান। এমন একটা পার্টনার ফ্যাক্টরির জন্য ৫ জন ক্যান্ডিডেটকে টেস্ট করুন যাঁরা ওই সময়ে লোক খুঁজছেন।","আপনার টেস্টের মাধ্যমে হায়ার করা ক্যান্ডিডেট ৩০ দিন পর আগের হায়ার করা লোকদের চেয়ে ভালো পারফর্ম করেছে কি না তা চেক করুন। পরেরবার লোক লাগলে মালিককে পেমেন্ট করতে বলুন।"]',
  prototype = '১ পৃষ্ঠার একটা ক্যান্ডিডেট স্কোরকার্ড বানান: কী কী প্র্যাকটিক্যাল কাজ করানো হয়েছে, সেফটি স্কোর, কত দ্রুত সমস্যা ধরতে পেরেছেন, ঠিকমতো টুলস ব্যবহার করতে পেরেছেন কি না, এবং শেষ পর্যন্ত তাঁকে নেওয়া উচিত কি না তার রেকমেন্ডেশন।'
WHERE approach_id = 'technician-proof-of-skill' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'technician-proof-of-skill-problem';

-- shared-childcare
UPDATE problem_text SET
  title = 'Working parents quit jobs because offices lack safe, affordable childcare',
  summary = 'A shared childcare service could help nearby employers support parents without each company running its own centre.',
  customer = 'Nearby companies, tech offices, and factories located in business clusters like Banani, Mohakhali, or industrial EPZs.',
  context = 'Parents need childcare they can trust during working hours. For a small employer, running a centre alone may be costly. Nearby employers could reserve places with a qualified operator. Before opening, check the rules for the centre and each employer’s own childcare duties; a shared service does not automatically meet them.',
  unknown = 'Will 3 to 5 nearby employers pool money together to reserve seats in a shared, professional daycare centre within walking distance?'
WHERE problem_id = 'shared-childcare-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'অফিসে নিরাপদ ও সাধ্যের মধ্যে ডে-কেয়ার না থাকায় বাবা-মায়েরা চাকরি ছেড়ে দেন',
  summary = 'পাশাপাশি কয়েকটি অফিস মিলে ডে-কেয়ারের ব্যবস্থা করলে, প্রতিটি কোম্পানিকে আলাদা সেন্টার না চালিয়েও বাবা-মায়েদের সাহায্য করা যেতে পারে।',
  customer = 'বনানী, মহাখালী বা ইপিজেডের মতো বিজনেস এরিয়ায় থাকা কোম্পানি, টেক অফিস আর ফ্যাক্টরি।',
  context = 'অফিসের সময় বাচ্চাকে ভরসা করে রাখা যায় এমন জায়গা দরকার। ছোট কোম্পানির জন্য একা সেন্টার চালানো খরচের হতে পারে। আশেপাশের অফিসগুলো দক্ষ অপারেটরের কাছে সিট বুক করতে পারে। সেন্টার খোলার আগে সেটার নিয়ম আর প্রতিটি কোম্পানির নিজস্ব ডে-কেয়ারের দায়িত্ব জেনে নিন। শেয়ার্ড সেন্টার নিলেই সব দায়িত্ব পূরণ হয়, এমন নয়।',
  unknown = 'আশেপাশের ৩ থেকে ৫টি কোম্পানি কি হেঁটে যাওয়া যায় এমন দূরত্বের প্রফেশনাল ডে-কেয়ার সেন্টারে সিট বুক করার জন্য একসাথে টাকা মেলাবে?'
WHERE problem_id = 'shared-childcare-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Shared neighborhood daycare centers for nearby offices',
  summary = 'Set up trusted, secure daycare centers near office clusters and let multiple companies buy shared memberships for their staff.',
  description = 'Work with an experienced childcare operator. Check registration, safe premises, trained staff, child-to-caregiver ratios and emergency arrangements before opening. Agree with nearby employers on reserved places and who pays. Keep parent consent, authorised pickup and child records private.',
  steps_json = '["Ask 20 parents at four nearby workplaces about childcare, working hours and costs.","Get written interest from two employers and price the service with an experienced operator. Confirm registration and safety requirements.","Only after those checks, run a small paid pilot. Track attendance, staffing, incidents, parent feedback and the full cost per place."]',
  prototype = 'Make a private booking and care-log mockup with reserved places, attendance, parent-approved pickup contacts and emergency details.'
WHERE approach_id = 'shared-childcare' AND locale = 'en';
UPDATE approach_text SET
  title = 'আশেপাশের অফিসগুলোর জন্য শেয়ার্ড ডে-কেয়ার সেন্টার বানান',
  summary = 'অফিসপাড়ার কাছে বিশ্বস্ত ও নিরাপদ ডে-কেয়ার সেন্টার খুলুন, যাতে একাধিক কোম্পানি তাদের কর্মীদের জন্য একসাথে মেম্বারশিপ কিনতে পারে।',
  description = 'শিশু দেখভালের অভিজ্ঞ অপারেটরের সাথে কাজ করুন। সেন্টার খোলার আগে রেজিস্ট্রেশন, নিরাপদ জায়গা, ট্রেইনড স্টাফ, কতজন শিশুর জন্য কতজন কেয়ারগিভার আর জরুরি ব্যবস্থার নিয়ম ঠিক করুন। আশেপাশের কোম্পানির সাথে সিট বুকিং আর কে কত টাকা দেবে, তা ঠিক করে নিন। বাবা-মায়ের সম্মতি, কে বাচ্চাকে নিতে পারবেন আর শিশুর তথ্য গোপন রাখার ব্যবস্থাও লাগবে।',
  steps_json = '["পাশাপাশি ৪টি অফিসের ২০ জন বাবা-মায়ের সাথে বাচ্চা রাখার ব্যবস্থা, কাজের সময় আর খরচ নিয়ে কথা বলুন।","দুটো কোম্পানির লিখিত আগ্রহ নিন। অভিজ্ঞ অপারেটরের সাথে খরচ হিসাব করুন। রেজিস্ট্রেশন আর নিরাপত্তার শর্তগুলো মিলিয়ে নিন।","এই কাজগুলো শেষ হলে ছোট একটা পেইড পাইলট চালান। উপস্থিতি, স্টাফের সংখ্যা, কোনো সমস্যা হয়েছে কি না, বাবা-মায়ের মতামত আর সিটপ্রতি পুরো খরচের হিসাব রাখুন।"]',
  prototype = 'সিট বুকিং আর শিশু দেখভালের হিসাব রাখার একটা প্রাইভেট মকআপ বানান। বুক করা সিট, উপস্থিতি, বাবা-মায়ের অনুমতি পাওয়া পিকআপ ব্যক্তির নম্বর আর জরুরি তথ্য থাকবে।'
WHERE approach_id = 'shared-childcare' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'shared-childcare-problem';

-- bangla-speech-infrastructure
UPDATE problem_text SET
  title = 'Bangla speech tools need testing on real customer calls',
  summary = 'Regional accents, background noise and mixed Bangla-English speech can make names and numbers harder to recognise.',
  customer = 'Bangladeshi tech companies, call centers, ride-sharing apps, and banks building customer support automation.',
  context = 'Customer calls can include local accents, English terms and background noise. Speech research shows that results vary across recording types. That does not establish how a particular model performs on a company’s calls. Test its actual audio, with permission, before deciding what needs to improve.',
  unknown = 'Can a focused speech tool reduce errors and correction time enough for software teams to pay for it?'
WHERE problem_id = 'bangla-speech-infrastructure-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'বাংলা স্পিচ টুলকে আসল কাস্টমার কলে টেস্ট করা দরকার',
  summary = 'লোকাল অ্যাকসেন্ট, আশপাশের শব্দ আর বাংলা-ইংরেজি মেশানো কথায় নাম ও নম্বর ঠিকমতো ধরা কঠিন হতে পারে।',
  customer = 'বাংলাদেশের টেক কোম্পানি, কল সেন্টার, রাইড-শেয়ারিং অ্যাপ আর ব্যাংক যারা কাস্টমার সাপোর্টের কাজ অটোমেট করতে চায়।',
  context = 'কাস্টমার কলে লোকাল অ্যাকসেন্ট, ইংরেজি শব্দ আর আশপাশের শব্দ একসাথে থাকতে পারে। গবেষণায় দেখা যায়, রেকর্ডের ধরন বদলালে স্পিচ টুলের ফলও বদলায়। তবে কোনো কোম্পানির কলে নির্দিষ্ট মডেল কেমন করবে, সেটা শুধু এই গবেষণা থেকে বলা যায় না। কী উন্নতি দরকার, ঠিক করার আগে অনুমতি নিয়ে তাদের আসল অডিওতে টেস্ট করুন।',
  unknown = 'নির্দিষ্ট কাজের স্পিচ টুল কি ভুল আর সংশোধনের সময় এতটা কমাতে পারবে যে সফটওয়্যার টিম টাকা দিয়ে সেটা ব্যবহার করবে?'
WHERE problem_id = 'bangla-speech-infrastructure-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Build a Bangla speech-to-text service for customer calls',
  summary = 'Build a speech recognition model tuned for real Bangladeshi phone audio, noisy backgrounds, and mixed Bangla-English speech.',
  description = 'Start with one type of customer call and recordings you have permission to use. Have Bangla speakers check the transcripts. Test existing models first, then adapt one if that fixes a clear gap. Offer an API, so other software can send audio and receive text. Compare accuracy, speed and full cost before promising an improvement.',
  steps_json = '["Agree on recording consent, access and deletion with one customer. Test existing tools on a small, varied set of calls.","Adapt a model if needed. Keep training and test speakers separate, then check names, numbers, accents and noisy calls.","Run a paid API trial with two teams. Measure correction time, response speed and the full cost per minute."]',
  prototype = 'Create a simple web tester: upload an audio file or speak into the microphone, see the live transcribed Bangla text, with confidence scores highlighted per word.'
WHERE approach_id = 'bangla-speech-infrastructure' AND locale = 'en';
UPDATE approach_text SET
  title = 'কাস্টমার কলের বাংলা কথা লিখে দেওয়ার সার্ভিস বানান',
  summary = 'বাংলাদেশের আসল ফোন কল, ব্যাকগ্রাউন্ড নয়েজ আর বাংলা-ইংরেজি মেশানো কথার জন্য একটা স্পিচ রেকগনিশন মডেল তৈরি করুন।',
  description = 'এক ধরনের কাস্টমার কল আর ব্যবহারের অনুমতি আছে এমন রেকর্ড দিয়ে শুরু করুন। বাংলা বোঝেন এমন মানুষকে দিয়ে লেখা কথাগুলো মিলিয়ে নিন। আগে চালু মডেলগুলো টেস্ট করুন। নির্দিষ্ট ঘাটতি থাকলে একটি মডেল সেই কাজের জন্য বদলান। অন্য সফটওয়্যার যেন অডিও পাঠিয়ে লেখা পায়, সে জন্য এপিআই দিন। উন্নতির কথা বলার আগে ভুলের হার, সময় আর পুরো খরচ মিলিয়ে দেখুন।',
  steps_json = '["একজন কাস্টমারের সাথে রেকর্ডের সম্মতি, কে শুনতে পারবেন আর কখন মুছতে হবে, ঠিক করুন। নানা ধরনের কিছু কল দিয়ে চালু টুলগুলো টেস্ট করুন।","দরকার হলে মডেল বদলান। শেখানোর অডিও আর টেস্টের অডিওতে আলাদা মানুষের কথা রাখুন। নাম, নম্বর, অ্যাকসেন্ট আর নয়েজে কেমন করে, দেখুন।","দুটো টিমের সাথে পেইড এপিআই ট্রায়াল চালান। ভুল ঠিক করার সময়, উত্তর আসার গতি আর মিনিটপ্রতি পুরো খরচ মাপুন।"]',
  prototype = 'একটা সিম্পল ওয়েব টেস্টার বানান: অডিও ফাইল আপলোড করা যাবে বা মাইক্রোফোনে কথা বলা যাবে, আর সাথে সাথে বাংলায় ট্রান্সক্রাইব করা টেক্সট দেখা যাবে, যেখানে প্রতিটি শব্দের কনফিডেন্স স্কোর হাইলাইট করা থাকবে।'
WHERE approach_id = 'bangla-speech-infrastructure' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'bangla-speech-infrastructure-problem';

-- code-change-verification
UPDATE problem_text SET
  title = 'AI-written code still needs testing before it goes live',
  summary = 'A code change can look right but fail in real use. Teams still need evidence that it fixes the reported problem.',
  customer = 'Software engineering teams, tech startups, and IT outsourcing agencies using AI coding assistants.',
  context = 'Coding assistants can produce a proposed fix quickly. Reviewers still need to reproduce the bug, test the change and check nearby behaviour. A useful tool makes that evidence easier to gather. It must show what it could not test as clearly as what passed.',
  unknown = 'Can an automated testing bot reliably reproduce the bug, test the AI''s fix in a sandbox, and prove it works before a human reviews it?'
WHERE problem_id = 'code-change-verification-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'এআইয়ের লেখা কোডও লাইভ করার আগে টেস্ট করতে হয়',
  summary = 'কোড দেখতে ঠিক মনে হলেও চালাতে গিয়ে সমস্যা হতে পারে। যে বাগ ঠিক করার কথা, সেটা সত্যিই ঠিক হয়েছে কি না, টিমের সেই প্রমাণ দরকার।',
  customer = 'সফটওয়্যার ইঞ্জিনিয়ারিং টিম, টেক স্টার্টআপ, আর যেসব আইটি আউটসোর্সিং এজেন্সি এআই কোডিং অ্যাসিস্ট্যান্ট ব্যবহার করে।',
  context = 'কোডিং অ্যাসিস্ট্যান্ট দ্রুত একটা ফিক্স লিখে দিতে পারে। তবু রিভিউয়ারকে আগের বাগ আবার চালিয়ে দেখতে হয়, নতুন কোড টেস্ট করতে হয় আর পাশের কাজগুলো ঠিক আছে কি না, চেক করতে হয়। এই প্রমাণ জোগাড় সহজ করে এমন টুল কাজে লাগতে পারে। কী পাস করেছে আর কী টেস্ট করা যায়নি, দুটোই পরিষ্কার দেখাতে হবে।',
  unknown = 'একটা অটোমেটেড টেস্টিং বট কি বাগটা আবার তৈরি করে, স্যান্ডবক্সে এআই-এর কোড টেস্ট করে, আর মানুষ রিভিউ করার আগেই কাজ করার প্রমাণ দিতে পারবে?'
WHERE problem_id = 'code-change-verification-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Test AI-written code fixes before they go live',
  summary = 'Run AI-written bug fixes in an isolated test environment. Check the reported bug and related tests, then show the results to reviewers.',
  description = 'With the team’s permission, connect to one repository. For a bug-fix pull request, run the old failure and proposed change in an isolated environment with no production secrets. Run relevant tests within time and cost limits. Attach results and logs to the pull request. Mark unsupported cases as untested, not passed.',
  steps_json = '["Interview five engineering leads at local tech companies. Ask how often AI code suggestions fail in review and what checks take the most time.","Build a GitHub bot for one open-source repository. Have it automatically spin up Docker tests on incoming bug-fix pull requests.","Run a one-month paid pilot with a 10-person software agency. Track how many bad pull requests it caught before human review."]',
  prototype = 'Design a GitHub pull request comment bot: show test pass/fail status, execution time, CPU/memory diff, and a recorded terminal log of the test run.'
WHERE approach_id = 'code-change-verification' AND locale = 'en';
UPDATE approach_text SET
  title = 'এআইয়ের লেখা কোড লাইভ করার আগে টেস্ট করুন',
  summary = 'আলাদা টেস্ট এনভায়রনমেন্টে এআইয়ের লেখা কোড ফিক্স চালান। আগের বাগ আর সম্পর্কিত টেস্টগুলো চেক করে রিভিউয়ারকে ফল দেখান।',
  description = 'টিমের অনুমতি নিয়ে একটা রিপোজিটরির সাথে কানেক্ট করুন। বাগ-ফিক্স পুল রিকোয়েস্ট এলে আলাদা এনভায়রনমেন্টে আগের বাগ আর নতুন কোড চালিয়ে দেখুন। সেখানে প্রোডাকশনের কোনো গোপন তথ্য রাখবেন না। সময় আর খরচের সীমার মধ্যে দরকারি টেস্টগুলো চালান। ফল আর লগ পুল রিকোয়েস্টে দিন। যা টেস্ট করা যায়নি, সেটা পাস দেখাবেন না।',
  steps_json = '["লোকাল টেক কোম্পানির ৫ জন ইঞ্জিনিয়ারিং লিডের ইন্টারভিউ নিন। জানুন এআই-এর দেওয়া কোড কতবার রিভিউতে ফেল করে আর কোন জিনিসগুলো চেক করতে সবচেয়ে বেশি সময় লাগে।","একটা ওপেন-সোর্স রিপোজিটরির জন্য গিটহাব বট বানান। বাগ-ফিক্স পুল রিকোয়েস্ট এলে সেটা দিয়ে অটোমেটিক ডকার টেস্ট করান।","১০ জনের একটা সফটওয়্যার এজেন্সির সাথে এক মাসের পেইড পাইলট চালান। মানুষ রিভিউ করার আগে এটা কতগুলো খারাপ পুল রিকোয়েস্ট ধরতে পেরেছে তা ট্র্যাক করুন।"]',
  prototype = 'একটা গিটহাব পুল রিকোয়েস্ট কমেন্ট বট ডিজাইন করুন: যেটা টেস্ট পাস/ফেল স্ট্যাটাস, রান করার সময়, সিপিইউ/মেমরি ডিফারেন্স, আর টেস্ট রানের একটা রেকর্ড করা টার্মিনাল লগ দেখাবে।'
WHERE approach_id = 'code-change-verification' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'code-change-verification-problem';

-- merchant-settlement-reconciliation
UPDATE problem_text SET
  title = 'Online stores lose track of cash held up by couriers and payment gateways',
  summary = 'Payments, courier fees and returns appear in different reports, making it harder to see which orders have been paid.',
  customer = 'Online brands, Facebook page sellers, and e-commerce merchants in Bangladesh shipping 50 or more orders daily.',
  context = 'An online shop may receive money through wallets, card gateways and several couriers. Fees, returns and payment dates can differ. A total bank deposit does not show the status of each order. Matching the reports can separate a missing payment from one that is still due later.',
  unknown = 'Will online merchants pay a monthly fee for software that connects their order list with courier and wallet payout statements to flag missing money?'
WHERE problem_id = 'merchant-settlement-reconciliation-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'কুরিয়ার এবং পেমেন্ট গেটওয়েতে আটকে থাকা ক্যাশ অনলাইনের দোকানগুলো ট্র্যাক করতে পারে না',
  summary = 'পেমেন্ট, কুরিয়ারের ফি আর রিটার্নের হিসাব আলাদা রিপোর্টে থাকে। তাই কোন অর্ডারের টাকা এসেছে, তা মেলাতে কাজ বাড়ে।',
  customer = 'অনলাইন ব্র্যান্ড, ফেসবুক পেজ সেলার এবং বাংলাদেশের যেসব ই-কমার্স মার্চেন্ট প্রতিদিন ৫০ বা তার বেশি অর্ডার ডেলিভারি করেন।',
  context = 'অনলাইন শপে ওয়ালেট, কার্ড গেটওয়ে আর কয়েকটি কুরিয়ার থেকে টাকা আসতে পারে। ফি, রিটার্ন আর টাকা দেওয়ার সময় একেক জায়গায় আলাদা হয়। ব্যাংকে মোট কত টাকা ঢুকল, সেটা দিয়ে প্রতিটি অর্ডারের হিসাব বোঝা যায় না। রিপোর্টগুলো মেলালে কোন টাকা আসেনি আর কোনটা পরে আসার কথা, আলাদা করা যায়।',
  unknown = 'অনলাইন মার্চেন্টরা কি এমন একটা সফটওয়্যারের জন্য মাসিক ফি দেবেন, যা হারানো টাকা খুঁজে বের করতে তাদের অর্ডার লিস্টের সাথে কুরিয়ার আর ওয়ালেটের স্টেটমেন্ট মেলাবে?'
WHERE problem_id = 'merchant-settlement-reconciliation-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Automated payment and courier cash-on-delivery reconciliation',
  summary = 'Match daily orders with courier payouts and wallet statements. Flag payment differences for the shop to check.',
  description = 'Start with one merchant’s order sheet and reports they can legally export from a courier or payment provider. Match order IDs, fees, refunds and expected payment dates. Flag differences with the original record beside each one. Let staff check whether a payment is missing, delayed or recorded under another reference.',
  steps_json = '["Ask five online stores how they match payments and which differences take longest to resolve.","With permission, compare one merchant’s past order and payout reports. Check missing IDs, partial payments, fees and refunds.","Have the merchant confirm each finding. Offer a paid trial and measure time saved, useful findings and repeat use."]',
  prototype = 'Build a simple web dashboard: green card for "Matched & Paid", yellow card for "Pending with Courier", and red card for "Missing Payouts / Disputed Returns" with one-click dispute export.'
WHERE approach_id = 'merchant-settlement-reconciliation' AND locale = 'en';
UPDATE approach_text SET
  title = 'পেমেন্ট আর কুরিয়ারের ক্যাশ-অন-ডেলিভারি অটোমেটিক মেলানোর ব্যবস্থা করুন',
  summary = 'প্রতিদিনের অর্ডারের সাথে কুরিয়ারের পেমেন্ট আর ওয়ালেটের স্টেটমেন্ট মেলান। কোথায় টাকার হিসাব মিলছে না, দোকানকে চেক করার জন্য দেখান।',
  description = 'একজন মার্চেন্টের অর্ডার শিট আর কুরিয়ার বা পেমেন্ট কোম্পানি থেকে অনুমতি নিয়ে পাওয়া রিপোর্ট দিয়ে শুরু করুন। অর্ডার আইডি, ফি, রিফান্ড আর টাকা আসার তারিখ মেলান। অমিলের পাশে মূল রেকর্ড দেখান। টাকা আসেনি, দেরি হচ্ছে নাকি অন্য নম্বরে হিসাব হয়েছে, স্টাফকে সেটা চেক করতে দিন।',
  steps_json = '["৫টি অনলাইন স্টোরকে জিজ্ঞেস করুন তারা কীভাবে পেমেন্ট মেলায় আর কোন অমিল বুঝতে বেশি সময় লাগে।","অনুমতি নিয়ে একজন মার্চেন্টের আগের অর্ডার আর পেআউট রিপোর্ট মেলান। পাওয়া যায়নি এমন আইডি, আংশিক পেমেন্ট, ফি আর রিফান্ড চেক করুন।","প্রতিটি ফল মার্চেন্টকে দিয়ে মিলিয়ে নিন। পেইড ট্রায়াল অফার করে দেখুন সময় কতটা বাঁচে, কোন ফল কাজে লাগে আর তিনি আবার ব্যবহার করেন কি না।"]',
  prototype = 'একটা সিম্পল ওয়েব ড্যাশবোর্ড বানান: ''ম্যাচড অ্যান্ড পেইড''-এর জন্য সবুজ কার্ড, ''পেন্ডিং উইথ কুরিয়ার''-এর জন্য হলুদ কার্ড, আর ''মিসিং পেআউটস / ডিসপিউটেড রিটার্নস''-এর জন্য লাল কার্ড, সাথে এক ক্লিকে ডিসপিউট এক্সপোর্ট করার সুবিধা।'
WHERE approach_id = 'merchant-settlement-reconciliation' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'merchant-settlement-reconciliation-problem';

-- bank-cross-border-connectors
UPDATE problem_text SET
  title = 'Connecting bank systems to overseas payment partners takes careful work',
  summary = 'Banks and payment partners need to agree on data formats, checks and payment records before connecting their systems.',
  customer = 'Commercial banks in Bangladesh with foreign exchange licenses and global fintech payment companies.',
  context = 'A cross-border payment connection involves more than moving data between two apps. The bank needs security checks, transaction records, reporting and a way to handle failed or repeated messages. Existing providers already serve this market. Start with a bank’s specific unfinished integration, not a promise to connect every bank.',
  unknown = 'Will a bank pay for a reusable connector that passes its technical and compliance review?'
WHERE problem_id = 'bank-cross-border-connectors-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ব্যাংকের সিস্টেম বিদেশি পেমেন্ট পার্টনারের সাথে জুড়তে অনেক কিছু মেলাতে হয়',
  summary = 'সিস্টেম জোড়ার আগে ব্যাংক আর পেমেন্ট পার্টনারকে ডেটার ফরম্যাট, যাচাইয়ের ধাপ আর পেমেন্টের রেকর্ড নিয়ে একমত হতে হয়।',
  customer = 'বৈদেশিক মুদ্রার লাইসেন্স থাকা বাংলাদেশের কমার্শিয়াল ব্যাংক এবং গ্লোবাল ফিনটেক পেমেন্ট কোম্পানি।',
  context = 'বিদেশি পেমেন্টের কানেকশন মানে শুধু দুই অ্যাপের মধ্যে ডেটা পাঠানো নয়। ব্যাংকের নিরাপত্তা চেক, লেনদেনের রেকর্ড, রিপোর্ট আর ব্যর্থ বা বারবার আসা মেসেজ সামলানোর ব্যবস্থা লাগে। এই বাজারে আগেই সেবাদাতা আছে। সব ব্যাংক জোড়ার কথা না বলে, একটি ব্যাংকের আটকে থাকা নির্দিষ্ট কাজ দিয়ে শুরু করুন।',
  unknown = 'ব্যাংকের টেকনিক্যাল আর নিয়ম মেনে চলার রিভিউ পাস করে, বারবার কাজে লাগানো যায় এমন কানেক্টরের জন্য কি ব্যাংক টাকা দেবে?'
WHERE problem_id = 'bank-cross-border-connectors-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Connect bank systems with overseas payment partners',
  summary = 'Help a bank connect one overseas payment partner and keep the transaction records in step.',
  description = 'Work with a bank on one approved payment flow. Translate messages between the bank and partner’s agreed formats, track their status and help staff match the records. Test retries, reversals and failed transfers. The bank keeps responsibility for compliance, customer funds and approval to go live.',
  business_model = 'Charge banks a one-time software license and setup fee, plus an annual maintenance and support retainer (or a small per-transaction routing fee).',
  steps_json = '["Meet two banks’ technology and payment teams. Find one integration they need and learn how they approve suppliers.","Build a prototype with made-up accounts and the bank’s agreed message formats. Include error and reconciliation logs.","Run a bank-supervised sandbox trial, without real money. Check failures, duplicate messages and staff review before proposing live use."]',
  prototype = 'Make a sandbox showing a test payment, its status, a failed retry and the two sides’ matching transaction records.'
WHERE approach_id = 'bank-cross-border-connectors' AND locale = 'en';
UPDATE approach_text SET
  title = 'বিদেশি পেমেন্ট পার্টনারের সাথে ব্যাংকের সিস্টেম যুক্ত করুন',
  summary = 'ব্যাংককে একটি বিদেশি পেমেন্ট পার্টনারের সাথে কানেক্ট করতে আর দুই পাশের লেনদেনের হিসাব মেলাতে সাহায্য করুন।',
  description = 'ব্যাংকের সাথে অনুমোদিত এক ধরনের পেমেন্ট নিয়ে কাজ করুন। ব্যাংক আর পার্টনারের ঠিক করা ফরম্যাটে মেসেজ পাঠান, স্ট্যাটাস রাখুন আর স্টাফদের হিসাব মেলাতে সাহায্য করুন। আবার পাঠানো মেসেজ, ফেরত নেওয়া লেনদেন আর ব্যর্থ ট্রান্সফার টেস্ট করুন। নিয়ম মানা, কাস্টমারের টাকা আর লাইভ করার অনুমোদনের দায়িত্ব ব্যাংকের কাছেই থাকবে।',
  business_model = 'ব্যাংকগুলো থেকে এককালীন সফটওয়্যার লাইসেন্স ও সেটআপ ফি নিন, সাথে বাৎসরিক মেইনটেন্যান্স ও সাপোর্ট রিটেইনার (বা প্রতি ট্রানজ্যাকশনে ছোট্ট একটা রাউটিং ফি) নিন।',
  steps_json = '["দুটো ব্যাংকের টেকনোলজি আর পেমেন্ট টিমের সাথে কথা বলুন। কোন কানেকশনটা তাদের দরকার আর কীভাবে সেবাদাতা অনুমোদন করে, জেনে নিন।","বানানো অ্যাকাউন্ট আর ব্যাংকের ঠিক করা মেসেজ ফরম্যাট দিয়ে প্রোটোটাইপ বানান। ভুল আর হিসাব মেলানোর লগ রাখুন।","আসল টাকা ছাড়া ব্যাংকের তত্ত্বাবধানে স্যান্ডবক্স ট্রায়াল চালান। লাইভ ব্যবহারের প্রস্তাব দেওয়ার আগে ব্যর্থতা, ডুপ্লিকেট মেসেজ আর স্টাফের রিভিউ চেক করুন।"]',
  prototype = 'একটা স্যান্ডবক্স বানান। টেস্ট পেমেন্ট, তার স্ট্যাটাস, আবার চেষ্টা করে ব্যর্থ হওয়া আর দুই পাশের মেলানো লেনদেনের রেকর্ড দেখান।'
WHERE approach_id = 'bank-cross-border-connectors' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'bank-cross-border-connectors-problem';

-- invoice-finance-evidence
UPDATE problem_text SET
  title = 'Lenders need reliable records before financing export invoices',
  summary = 'An exporter may need cash before a buyer pays. The lender needs to check the invoice, shipment and payment history.',
  customer = 'Exporters and licensed lenders that finance unpaid export invoices.',
  context = 'An exporter may have shipped goods but still be waiting for payment. A lender considering finance needs to check what was shipped, what the buyer owes and whether any payment has arrived. Those records can sit in different places. Better evidence helps the review, but does not remove credit risk or guarantee approval.',
  unknown = 'Can bringing permitted records together save lenders review time without hiding missing evidence?'
WHERE problem_id = 'invoice-finance-evidence-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'এক্সপোর্ট ইনভয়েসে টাকা দেওয়ার আগে লেন্ডারের ভরসা করার মতো রেকর্ড দরকার',
  summary = 'বায়ারের পেমেন্ট আসার আগেই এক্সপোর্টারের ক্যাশ লাগতে পারে। লেন্ডারকে ইনভয়েস, শিপমেন্ট আর আগের পেমেন্ট চেক করতে হয়।',
  customer = 'এক্সপোর্টার আর বকেয়া এক্সপোর্ট ইনভয়েসে অর্থায়ন করেন এমন লাইসেন্সধারী লেন্ডার।',
  context = 'এক্সপোর্টার মাল পাঠিয়েছেন, কিন্তু পেমেন্ট এখনো আসেনি। অর্থায়ন করার আগে লেন্ডারের জানা দরকার কী মাল গেছে, বায়ারের কত বাকি আর কোনো টাকা এসেছে কি না। এই রেকর্ডগুলো আলাদা জায়গায় থাকতে পারে। ভালো প্রমাণ রিভিউয়ে সাহায্য করে। তবে তাতে ঋণের ঝুঁকি শেষ হয় না, অ্যাপ্রুভালও নিশ্চিত হয় না।',
  unknown = 'অনুমতি নিয়ে পাওয়া রেকর্ড এক করলে কি লেন্ডারের রিভিউয়ের সময় বাঁচবে? কোন প্রমাণ পাওয়া যায়নি, সেটাও কি পরিষ্কার থাকবে?'
WHERE problem_id = 'invoice-finance-evidence-problem' AND locale = 'bn';
UPDATE approach_text SET
  summary = 'Bring invoices, shipment proof and payment records together for the lender to review.',
  description = 'Work with one licensed lender and the records it is allowed to use. Match the invoice, buyer order, shipment proof and payments. Show missing or conflicting evidence beside the original record. Flag possible repeat financing only where the available data supports that check. The lender makes the credit decision.',
  steps_json = '["Ask two lenders which invoice checks take longest and what records they can share with permission.","Test redacted past cases, including duplicate records and partial payments. Compare your findings with the lender’s review.","Run a paid trial on one workflow. Measure staff time, useful findings and the cost of keeping records current."]',
  prototype = 'Make a lender review screen with the original invoice, matched records, missing evidence and a place for the reviewer’s decision.'
WHERE approach_id = 'invoice-finance-evidence' AND locale = 'en';
UPDATE approach_text SET
  title = 'বকেয়া এক্সপোর্ট ইনভয়েস চেক করতে লেন্ডারদের সাহায্য করুন',
  summary = 'লেন্ডারের রিভিউয়ের জন্য ইনভয়েস, মাল পাঠানোর প্রমাণ আর পেমেন্টের রেকর্ড এক জায়গায় আনুন।',
  description = 'একজন লাইসেন্সধারী লেন্ডার আর তাঁর ব্যবহারের অনুমতি আছে এমন রেকর্ড নিয়ে কাজ করুন। ইনভয়েস, বায়ারের অর্ডার, মাল পাঠানোর প্রমাণ আর পেমেন্ট মেলান। মূল রেকর্ডের পাশে কোন প্রমাণ নেই বা কোথায় অমিল আছে, দেখান। ডেটা থাকলেই শুধু একই ইনভয়েসে আগে অর্থায়ন হয়েছে কি না, চেক করুন। ঋণ দেওয়ার সিদ্ধান্ত লেন্ডার নেবেন।',
  steps_json = '["দুজন লেন্ডারকে জিজ্ঞেস করুন ইনভয়েসের কোন চেকগুলোতে বেশি সময় লাগে আর কোন রেকর্ড অনুমতি নিয়ে দেওয়া যাবে।","ব্যক্তিগত তথ্য সরানো পুরোনো কেস দিয়ে টেস্ট করুন। ডুপ্লিকেট রেকর্ড আর আংশিক পেমেন্টও রাখুন। লেন্ডারের রিভিউয়ের সাথে ফল মেলান।","একটা কাজের ওপর পেইড ট্রায়াল চালান। স্টাফের সময়, কাজে লাগা ফল আর রেকর্ড আপডেট রাখার খরচ মাপুন।"]',
  prototype = 'লেন্ডারের রিভিউ স্ক্রিন বানান। মূল ইনভয়েস, মেলানো রেকর্ড, পাওয়া যায়নি এমন প্রমাণ আর রিভিউয়ারের সিদ্ধান্ত লেখার জায়গা রাখুন।'
WHERE approach_id = 'invoice-finance-evidence' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'invoice-finance-evidence-problem';

-- adaptive-bangla-learning
UPDATE problem_text SET
  title = 'Children fall behind in maths because classroom teachers must teach at one single speed',
  summary = 'Children in one class can need help with different maths skills. A teacher has limited time for individual practice.',
  customer = 'Primary and middle school students (Grades 3–8), their parents, and budget-conscious schools in Bangladesh.',
  context = 'A child who misses one maths step can struggle with the next lesson. For example, trouble with division can make fractions harder. A short check followed by suitable practice could help, but the team needs to measure learning on new questions, not just repeated answers.',
  unknown = 'Will parents or schools pay for practice that helps children understand a maths skill better?'
WHERE problem_id = 'adaptive-bangla-learning-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ক্লাসে সবাইকে এক গতিতে পড়াতে হয় বলে বাচ্চারা অঙ্কে পিছিয়ে পড়ে',
  summary = 'একই ক্লাসে একেক বাচ্চার অঙ্কের একেক জায়গায় সাহায্য লাগতে পারে। প্রত্যেককে আলাদা প্র্যাকটিস করানোর সময় টিচারের হাতে কম।',
  customer = 'প্রাইমারি ও মিডল স্কুলের ছাত্রছাত্রী (৩য় থেকে ৮ম শ্রেণি), তাদের বাবা-মা এবং বাজেটের দিকে খেয়াল রাখা স্কুলগুলো।',
  context = 'অঙ্কের একটা ধাপ না বুঝলে পরের পাঠেও সমস্যা হতে পারে। ধরুন, ভাগে সমস্যা থাকলে ভগ্নাংশ বুঝতে আরও কঠিন লাগতে পারে। ছোট একটা যাচাইয়ের পর দরকারমতো প্র্যাকটিস দিলে উপকার হতে পারে। তবে একই উত্তর মুখস্থ হলো কি না দেখে নয়, নতুন প্রশ্ন দিয়ে শেখা মাপতে হবে।',
  unknown = 'বাচ্চাকে অঙ্কের কোনো বিষয় ভালো বুঝতে সাহায্য করে এমন প্র্যাকটিসের জন্য বাবা-মা বা স্কুল কি টাকা দেবে?'
WHERE problem_id = 'adaptive-bangla-learning-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Help children practise maths in Bangla at their own pace',
  summary = 'A mobile app that helps find where a child struggles in maths and gives short practice sessions with Bangla voice hints.',
  description = 'Start with one grade and one maths topic, checked by a teacher against the current curriculum. A short quiz helps find where a child gets stuck. Offer small practice sessions with clear Bangla hints. Let a parent or teacher see progress, with consent, and keep children’s records private.',
  steps_json = '["With parent consent and a teacher, try a paper quiz with 20 Grade 4 students. Note the common misunderstandings.","Have the teacher check 50 practice questions and Bangla hints. Try them with 10 children for two weeks on phones their families use.","Use fresh questions to check learning, with teacher review. Ask parents or the school whether they would pay to continue."]',
  prototype = 'Design 5 practice screens on mobile: clear Bangla question text, interactive drag-and-drop counters, a speaker button for spoken voice hints, and coin rewards.'
WHERE approach_id = 'adaptive-bangla-learning' AND locale = 'en';
UPDATE approach_text SET
  title = 'বাচ্চাদের নিজেদের গতিতে বাংলায় অঙ্ক প্র্যাকটিস করতে দিন',
  summary = 'একটা মোবাইল অ্যাপ, যা অঙ্কে বাচ্চা কোথায় আটকে যাচ্ছে তা বুঝতে সাহায্য করে। বাংলায় মুখে বলে দেওয়া ইঙ্গিত দিয়ে অল্প অল্প প্র্যাকটিসের ব্যবস্থা করে।',
  description = 'একটা শ্রেণির অঙ্কের একটি বিষয় দিয়ে শুরু করুন। বর্তমান পাঠ্যক্রমের সাথে টিচারকে দিয়ে মিলিয়ে নিন। ছোট কুইজে বোঝার চেষ্টা করুন বাচ্চা কোথায় আটকে যাচ্ছে। সহজ বাংলা ইঙ্গিতসহ অল্প অল্প প্র্যাকটিস দিন। সম্মতি নিয়ে বাবা-মা বা টিচারকে অগ্রগতি দেখান। বাচ্চাদের তথ্য গোপন রাখুন।',
  steps_json = '["বাবা-মায়ের সম্মতি নিয়ে টিচারের সাথে ৪র্থ শ্রেণির ২০ জনকে কাগজে কুইজ দিন। কোথায় বারবার ভুল হচ্ছে, নোট করুন।","টিচারকে দিয়ে ৫০টি প্র্যাকটিস প্রশ্ন আর বাংলা ইঙ্গিত চেক করান। পরিবারের ব্যবহার করা ফোনে ১০ জন বাচ্চাকে ২ সপ্তাহ চেষ্টা করতে দিন।","টিচারের রিভিউ নিয়ে নতুন প্রশ্নে শেখা যাচাই করুন। বাবা-মা বা স্কুল টাকা দিয়ে চালিয়ে যেতে চান কি না, জিজ্ঞেস করুন।"]',
  prototype = 'মোবাইলে ৫টি প্র্যাকটিস স্ক্রিন ডিজাইন করুন: স্পষ্ট বাংলায় প্রশ্ন, ইন্টারেক্টিভ ড্র্যাগ-অ্যান্ড-ড্রপ কাউন্টার, ভয়েস হিন্টস শোনার জন্য স্পিকার বাটন আর কয়েন রিওয়ার্ড।'
WHERE approach_id = 'adaptive-bangla-learning' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'adaptive-bangla-learning-problem';

-- bangla-assessment-feedback
UPDATE problem_text SET
  title = 'Teachers need time to give useful feedback on Bangla writing',
  summary = 'Reading handwritten answers and explaining mistakes takes time, especially when a teacher has many scripts to check.',
  customer = 'Bangla teachers in schools and coaching centres who review handwritten answers.',
  context = 'Checking a written answer involves more than adding a mark. The teacher needs to read the handwriting, compare the answer with the marking rules and explain how to improve it. A tool could draft those comments, but unclear handwriting and valid alternative answers still need a teacher’s judgment.',
  unknown = 'Can OCR and AI accurately read photos of students'' handwritten Bangla exam sheets and draft helpful grading suggestions for the teacher to approve?'
WHERE problem_id = 'bangla-assessment-feedback-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'বাংলা লেখায় কাজে লাগবে এমন ফিডব্যাক দিতে টিচারদের সময় দরকার',
  summary = 'হাতে লেখা উত্তর পড়া আর ভুল বুঝিয়ে দিতে সময় লাগে, বিশেষ করে একসাথে অনেক খাতা দেখতে হলে।',
  customer = 'স্কুল ও কোচিং সেন্টারের বাংলা টিচার, যাঁরা হাতে লেখা উত্তর দেখেন।',
  context = 'খাতা দেখা মানে শুধু নম্বর বসানো নয়। হাতের লেখা পড়ে নম্বর দেওয়ার নিয়মের সাথে উত্তর মেলাতে হয়, তারপর কীভাবে ভালো করা যায় তা বুঝিয়ে দিতে হয়। একটা টুল এই মন্তব্যের খসড়া করে দিতে পারে। তবে অস্পষ্ট হাতের লেখা আর অন্যভাবেও সঠিক হওয়া উত্তর টিচারকে বিচার করতে হবে।',
  unknown = 'ওসিআর (OCR) ও এআই (AI) কি ছাত্রছাত্রীদের হাতে লেখা বাংলা খাতার ছবি নির্ভুলভাবে পড়ে টিচারদের অ্যাপ্রুভ করার জন্য ভালো গ্রেডিং সাজেশন তৈরি করে দিতে পারবে?'
WHERE problem_id = 'bangla-assessment-feedback-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Help teachers grade handwritten Bangla classwork and give feedback',
  summary = 'Turn photos of Bangla classwork into draft feedback that the teacher checks before sharing.',
  description = 'With permission, use a photo of a student’s answer. Show the original image beside the text the tool reads. Compare it with the teacher’s marking rules and suggest comments, marking uncertain text clearly. The teacher corrects the reading, edits the feedback and decides the mark before anything is shared.',
  steps_json = '["With the required consent, collect 30 redacted homework sheets. Ask a teacher to mark them and explain the feedback.","Test text reading and draft comments against the teacher’s work. Include unclear handwriting and correct answers written in different ways.","Run a trial with three teachers. Track review time, missed errors and wrong suggestions, then ask whether they would pay."]',
  prototype = 'Build a side-by-side grading interface: photo of handwritten Bangla answer sheet on the left, recognized text with highlighted spelling errors and draft comments on the right, with an "Approve Grade" button.'
WHERE approach_id = 'bangla-assessment-feedback' AND locale = 'en';
UPDATE approach_text SET
  title = 'হাতে লেখা বাংলা খাতা গ্রেড করতে এবং ফিডব্যাক দিতে টিচারদের সাহায্য করুন',
  summary = 'বাংলা খাতার ছবি থেকে ফিডব্যাকের খসড়া বানান। কাউকে পাঠানোর আগে টিচার মিলিয়ে ঠিক করে নেবেন।',
  description = 'অনুমতি নিয়ে ছাত্রছাত্রীর উত্তরের ছবি ব্যবহার করুন। টুল যে লেখা পড়েছে, তার পাশে মূল ছবি দেখান। টিচারের নম্বর দেওয়ার নিয়মের সাথে মিলিয়ে মন্তব্য সাজেস্ট করুন। লেখা পরিষ্কার বোঝা না গেলে সেটা চিহ্নিত করুন। টিচার লেখা ঠিক করে, ফিডব্যাক এডিট করে, নিজে নম্বর দেবেন। তারপরই তা পাঠানো যাবে।',
  steps_json = '["প্রয়োজনীয় সম্মতি নিয়ে ৩০টি হোমওয়ার্কের খাতা থেকে ব্যক্তিগত তথ্য সরান। টিচারকে দিয়ে নম্বর আর ফিডব্যাক লিখিয়ে নিন।","টুলের পড়া লেখা আর খসড়া মন্তব্য টিচারের কাজের সাথে মেলান। অস্পষ্ট হাতের লেখা আর ভিন্নভাবে লেখা সঠিক উত্তরও টেস্টে রাখুন।","৩ জন টিচারকে নিয়ে ট্রায়াল চালান। রিভিউয়ের সময়, ধরা পড়েনি এমন ভুল আর ভুল সাজেশন হিসাব করুন। তাঁরা টাকা দিয়ে ব্যবহার করবেন কি না, জিজ্ঞেস করুন।"]',
  prototype = 'একটা পাশাপাশি গ্রেডিং ইন্টারফেস বানান: বাঁ দিকে হাতে লেখা বাংলা খাতার ছবি, ডান দিকে বানান ভুল হাইলাইট করা টেক্সট ও ড্রাফট কমেন্ট, আর নিচে একটা "Approve Grade" বাটন থাকবে।'
WHERE approach_id = 'bangla-assessment-feedback' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'bangla-assessment-feedback-problem';

-- fish-farm-autopilot
UPDATE problem_text SET
  title = 'Low pond oxygen can put fish at risk overnight',
  summary = 'Oxygen can fall during the night. Farmers need reliable readings and enough time to respond.',
  customer = 'Commercial pond farms where oxygen levels and aerator use need regular checks.',
  context = 'Fish, plants and other pond organisms use oxygen at night, while photosynthesis stops. Oxygen can be lowest near dawn. Risk depends on the fish, stocking level and pond conditions. A useful alert needs reliable measurements and a response plan; it cannot supply power to an aerator during an outage.',
  unknown = 'Will farmers pay for a reliable sensor and alert service that fits their pond and helps them respond when oxygen falls?'
WHERE problem_id = 'fish-farm-autopilot-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'রাতে পুকুরের অক্সিজেন কমে গেলে মাছের ঝুঁকি বাড়ে',
  summary = 'রাতের দিকে পানির অক্সিজেন কমতে পারে। চাষির ঠিক রিডিং আর ব্যবস্থা নেওয়ার সময় দরকার।',
  customer = 'কমার্শিয়াল পুকুরের খামার, যেখানে অক্সিজেন আর এরেটর চালানোর হিসাব নিয়মিত চেক করতে হয়।',
  context = 'রাতে মাছ, উদ্ভিদ আর পুকুরের অন্য জীব অক্সিজেন নেয়, কিন্তু সূর্যের আলো থেকে নতুন অক্সিজেন তৈরি হয় না। ভোরের দিকে মাত্রা সবচেয়ে কম হতে পারে। মাছের ধরন, ঘনত্ব আর পুকুরের অবস্থার ওপর ঝুঁকি নির্ভর করে। অ্যালার্ট কাজে লাগতে হলে রিডিং ঠিক হতে হবে আর করণীয় জানা থাকতে হবে। বিদ্যুৎ গেলে শুধু অ্যালার্ট দিয়ে এরেটর চালানো যাবে না।',
  unknown = 'চাষিরা কি তাঁদের পুকুরে ঠিকমতো কাজ করে এমন সেন্সর আর অ্যালার্টের জন্য টাকা দেবেন, যাতে অক্সিজেন কমলে ব্যবস্থা নিতে পারেন?'
WHERE problem_id = 'fish-farm-autopilot-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Alert fish farmers when pond oxygen drops',
  summary = 'Monitor pond oxygen and alert the farmer when action is needed. Test alerts first, then consider safe aerator control.',
  description = 'Put a suitable oxygen sensor in one pond and check its readings against a trusted meter. Agree on alert levels and response steps with an aquaculture specialist. Start by calling the farmer when action is needed. Add automatic aerator control only after testing electrical safety, sensor failure and power-loss handling, with manual control available.',
  steps_json = '["Ask five pond operators about past oxygen problems, aerator costs and current checks.","With a specialist, test readings and alerts for 30 days at one pond. Keep normal checks in place and test failures without putting fish at risk.","Measure false and missed alerts, cleaning needs, response time and full costs. Ask whether the farmer would pay to keep it."]',
  prototype = 'Build an SMS/voice-call alert trigger: connect a dissolved oxygen sensor probe to a GSM module that rings the farmer''s phone when oxygen drops below safety limits.'
WHERE approach_id = 'fish-farm-autopilot' AND locale = 'en';
UPDATE approach_text SET
  title = 'পুকুরে অক্সিজেন কমলে চাষিকে জানান',
  summary = 'পুকুরের অক্সিজেন মেপে ব্যবস্থা দরকার হলে চাষিকে জানান। প্রথমে অ্যালার্ট টেস্ট করুন। তারপর নিরাপদে এরেটর চালু করার ব্যবস্থা ভাবুন।',
  description = 'একটা পুকুরে উপযুক্ত অক্সিজেন সেন্সর বসিয়ে নির্ভরযোগ্য মিটারের সাথে রিডিং মেলান। মৎস্যচাষ বিশেষজ্ঞের সাথে কোন মাত্রায় অ্যালার্ট দেবেন আর কী করবেন, ঠিক করুন। প্রথমে ব্যবস্থা দরকার হলে চাষিকে কল দেওয়ার কাজটা করুন। পরে বিদ্যুতের নিরাপত্তা, সেন্সর নষ্ট হওয়া আর বিদ্যুৎ চলে যাওয়ার ব্যবস্থা টেস্ট করে অটোমেটিক এরেটর কন্ট্রোল যোগ করুন। হাতে চালানোর ব্যবস্থাও রাখুন।',
  steps_json = '["৫ জন পুকুর অপারেটরকে আগের অক্সিজেনের সমস্যা, এরেটরের খরচ আর এখনকার চেক নিয়ে জিজ্ঞেস করুন।","বিশেষজ্ঞকে নিয়ে একটি পুকুরে ৩০ দিন রিডিং আর অ্যালার্ট টেস্ট করুন। স্বাভাবিক চেক চালু রাখুন। মাছকে ঝুঁকিতে না ফেলে ব্যর্থতার পরিস্থিতি টেস্ট করুন।","ভুল অ্যালার্ট, না আসা অ্যালার্ট, পরিষ্কারের কাজ, ব্যবস্থা নিতে সময় আর পুরো খরচ মাপুন। চাষি টাকা দিয়ে রাখতে চান কি না, জিজ্ঞেস করুন।"]',
  prototype = 'একটা এসএমএস/ভয়েস-কল অ্যালার্ট ট্রিগার বানান: একটা ডিজলভড অক্সিজেন সেন্সর প্রোবকে জিএসএম (GSM) মডিউলের সাথে যুক্ত করুন, যা অক্সিজেন বিপদসীমার নিচে নামলে চাষির ফোনে কল দেবে।'
WHERE approach_id = 'fish-farm-autopilot' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'fish-farm-autopilot-problem';

-- crop-loss-data
UPDATE problem_text SET
  title = 'Checking crop damage across many small farms takes time and effort',
  summary = 'Checking scattered farm plots takes work. Insurers need evidence suited to the policy before deciding a claim.',
  customer = 'General insurance companies, microfinance institutions (MFIs), and agricultural development projects in Bangladesh.',
  context = 'Bangladesh already has crop and climate insurance. Some policies pay when a weather index crosses an agreed threshold; others need evidence of actual loss. Satellite images and field records can help with certain checks, but they do not show every small plot or decide every claim. Start with one insurer’s specific evidence need.',
  unknown = 'Will an insurer pay for checked field and satellite records that improve one part of its claims review?'
WHERE problem_id = 'crop-loss-data-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ছোট ছোট অনেক জমির ফসলের ক্ষতি চেক করতে সময় আর কাজ বাড়ে',
  summary = 'ছড়ানো জমিগুলো চেক করতে কাজ বাড়ে। ক্লেইমের সিদ্ধান্ত নিতে বীমা কোম্পানির পলিসির সাথে মেলে এমন প্রমাণ দরকার।',
  customer = 'জেনারেল ইনস্যুরেন্স কোম্পানি, মাইক্রোফাইন্যান্স ইনস্টিটিউশন (MFI) এবং কৃষি উন্নয়ন প্রজেক্ট।',
  context = 'বাংলাদেশে আগেই ফসল আর জলবায়ু বীমা আছে। কিছু পলিসিতে আবহাওয়ার সূচক ঠিক করা সীমা পার হলে টাকা দেওয়া হয়। অন্য পলিসিতে আসল ক্ষতির প্রমাণ লাগে। স্যাটেলাইট ছবি আর মাঠের রেকর্ড কিছু চেকে সাহায্য করে। তবে সব ছোট জমি বা সব ক্লেইমের সিদ্ধান্ত শুধু এগুলো দিয়ে হয় না। একটি বীমা কোম্পানির নির্দিষ্ট প্রমাণের চাহিদা দিয়ে শুরু করুন।',
  unknown = 'মাঠ আর স্যাটেলাইটের চেক করা রেকর্ডে ক্লেইম রিভিউয়ের একটি কাজ সহজ হলে, বীমা কোম্পানি কি এর জন্য টাকা দেবে?'
WHERE problem_id = 'crop-loss-data-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Satellite-backed crop damage verification for agricultural insurers',
  summary = 'Combine suitable satellite images and field checks to help an insurer review crop losses.',
  description = 'Work with one licensed insurer on one crop and risk. Agree on the records its policy needs. Radar images can help map flooding, while optical images can show vegetation changes when conditions allow. Check dates and resolution, then compare sample plots on the ground. Report uncertainty; the insurer decides claims under its policy.',
  business_model = 'Charge insurance companies an annual data subscription plus a per-hectare or per-claim verification fee during disaster assessment windows.',
  steps_json = '["Ask two insurers what evidence they need for one crop policy and which checks are expensive.","Test a past event using dated satellite images and checked field records. Compare the results and note plots the data cannot resolve.","Run a paid pilot with agreed response times. Track accuracy, field costs and whether the insurer can use the report."]',
  prototype = 'Make a map with image dates, farm boundaries, checked field photos and areas that need more evidence.'
WHERE approach_id = 'crop-loss-data' AND locale = 'en';
UPDATE approach_text SET
  title = 'কৃষি বিমার জন্য স্যাটেলাইট ডেটা দিয়ে ফসলের ক্ষতি ভেরিফাই করুন',
  summary = 'উপযুক্ত স্যাটেলাইট ছবি আর মাঠের চেক মিলিয়ে ফসলের ক্ষতি রিভিউ করতে বীমা কোম্পানিকে সাহায্য করুন।',
  description = 'লাইসেন্সধারী একটি বীমা কোম্পানির সাথে এক ধরনের ফসল আর ঝুঁকি নিয়ে কাজ করুন। পলিসিতে কী রেকর্ড লাগে, আগে ঠিক করুন। রাডারের ছবি বন্যার পানি কোথায় আছে বুঝতে সাহায্য করতে পারে। উপযুক্ত অবস্থায় আলো দিয়ে তোলা স্যাটেলাইট ছবিতে গাছের পরিবর্তন দেখা যায়। তারিখ আর ছবির রেজোলিউশন চেক করে মাঠে কিছু জমির সাথে মেলান। কোথায় অনিশ্চয়তা আছে, লিখুন। পলিসি অনুযায়ী ক্লেইমের সিদ্ধান্ত বীমা কোম্পানি নেবে।',
  business_model = 'ইনস্যুরেন্স কোম্পানিগুলোকে বার্ষিক ডেটা সাবস্ক্রিপশন ফি চার্জ করুন, সাথে দুর্যোগের সময় ভেরিফিকেশনের জন্য হেক্টর-প্রতি বা ক্লেইম-প্রতি ফি নিন।',
  steps_json = '["দুটো বীমা কোম্পানিকে জিজ্ঞেস করুন এক ধরনের ফসলের পলিসিতে কী প্রমাণ লাগে আর কোন চেকে বেশি খরচ হয়।","তারিখসহ স্যাটেলাইট ছবি আর চেক করা মাঠের রেকর্ড দিয়ে আগের একটি ঘটনা টেস্ট করুন। ফল মেলান। ডেটা দিয়ে কোন জমি আলাদা বোঝা যাচ্ছে না, লিখে রাখুন।","সময় আগে ঠিক করে পেইড পাইলট চালান। ফল কতটা ঠিক, মাঠের খরচ কত আর রিপোর্ট বীমা কোম্পানির কাজে লাগে কি না, দেখুন।"]',
  prototype = 'ছবির তারিখ, জমির সীমানা, চেক করা মাঠের ছবি আর কোথায় আরও প্রমাণ দরকার, তা দিয়ে একটা ম্যাপ বানান।'
WHERE approach_id = 'crop-loss-data' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'crop-loss-data-problem';

-- direct-export-operations
UPDATE problem_text SET
  title = 'Small brands need help with overseas orders, shipping and payment records',
  summary = 'An overseas order can fall through if a small brand cannot sort out shipping, export papers and payment requirements.',
  customer = 'Bangladeshi indie apparel, leather goods, home decor, and handicraft brands selling to the global diaspora.',
  context = 'Imagine a buyer abroad wants a bag from a Bangladeshi brand. The seller needs to work out shipping, required documents, payment collection and possible returns. These steps depend on the product, destination and bank or payment arrangement. Start with one route and real quotes rather than assuming all overseas orders will be profitable.',
  unknown = 'Will local boutique brands pay an all-in-one fulfillment service that handles international checkout, discounted air shipping, and export paperwork?'
WHERE problem_id = 'direct-export-operations-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ছোট ব্র্যান্ডের বিদেশি অর্ডার, শিপিং আর পেমেন্টের হিসাব সামলাতে সাহায্য লাগে',
  summary = 'শিপিং, এক্সপোর্টের কাগজ আর পেমেন্টের শর্ত মেলাতে না পারলে ছোট ব্র্যান্ডের বিদেশি অর্ডার হাতছাড়া হতে পারে।',
  customer = 'বাংলাদেশি দেশি পোশাক, চামড়াজাত পণ্য, হোম ডেকোর এবং হ্যান্ডিক্রাফট ব্র্যান্ড, যারা প্রবাসী বাংলাদেশিদের কাছে পণ্য বিক্রি করে।',
  context = 'ধরুন, বিদেশের একজন কাস্টমার দেশি ব্র্যান্ডের ব্যাগ কিনতে চান। বিক্রেতাকে শিপিং, দরকারি কাগজ, পেমেন্ট নেওয়া আর রিটার্নের ব্যবস্থা বুঝতে হবে। পণ্য, গন্তব্য আর ব্যাংক বা পেমেন্টের ব্যবস্থার ওপর ধাপগুলো বদলায়। সব বিদেশি অর্ডারে লাভ হবে ধরে না নিয়ে, একটি রুট আর আসল খরচের হিসাব দিয়ে শুরু করুন।',
  unknown = 'লোকাল বুটিক ব্র্যান্ডগুলো কি এমন একটা অল-ইন-ওয়ান সার্ভিসের জন্য পেমেন্ট করবে, যা ইন্টারন্যাশনাল চেকআউট, কম খরচে এয়ার শিপিং এবং এক্সপোর্টের কাগজপত্র সব সামলে নেবে?'
WHERE problem_id = 'direct-export-operations-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Help Bangladeshi brands manage overseas orders',
  summary = 'Help local brands coordinate overseas shipping, export papers and payment records with approved partners.',
  description = 'Start with one product group and destination. Work with a courier and an authorised dealer bank or approved payment provider to confirm the route, documents and payment process. Help the brand pack orders, prepare records and track delivery and refunds. The licensed provider handles the money; your service coordinates the work.',
  steps_json = '["Ask 15 local brands about recent overseas orders, failed deliveries and payment problems.","Get actual courier quotes and confirm the bank or payment provider’s requirements for one product and destination. Include duties and returns in the cost.","Run a small paid batch for three brands. Track delivery time, net payment received, refunds and the full cost per order."]',
  prototype = 'Make an order cost sheet with a dated courier quote, required documents, payment status and possible duties or return costs.'
WHERE approach_id = 'direct-export-operations' AND locale = 'en';
UPDATE approach_text SET
  title = 'বিদেশি অর্ডার সামলাতে বাংলাদেশি ব্র্যান্ডগুলোকে সাহায্য করুন',
  summary = 'অনুমোদিত পার্টনারের সাথে বিদেশে শিপিং, এক্সপোর্টের কাগজ আর পেমেন্টের হিসাব মেলাতে দেশি ব্র্যান্ডকে সাহায্য করুন।',
  description = 'এক ধরনের পণ্য আর একটি গন্তব্য দিয়ে শুরু করুন। কুরিয়ার আর বৈদেশিক মুদ্রার অনুমোদিত ব্যাংক বা পেমেন্ট সেবাদাতার সাথে রুট, কাগজ আর টাকা নেওয়ার নিয়ম ঠিক করুন। ব্র্যান্ডকে প্যাকিং, রেকর্ড তৈরি, ডেলিভারি আর রিফান্ডের হিসাব রাখতে সাহায্য করুন। টাকার কাজ লাইসেন্সধারী সেবাদাতা সামলাবে, আপনি কাজগুলো মিলিয়ে দেবেন।',
  steps_json = '["১৫টি দেশি ব্র্যান্ডকে সম্প্রতি পাওয়া বিদেশি অর্ডার, ব্যর্থ ডেলিভারি আর পেমেন্টের সমস্যা নিয়ে জিজ্ঞেস করুন।","এক ধরনের পণ্য আর গন্তব্যের জন্য কুরিয়ারের আসল রেট এবং ব্যাংক বা পেমেন্ট সেবাদাতার শর্ত জেনে নিন। খরচে শুল্ক আর রিটার্নও ধরুন।","৩টি ব্র্যান্ডের জন্য ছোট একটা পেইড ব্যাচ চালান। ডেলিভারির সময়, হাতে আসা টাকা, রিফান্ড আর অর্ডারপ্রতি পুরো খরচ লিখে রাখুন।"]',
  prototype = 'অর্ডারের খরচের শিট বানান। তারিখসহ কুরিয়ারের রেট, দরকারি কাগজ, পেমেন্টের অবস্থা আর সম্ভাব্য শুল্ক বা রিটার্নের খরচ রাখুন।'
WHERE approach_id = 'direct-export-operations' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'direct-export-operations-problem';

-- forwarder-shipment-control
UPDATE problem_text SET
  title = 'Freight forwarders lose track of shipments across endless WhatsApp chats and paper files',
  summary = 'Cargo logistics teams juggle shipping lines, truckers, customs brokers, and shippers on WhatsApp, leading to missed vessel cutoffs and angry clients.',
  customer = 'Small and mid-size freight forwarders and logistics agencies in Dhaka and Chittagong.',
  context = 'A freight forwarder coordinates shipping space, trucks, documents and updates to the customer. When these details are spread across chats and files, staff have to ask around for the latest status. A shared record could help keep deadlines and responsibilities visible. It only works if the team keeps it current.',
  unknown = 'Will freight forwarding managers pay a monthly software fee for a central shipment board that tracks every milestone and alerts them before deadlines pass?'
WHERE problem_id = 'forwarder-shipment-control-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'অফুরন্ত হোয়াটসঅ্যাপ চ্যাট আর কাগজের ফাইলের ভিড়ে ফ্রেইট ফরোয়ার্ডাররা শিপমেন্টের ট্র্যাক হারিয়ে ফেলে',
  summary = 'কার্গো লজিস্টিকস টিম হোয়াটসঅ্যাপে শিপিং লাইন, ট্রাকচালক, কাস্টমস ব্রোকার এবং শিপারদের সামলাতে গিয়ে কাজের ডেডলাইন মিস করে আর ক্লায়েন্টরা রেগে যায়।',
  customer = 'ঢাকা ও চট্টগ্রামের ছোট এবং মাঝারি ফ্রেইট ফরোয়ার্ডার ও লজিস্টিকস এজেন্সি।',
  context = 'ফ্রেইট ফরোয়ার্ডারকে জাহাজে জায়গা, ট্রাক, কাগজপত্র আর কাস্টমারকে আপডেট দেওয়ার কাজ মেলাতে হয়। তথ্য চ্যাট আর ফাইলে ছড়িয়ে থাকলে সর্বশেষ অবস্থা জানতে স্টাফদের বারবার জিজ্ঞেস করতে হয়। এক জায়গায় হিসাব রাখলে ডেডলাইন আর কার দায়িত্ব কী, দেখা সহজ হতে পারে। তবে টিমকে সেটি আপডেট রাখতে হবে।',
  unknown = 'ফ্রেইট ফরোয়ার্ডিং ম্যানেজাররা কি একটা সেন্ট্রাল শিপমেন্ট বোর্ডের জন্য মাসে সাবস্ক্রিপশন ফি দেবেন, যা প্রতিটি ধাপ ট্র্যাক করবে এবং ডেডলাইন পার হওয়ার আগেই তাদের অ্যালার্ট করবে?'
WHERE problem_id = 'forwarder-shipment-control-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Simple shipment tracking and deadline dashboard for freight forwarders',
  summary = 'Give logistics teams a single shared board to track container milestones, document deadlines, and automated client updates.',
  description = 'Build an easy-to-use cloud workspace designed specifically for Bangladeshi freight forwarders. Create a single digital card for each shipment: links to commercial invoices, customs filing deadlines, container stuffing schedules, and vessel departure times. When a milestone is reached, the system automatically sends a WhatsApp and email update to the exporter. If a customs filing deadline is 4 hours away, the dashboard alerts the operations manager.',
  steps_json = '["Shadow the operations desk at two freight forwarders for a day. Map every single phone call, message, and paper form needed to move one container.","Build a lightweight web tracker showing 5 key shipment stages (Booking, Trucking, Customs, Loading, Sailing). Test it with 10 real shipments.","Run a one-month paid pilot with a 5-person forwarding team. Track whether late customs filings and client status calls drop."]',
  prototype = 'Create a visual Kanban board: columns for "Booking Confirmed", "At Factory", "Port Customs", "Loaded on Vessel", and "Sailing", with yellow deadline countdown timers.'
WHERE approach_id = 'forwarder-shipment-control' AND locale = 'en';
UPDATE approach_text SET
  title = 'ফ্রেইট ফরোয়ার্ডারদের জন্য সিম্পল শিপমেন্ট ট্র্যাকিং এবং ডেডলাইন ড্যাশবোর্ড বানান',
  summary = 'লজিস্টিকস টিমকে কন্টেইনারের স্ট্যাটাস, কাগজপত্রের ডেডলাইন এবং ক্লায়েন্টকে অটোমেটিক আপডেট দেওয়ার জন্য একটা সিঙ্গেল শেয়ার্ড বোর্ড দিন।',
  description = 'বাংলাদেশি ফ্রেইট ফরোয়ার্ডারদের জন্য একটা ইজি-টু-ইউজ ক্লাউড ওয়ার্কস্পেস বানান। প্রতিটি শিপমেন্টের জন্য একটি ডিজিটাল কার্ড তৈরি করুন: যেখানে কমার্শিয়াল ইনভয়েস, কাস্টমস ফাইলিংয়ের ডেডলাইন, কন্টেইনার লোডিংয়ের শিডিউল এবং জাহাজ ছাড়ার সময়ের লিংক থাকবে। কোনো ধাপ শেষ হলে সিস্টেমটি নিজে থেকেই এক্সপোর্টারকে হোয়াটসঅ্যাপ এবং ইমেইলে আপডেট পাঠাবে। কাস্টমস ফাইলিংয়ের ডেডলাইন ৪ ঘণ্টা বাকি থাকলে ড্যাশবোর্ডটি অপারেশনস ম্যানেজারকে অ্যালার্ট করবে।',
  steps_json = '["দুটো ফ্রেইট ফরোয়ার্ডারের অপারেশনস ডেস্কে ১ দিন বসে কাজ দেখুন। একটা কন্টেইনার সরাতে কতগুলো ফোন কল, মেসেজ এবং কাগজের ফর্ম লাগে তা ম্যাপ করুন।","শিপমেন্টের ৫টি মূল ধাপ (বুকিং, ট্রাকিং, কাস্টমস, লোডিং, সেইলিং) দেখিয়ে একটা লাইটওয়েট ওয়েব ট্র্যাকার বানান। ১০টি আসল শিপমেন্ট দিয়ে এটি টেস্ট করুন।","৫ জনের একটা ফরোয়ার্ডিং টিমের সাথে ১ মাসের পেইড পাইলট রান করুন। কাস্টমসের দেরি এবং ক্লায়েন্টের স্ট্যাটাস জানার কল কতটা কমল তা ট্র্যাক করুন।"]',
  prototype = 'একটা ভিজ্যুয়াল কানবান (Kanban) বোর্ড তৈরি করুন: "Booking Confirmed", "At Factory", "Port Customs", "Loaded on Vessel", এবং "Sailing" কলাম থাকবে, সাথে হলুদ রঙের ডেডলাইন কাউন্টডাউন টাইমার দেখাবে।'
WHERE approach_id = 'forwarder-shipment-control' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'forwarder-shipment-control-problem';

-- shared-parcel-returns
UPDATE problem_text SET
  title = 'Separate home pickups can make parcel returns costly',
  summary = 'Separate return pickups add trips for couriers and can leave shoppers waiting at home.',
  customer = 'E-commerce fashion and lifestyle brands, online marketplaces, and couriers in Dhaka.',
  context = 'An online shopper returning an item needs an agreed handover point and proof that it was received. Home pickup can involve missed visits and extra trips. A nearby shop could collect several returns for one courier stop, if storage, staff time and handover records are handled properly.',
  unknown = 'Will customers use a nearby return point, and can the fees cover the shop’s work and courier collection?'
WHERE problem_id = 'shared-parcel-returns-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'আলাদা আলাদা বাসা থেকে পার্সেল ফেরত আনতে খরচ বাড়তে পারে',
  summary = 'আলাদা রিটার্ন পিকআপে কুরিয়ারের ট্রিপ বাড়ে। ক্রেতাকেও বাসায় অপেক্ষা করতে হতে পারে।',
  customer = 'ই-কমার্স ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড, অনলাইন মার্কেটপ্লেস এবং ঢাকার কুরিয়ারগুলো।',
  context = 'অনলাইনে কেনা জিনিস ফেরত দিতে কাস্টমারের ঠিক করা জায়গায় হস্তান্তর আর জমা দেওয়ার প্রমাণ দরকার। বাসা থেকে পিকআপে কাউকে না পাওয়া বা বাড়তি ট্রিপ লাগতে পারে। কাছের দোকানে কয়েকটি রিটার্ন জমলে কুরিয়ার এক জায়গা থেকে নিতে পারে। তবে রাখার জায়গা, দোকানদারের সময় আর হাতবদলের হিসাব ঠিক রাখতে হবে।',
  unknown = 'কাস্টমার কি কাছের রিটার্ন পয়েন্ট ব্যবহার করবেন? ফি থেকে দোকানের কাজ আর কুরিয়ারের সংগ্রহের খরচ উঠবে কি?'
WHERE problem_id = 'shared-parcel-returns-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Neighborhood shop network for e-commerce parcel pickup and returns',
  summary = 'Turn trusted local grocery and stationery stores into convenient parcel drop-off and return points for online shoppers and couriers.',
  description = 'Partner with a few shops on one courier route. A customer brings an approved return and receives a receipt when the shop scans it. Keep parcels in agreed secure storage. Record each handover to the courier and agree who handles lost items, complaints and uncollected parcels before the trial.',
  steps_json = '["Sign up 5 local stationery and grocery shops in one residential area (like Uttara Sector 3) as pickup points.","Partner with two online fashion brands. Give their Uttara customers the option to drop off returns at the local partner shop for free.","Have a courier van collect the accumulated returns from the 5 shops in a single morning run. Check cost savings for the brand and customer satisfaction."]',
  prototype = 'Make a phone screen for shopkeepers to scan a return, issue a receipt and record the later courier handover separately.'
WHERE approach_id = 'shared-parcel-returns' AND locale = 'en';
UPDATE approach_text SET
  title = 'ই-কমার্স পার্সেল পিকআপ এবং রিটার্নের জন্য পাড়ার দোকানগুলোর নেটওয়ার্ক বানান',
  summary = 'পাড়ার পরিচিত মুদি দোকান এবং স্টেশনারিগুলোকে অনলাইন ক্রেতা ও কুরিয়ারদের জন্য সহজ পার্সেল ড্রপ-অফ এবং রিটার্ন পয়েন্ট বানিয়ে ফেলুন।',
  description = 'কুরিয়ারের একটি রুটে কয়েকটি দোকানের সাথে কাজ করুন। কাস্টমার অনুমোদিত রিটার্ন নিয়ে আসবেন। দোকান স্ক্যান করে জমার রিসিট দেবে। পার্সেল ঠিক করা নিরাপদ জায়গায় রাখুন। কুরিয়ারকে দেওয়ার সময়ও রেকর্ড রাখুন। হারানো মাল, অভিযোগ আর নিতে না আসা পার্সেলের দায়িত্ব কার, ট্রায়ালের আগেই ঠিক করুন।',
  steps_json = '["একটি আবাসিক এলাকার (যেমন উত্তরা ৩ নম্বর সেক্টর) ৫টি লোকাল স্টেশনারি ও মুদি দোকানকে পিকআপ পয়েন্ট হিসেবে সাইন আপ করান।","দুটো অনলাইন ফ্যাশন ব্র্যান্ডের সাথে পার্টনারশিপ করুন। তাদের উত্তরায় থাকা কাস্টমারদের লোকাল পার্টনার দোকানে ফ্রিতে রিটার্ন ড্রপ করার অপশন দিন।","কুরিয়ার ভ্যান দিয়ে ওই ৫টি দোকান থেকে জমা হওয়া রিটার্নগুলো এক সকালে কালেক্ট করান। ব্র্যান্ডের খরচ কতটা বাঁচল এবং কাস্টমার স্যাটিসফ্যাকশন চেক করুন।"]',
  prototype = 'দোকানদারের জন্য ফোনে ব্যবহার করা যায় এমন স্ক্রিন বানান। রিটার্ন স্ক্যান করে জমার রিসিট দেবেন। পরে কুরিয়ারকে দেওয়ার ঘটনাটা আলাদা রেকর্ড করবেন।'
WHERE approach_id = 'shared-parcel-returns' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'shared-parcel-returns-problem';

-- pooled-employee-transport
UPDATE problem_text SET
  title = 'Small employers may not fill a staff bus on their own',
  summary = 'Nearby offices may have staff travelling along the same route. Sharing a vehicle could spread the cost.',
  customer = 'Offices, IT firms, hospitals, and banks located in commercial hubs like Gulshan, Banani, and Tejgaon.',
  context = 'An employer arranging staff transport has to match home locations, shift times and vehicle costs. A vehicle with many empty seats can be expensive to run. Nearby offices could share a route, but extra pickups must not make the trip too long or unreliable.',
  unknown = 'Can you pool employees from several neighboring offices into shared routes that arrive on time without making the commute too long?'
WHERE problem_id = 'pooled-employee-transport-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ছোট অফিসের পক্ষে একা স্টাফ বাসের সব সিট ভরা কঠিন হতে পারে',
  summary = 'পাশাপাশি অফিসের কর্মীরা একই রুটে যাতায়াত করতে পারেন। এক গাড়িতে গেলে খরচ ভাগ করে নেওয়া যেতে পারে।',
  customer = 'গুলশান, বনানী বা তেজগাঁওয়ের মতো কমার্শিয়াল এলাকার অফিস, আইটি ফার্ম, হাসপাতাল ও ব্যাংক।',
  context = 'স্টাফদের গাড়ির ব্যবস্থা করতে বাসার এলাকা, অফিসের সময় আর গাড়ির খরচ মেলাতে হয়। অনেক সিট খালি থাকলে গাড়ি চালানোর খরচ বেশি পড়ে। পাশের অফিসগুলো মিলে একটা রুট ভাগ করে নিতে পারে। তবে বাড়তি পিকআপে যাত্রা যেন বেশি লম্বা বা অনিশ্চিত না হয়ে যায়।',
  unknown = 'আপনি কি পাশাপাশি কয়েকটি অফিসের কর্মীদের মিলিয়ে এমন কোনো শেয়ারড রুট বানাতে পারবেন, যাতে সবাই ঠিক সময়ে পৌঁছাতে পারেন আর যাতায়াতের সময়ও খুব বেশি না বাড়ে?'
WHERE problem_id = 'pooled-employee-transport-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Set up shared commuter shuttles for nearby office employers',
  summary = 'Combine staff from nearby companies into shared air-conditioned vans with reserved seats and fixed pickup times.',
  description = 'Group staff from nearby offices who use the same corridor and similar work hours. With their consent, plan pickup points and a fixed route. Work with a licensed, insured operator and agree on driver checks, passenger limits and a backup vehicle. Employers share the cost through reserved seats.',
  steps_json = '["With consent, ask 30 staff at four nearby offices about pickup areas, work times and transport spending.","Plan one morning and evening route within the vehicle’s approved passenger limit. Check the operator’s licences, insurance and backup plan before a paid trial.","Track punctuality, filled seats, rider feedback and full costs. Ask employers whether they will renew."]',
  prototype = 'Build a route schedule sheet mapping passenger pickup points, estimated arrival times, driver phone numbers, and a backup vehicle hotline.'
WHERE approach_id = 'pooled-employee-transport' AND locale = 'en';
UPDATE approach_text SET
  title = 'আশেপাশের কয়েকটি অফিসের কর্মীদের জন্য শেয়ারড শাটল সার্ভিস চালু করুন',
  summary = 'কাছাকাছি থাকা কয়েকটি কোম্পানির কর্মীদের মিলিয়ে এসি ভ্যানে নির্দিষ্ট সময়ে পিক-আপ ও রিজার্ভ সিটের ব্যবস্থা করুন।',
  description = 'পাশাপাশি অফিসের যেসব কর্মী একই রুটে আর কাছাকাছি সময়ে যাতায়াত করেন, তাঁদের মিলিয়ে নিন। সম্মতি নিয়ে পিকআপ পয়েন্ট আর নির্দিষ্ট রুট ঠিক করুন। লাইসেন্স ও বীমা আছে এমন অপারেটরের সাথে কাজ করুন। ড্রাইভার চেক, যাত্রীর সীমা আর ব্যাকআপ গাড়ির ব্যবস্থা ঠিক করে নিন। কোম্পানিগুলো সিট বুক করে খরচ ভাগ করবে।',
  steps_json = '["সম্মতি নিয়ে পাশের ৪টি অফিসের ৩০ জন কর্মীর পিকআপের এলাকা, কাজের সময় আর যাতায়াতের খরচ জানুন।","গাড়ির অনুমোদিত যাত্রীসংখ্যার মধ্যে সকালে ও বিকেলে একটি রুট ঠিক করুন। পেইড ট্রায়ালের আগে অপারেটরের লাইসেন্স, বীমা আর ব্যাকআপের ব্যবস্থা চেক করুন।","সময়মতো পৌঁছানো, ভরা সিট, যাত্রীদের মতামত আর পুরো খরচের হিসাব রাখুন। কোম্পানিগুলো আবার বুক করতে চায় কি না, জিজ্ঞেস করুন।"]',
  prototype = 'যাত্রীদের পিক-আপ পয়েন্ট, পৌঁছানোর সম্ভাব্য সময়, ড্রাইভারের ফোন নম্বর এবং বিপদে ব্যাকআপ গাড়ির হটলাইন নম্বর দিয়ে একটি রুট শিডিউল শিট বানিয়ে ফেলুন।'
WHERE approach_id = 'pooled-employee-transport' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'pooled-employee-transport-problem';

-- tour-operator-software
UPDATE problem_text SET
  title = 'Local tour operators juggle group bookings across messy WhatsApp chats and paper notebooks',
  summary = 'Tour organizers struggle to sync hotel rooms, bus seats, bKash deposits, and customer cancellations, causing costly booking mistakes.',
  customer = 'Independent tour operators, travel agencies, and weekend adventure group organizers in Bangladesh.',
  context = 'Imagine organising a group trip with bus seats, hotel rooms, guide fees and advance payments. These details may sit in different chats and sheets. A cancellation or room change then needs several updates. One shared trip record could help staff keep the bookings and money in step.',
  unknown = 'Will local tour operators pay a monthly software fee to manage group departures, supplier confirmations, and bKash payments in one dashboard?'
WHERE problem_id = 'tour-operator-software-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ট্যুর অপারেটররা ছড়ানো ছিটানো হোয়াটসঅ্যাপ চ্যাট আর খাতায় বুকিং সামলাতে গিয়ে ঝামেলায় পড়েন',
  summary = 'ট্যুর অর্গানাইজারদের হোটেল রুম, বাসের সিট, বিকাশের পেমেন্ট আর কাস্টমারের বুকিং ক্যানসেল সামলাতে গিয়ে অনেক বড় বড় ভুল হয়ে যায়।',
  customer = 'বাংলাদেশের ইন্ডিপেন্ডেন্ট ট্যুর অপারেটর, ট্রাভেল এজেন্সি এবং যাঁরা উইকেন্ডে গ্রুপ ট্যুর আয়োজন করেন।',
  context = 'ধরুন, একটা গ্রুপ ট্যুরে বাসের সিট, হোটেল রুম, গাইডের ফি আর অ্যাডভান্স পেমেন্ট সামলাচ্ছেন। তথ্যগুলো আলাদা চ্যাট আর শিটে আছে। কেউ ক্যানসেল করলে বা রুম বদলালে কয়েক জায়গায় হিসাব ঠিক করতে হয়। একটি শেয়ার্ড রেকর্ডে বুকিং আর টাকার হিসাব মেলানো সহজ হতে পারে।',
  unknown = 'লোকাল ট্যুর অপারেটররা কি একটি নির্দিষ্ট ড্যাশবোর্ড থেকে গ্রুপের বুকিং, সাপ্লায়ারদের কনফার্মেশন আর বিকাশের পেমেন্ট সামলানোর জন্য মাসিক সফটওয়্যার ফি দিতে রাজি হবেন?'
WHERE problem_id = 'tour-operator-software-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Build a simple trip-management dashboard for group tour operators',
  summary = 'Give tour organizers one place to manage seat availability, hotel rooms, bKash deposits, and traveler itineraries.',
  description = 'Create a clean trip-management dashboard built specifically for Bangladeshi group tours. For each departure, the operator can see available bus seats, confirmed hotel rooms, bKash payment receipts, and dietary or room preferences. The tool automatically sends travelers booking confirmations and digital itineraries over WhatsApp. When someone cancels, the software updates remaining seats instantly so agents can resell them.',
  steps_json = '["Shadow two active tour operators during a busy departure. Note the calls, booking updates and payment checks.","Build a departure board for five upcoming trips. Keep passenger data private and track seats, rooms, payments and cancellations.","Run a paid one-month trial. Measure time saved, remaining booking mistakes and whether the operator wants to keep using it."]',
  signal = 'The tour operator runs all their upcoming weekend trips through your dashboard and insists on paying for the next season.',
  prototype = 'Create a live trip dashboard showing booked seats versus total capacity, linked bKash transaction IDs, room allocations, and an automated WhatsApp itinerary button.'
WHERE approach_id = 'tour-operator-software' AND locale = 'en';
UPDATE approach_text SET
  title = 'গ্রুপ ট্যুর অপারেটরদের জন্য সহজ একটি ট্রিপ ম্যানেজমেন্ট ড্যাশবোর্ড বানান',
  summary = 'ট্যুর অর্গানাইজারদের এমন একটি টুল দিন যেখান থেকে তাঁরা এক জায়গায় বাসের সিট, হোটেল রুম, বিকাশের পেমেন্ট আর ট্যুরের শিডিউল সামলাতে পারেন।',
  description = 'বাংলাদেশের গ্রুপ ট্যুরগুলোর কথা মাথায় রেখে সহজ ও পরিচ্ছন্ন একটি ট্রিপ ম্যানেজমেন্ট ড্যাশবোর্ড তৈরি করুন। প্রতিটি ট্যুরের ক্ষেত্রে, অর্গানাইজার যেন দেখতে পান বাসে কয়টা সিট খালি আছে, কয়টা হোটেল রুম কনফার্ম হয়েছে, বিকাশের পেমেন্ট রিসিট এবং যাত্রীদের খাবার বা রুমের পছন্দ কী। টুলটি নিজে থেকেই যাত্রীদের হোয়াটসঅ্যাপে বুকিং কনফার্মেশন আর ডিজিটাল শিডিউল পাঠিয়ে দেবে। কেউ ক্যানসেল করলে ড্যাশবোর্ডে সাথে সাথে বাকি সিটের হিসাব আপডেট হয়ে যাবে, যাতে অপারেটররা সেটি অন্য কাউকে দিতে পারেন।',
  steps_json = '["ব্যস্ত কোনো ট্যুরের সময় দুজন অপারেটরের সাথে থেকে কাজ দেখুন। ফোন কল, বুকিং আপডেট আর পেমেন্ট চেকের ধাপ নোট করুন।","আসন্ন ৫টি ট্যুরের জন্য ড্যাশবোর্ড বানান। যাত্রীর তথ্য গোপন রেখে সিট, রুম, পেমেন্ট আর ক্যানসেলের হিসাব রাখুন।","এক মাসের পেইড ট্রায়াল চালান। কত সময় বাঁচল, কী ভুল এখনো হচ্ছে আর অপারেটর ব্যবহার চালিয়ে যেতে চান কি না, দেখুন।"]',
  signal = 'ট্যুর অপারেটর তাঁর সামনের সব উইকেন্ড ট্যুর আপনার ড্যাশবোর্ডের মাধ্যমে চালাবেন এবং পরের সিজনের জন্য ফি দিয়ে এটি ব্যবহার করতে চাইবেন।',
  prototype = 'বুক করা সিট আর মোট সিটের হিসাব, বিকাশের ট্রানজেকশন আইডি, রুমের অ্যালটমেন্ট এবং হোয়াটসঅ্যাপে স্বয়ংক্রিয় শিডিউল পাঠানোর বাটন দিয়ে একটি লাইভ ট্রিপ ড্যাশবোর্ড তৈরি করুন।'
WHERE approach_id = 'tour-operator-software' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'tour-operator-software-problem';

-- solar-irrigation-control
UPDATE problem_text SET
  title = 'Solar pump operators need clear water schedules and payment records',
  summary = 'During peak irrigation season, farmers argue over water queues while operators struggle to track who received water and who paid.',
  customer = 'Solar-powered irrigation pump operators, farmer cooperatives, and rural water entrepreneurs.',
  context = 'IDCOL describes a model where farmers pay an agreed fee to use solar irrigation. The operator needs to schedule water, record service and collect fees. During busy periods, sunlight and crop needs affect the plan. A simple tool could help keep these records together; pumping hours are not the same as a measured volume of water.',
  unknown = 'Will solar pump operators use an offline-capable scheduling and billing tool that simplifies water queues and secures payment collections?'
WHERE problem_id = 'solar-irrigation-control-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'সোলার পাম্প অপারেটরের পানির সিরিয়াল আর বিলের পরিষ্কার হিসাব দরকার',
  summary = 'সেচের ভরা মৌসুমে কে আগে পানি পাবে তা নিয়ে কৃষকদের মধ্যে ঝগড়া হয়, আর কে টাকা দিয়েছে আর কে দেয়নি তা মনে রাখতে অপারেটররা বিপদে পড়েন।',
  customer = 'সোলার সেচ পাম্পের অপারেটর, কৃষক সমবায় এবং গ্রামের পানি সরবরাহকারী ব্যবসায়ীরা।',
  context = 'IDCOL-এর বর্ণনায় কৃষক ঠিক করা ফি দিয়ে সোলার সেচ নেন। অপারেটরকে পানির সিরিয়াল, সেবা দেওয়ার রেকর্ড আর বিল তোলার কাজ সামলাতে হয়। ব্যস্ত সময়ে রোদ আর ফসলের প্রয়োজন ধরে সময় ঠিক করতে হয়। সহজ একটা টুলে এই হিসাব এক রাখা যেতে পারে। তবে পাম্প কত ঘণ্টা চলল আর কত পানি দেওয়া হলো, দুটো এক হিসাব নয়।',
  unknown = 'সোলার পাম্প অপারেটররা কি ইন্টারনেট ছাড়াই চলে এমন একটি বিলিং ও শিডিউলিং টুল ব্যবহার করবেন, যা দিয়ে সহজে পানির সিরিয়াল ঠিক রাখা আর পেমেন্ট নেওয়া যায়?'
WHERE problem_id = 'solar-irrigation-control-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Give solar irrigation operators a smart scheduling and billing tool',
  summary = 'Help solar pump managers plan daily water queues, track water delivery, and collect payments easily from farmers.',
  description = 'Build an offline app for one pump operator. Record requests, plan slots around sunlight and crop needs, and log the service delivered. Calculate fees using the operator’s agreed method, which may be based on area, time or another measure. Record cash or mobile payments and send schedule updates when a connection is available.',
  steps_json = '["Visit three pump sites during irrigation season. Learn how the operator schedules water and charges farmers.","Try a paper or offline schedule for two weeks at one site. Record missed slots, pump idle time and corrections.","Compare fee collection and staff time with the old method. Ask the operator to pay for the next season."]',
  prototype = 'Build an offline mobile screen showing today''s watering queue: farmer name, plot size, scheduled pump start time, duration, and fee balance.'
WHERE approach_id = 'solar-irrigation-control' AND locale = 'en';
UPDATE approach_text SET
  title = 'সোলার সেচ পাম্প অপারেটরদের জন্য স্মার্ট শিডিউলিং ও বিলিং টুল তৈরি করুন',
  summary = 'প্রতিদিনের পানির সিরিয়াল সাজাতে, কতটুকু পানি দেওয়া হলো তা ট্র্যাক করতে আর কৃষকদের কাছ থেকে সহজে পেমেন্ট নিতে পাম্প ম্যানেজারদের সাহায্য করুন।',
  description = 'একজন পাম্প অপারেটরের জন্য অফলাইন অ্যাপ বানান। পানির অনুরোধ লিখে রোদ আর ফসলের প্রয়োজন ধরে সিরিয়াল ঠিক করুন। কী সেবা দেওয়া হলো, হিসাব রাখুন। অপারেটরের ঠিক করা নিয়মে বিল করুন। জমির পরিমাণ, সময় বা অন্য হিসাবেও বিল হতে পারে। ক্যাশ বা মোবাইলে পেমেন্ট লিখে রাখুন। সংযোগ থাকলে শিডিউলের আপডেট পাঠান।',
  steps_json = '["সেচের মৌসুমে তিনটি পাম্পে যান। অপারেটর কীভাবে সিরিয়াল দেন আর কৃষকের বিল করেন, জেনে নিন।","একটি পাম্পে দুই সপ্তাহ কাগজে বা অফলাইনে সিরিয়াল রাখার ব্যবস্থা টেস্ট করুন। মিস হওয়া সিরিয়াল, পাম্প বন্ধ থাকার সময় আর ভুল ঠিক করার হিসাব রাখুন।","আগের পদ্ধতির সাথে বিল তোলা আর স্টাফের সময় মেলান। পরের মৌসুমে টাকা দিয়ে ব্যবহার করতে চান কি না, জিজ্ঞেস করুন।"]',
  prototype = 'আজকের পানির সিরিয়াল দেখানোর জন্য একটি অফলাইন মোবাইল স্ক্রিন বানান: কৃষকের নাম, জমির পরিমাণ, পাম্প চালুর সময়, কতক্ষণ চলবে এবং বকেয়া বিল কত।'
WHERE approach_id = 'solar-irrigation-control' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'solar-irrigation-control-problem';

-- fleet-depot-electrification
UPDATE problem_text SET
  title = 'Fleets considering electric vehicles need a workable charging plan',
  summary = 'Delivery companies and bus fleets struggle to install depot chargers, manage power loads, and keep electric vehicles running reliably.',
  customer = 'E-commerce delivery companies, corporate shuttle operators, and private school bus fleets.',
  context = 'For a fleet considering electric vehicles, the route and charging plan matter as much as the vehicle price. Managers need to check range, parking time, electrical capacity and maintenance support. A trial can compare the full cost with the current fleet, including batteries, downtime and financing.',
  unknown = 'Can you offer a complete depot charging and maintenance package that makes switching one delivery route to electric vehicles cheaper than diesel?'
WHERE problem_id = 'fleet-depot-electrification-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ইলেক্ট্রিক গাড়ি নিতে চাইলে ফ্লিটের কাজে লাগে এমন চার্জিং পরিকল্পনা দরকার',
  summary = 'ডেলিভারি কোম্পানি আর বাসের মালিকরা ডিপোতে চার্জার বসাতে, বিদ্যুতের লোড সামলাতে এবং ইলেক্ট্রিক গাড়িগুলোকে ঠিকমতো রাস্তায় টিকিয়ে রাখতে হিমশিম খান।',
  customer = 'ই-কমার্স ডেলিভারি কোম্পানি, কর্পোরেট শাটল অপারেটর এবং প্রাইভেট স্কুলের বাসের মালিকরা।',
  context = 'ইলেক্ট্রিক গাড়ি ভাবছে এমন ফ্লিটের জন্য গাড়ির দামের পাশাপাশি রুট আর চার্জের পরিকল্পনাও জরুরি। এক চার্জে কতদূর যায়, কতক্ষণ পার্কিংয়ে থাকে, বিদ্যুতের কত লোড আছে আর মেইনটেন্যান্স সাপোর্ট কেমন, দেখতে হবে। ট্রায়ালে ব্যাটারি, বন্ধ থাকার সময় আর অর্থায়নের খরচসহ বর্তমান গাড়ির সাথে পুরো হিসাব মেলানো যায়।',
  unknown = 'আপনি কি ডিপোর চার্জিং ও রক্ষণাবেক্ষণের এমন কোনো প্যাকেজ দিতে পারবেন, যা দিয়ে একটি ডেলিভারি রুটকে ডিজেলের বদলে ইলেক্ট্রিক গাড়িতে চালানো আরও সস্তা হবে?'
WHERE problem_id = 'fleet-depot-electrification-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Turn commercial fleet depots electric with managed charging and maintenance',
  summary = 'Help delivery fleets switch to electric vehicles by managing depot charging stations, power safety, and daily vehicle maintenance.',
  description = 'Help one fleet test one fixed route. Check vehicle and route permissions, the approved electrical load and charger requirements before buying equipment. Use qualified installers and the vehicle maker’s service support. Plan charging around the actual tariff and available parking time, with backup arrangements for outages or breakdowns.',
  steps_json = '["Measure one route’s distance, load, fuel costs and parking hours. Compare suitable vehicle options.","After checking permissions and electrical safety, test one vehicle and charger for 30 days. Keep a backup for missed trips.","Review full costs, including vehicle finance, battery wear, repairs and downtime. Expand only if the route works reliably and the numbers make sense."]',
  prototype = 'Make a route cost calculator with vehicle finance, energy, charger installation, battery replacement, maintenance and downtime. Label assumptions.'
WHERE approach_id = 'fleet-depot-electrification' AND locale = 'en';
UPDATE approach_text SET
  title = 'কমার্শিয়াল ফ্লিট ডিপোকে ইলেক্ট্রিক করার জন্য চার্জিং ও মেইনটেন্যান্স সার্ভিস দিন',
  summary = 'ডেলিভারি ফ্লিটগুলোকে ইলেক্ট্রিক গাড়িতে শিফট করতে সাহায্য করার জন্য তাদের ডিপোর চার্জিং স্টেশন, বিদ্যুতের নিরাপত্তা ও প্রতিদিনের মেইনটেন্যান্স সামলান।',
  description = 'একটি ফ্লিটকে একটি ফিক্সড রুট টেস্ট করতে সাহায্য করুন। যন্ত্র কেনার আগে গাড়ি ও রুটের অনুমতি, অনুমোদিত বিদ্যুতের লোড আর চার্জারের শর্ত চেক করুন। যোগ্য ইনস্টলার আর গাড়ি প্রস্তুতকারকের সার্ভিস সাপোর্ট নিন। আসল বিদ্যুতের রেট আর পার্কিংয়ের সময় ধরে চার্জের পরিকল্পনা করুন। বিদ্যুৎ না থাকা বা গাড়ি নষ্ট হওয়ার ব্যাকআপ রাখুন।',
  steps_json = '["একটি রুটের দূরত্ব, বোঝা, তেলের খরচ আর পার্কিংয়ের সময় মাপুন। উপযুক্ত গাড়ির অপশনগুলো মেলান।","অনুমতি আর বিদ্যুতের নিরাপত্তা চেক করে ৩০ দিন একটি গাড়ি ও চার্জার টেস্ট করুন। ট্রিপ মিস হলে ব্যাকআপ রাখুন।","গাড়ির অর্থায়ন, ব্যাটারির ক্ষয়, মেরামত আর বন্ধ থাকার সময়সহ পুরো খরচ দেখুন। রুট ঠিকমতো চললে আর হিসাব মিললেই বাড়ান।"]',
  prototype = 'রুটের খরচের ক্যালকুলেটর বানান। গাড়ির অর্থায়ন, জ্বালানি, চার্জার বসানো, ব্যাটারি বদলানো, মেইনটেন্যান্স আর বন্ধ থাকার খরচ রাখুন। কোনটা অনুমান, দেখিয়ে দিন।'
WHERE approach_id = 'fleet-depot-electrification' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'fleet-depot-electrification-problem';

-- distributed-energy-orchestration
UPDATE problem_text SET
  title = 'Sites need a plan for using solar, batteries and generators together',
  summary = 'Different power sources have different costs and limits. Choosing when to use each one can be difficult.',
  customer = 'Commercial office buildings, private universities, hospitals, and export factories with rooftop solar installations.',
  context = 'A site with solar, batteries and a generator has several power sources to manage. The best schedule depends on its tariff, equipment, backup needs and any net-metering arrangement. Read the site’s records first. Do not assume every unused unit of solar is wasted or that cheaper electricity hours are the same everywhere.',
  unknown = 'Will building facility managers pay for a smart software controller that automatically balances solar, batteries, and grid power to cut utility bills?'
WHERE problem_id = 'distributed-energy-orchestration-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'সোলার, ব্যাটারি আর জেনারেটর একসাথে কাজে লাগাতে পরিকল্পনা দরকার',
  summary = 'একেক ধরনের বিদ্যুতের খরচ আর সীমা একেক রকম। কখন কোনটা ব্যবহার করা ভালো, তা ঠিক করা কঠিন হতে পারে।',
  customer = 'কমার্শিয়াল অফিস, প্রাইভেট বিশ্ববিদ্যালয়, হাসপাতাল এবং ছাদে সোলার সিস্টেম থাকা এক্সপোর্ট ফ্যাক্টরিগুলো।',
  context = 'সোলার, ব্যাটারি আর জেনারেটর আছে এমন জায়গায় কয়েক ধরনের বিদ্যুৎ সামলাতে হয়। কোন সময়ে কী চালানো ভালো, তা বিদ্যুতের রেট, যন্ত্রপাতি, ব্যাকআপের প্রয়োজন আর নেট মিটারিংয়ের ব্যবস্থার ওপর নির্ভর করে। আগে সাইটের হিসাব দেখুন। ব্যবহার না হওয়া সব সোলার বিদ্যুৎ নষ্ট হয় বা সব জায়গায় একই সময়ে বিদ্যুৎ সস্তা, এমন ধরে নেবেন না।',
  unknown = 'সোলার, ব্যাটারি আর গ্রিডের বিদ্যুতের মধ্যে ব্যালান্স করে বিদ্যুতের বিল কমানোর জন্য ভবনের ম্যানেজাররা কি কোনো স্মার্ট সফটওয়্যার কন্ট্রোলার ব্যবহার করবেন?'
WHERE problem_id = 'distributed-energy-orchestration-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Help buildings use solar, batteries and backup power together',
  summary = 'Use site records to plan when flexible equipment should run and when battery power is worth using.',
  description = 'Start with read-only monitoring at a site that already has suitable equipment. Compare solar output, battery levels, demand and the actual tariff. Suggest changes for non-critical loads first. Add control only with the site engineer and equipment maker’s approval, keeping backup reserves, safety protections and manual control in place.',
  business_model = 'Charge a setup and integration fee per building, followed by a monthly software subscription or a percentage of verified electricity bill savings.',
  steps_json = '["Review bills, equipment and operating records with the site engineer. Identify loads whose timing can safely change.","Model possible schedules, including battery wear and backup needs. Compare with how the site runs now.","Run an approved trial with monitoring first. Measure costs under similar demand and weather before offering automatic control."]',
  prototype = 'Build an energy flow dashboard showing live solar generation, battery charge status, grid consumption, and automated switch recommendations.'
WHERE approach_id = 'distributed-energy-orchestration' AND locale = 'en';
UPDATE approach_text SET
  title = 'ভবনে সোলার, ব্যাটারি আর ব্যাকআপ পাওয়ার মিলিয়ে চালাতে সাহায্য করুন',
  summary = 'সাইটের হিসাব দেখে কোন যন্ত্রের সময় বদলানো যায় আর কখন ব্যাটারির বিদ্যুৎ কাজে লাগবে, তার পরিকল্পনা করুন।',
  description = 'উপযুক্ত যন্ত্র আছে এমন সাইটে প্রথমে শুধু রিডিং দেখুন। কোনো সুইচ চালাবেন না। সোলারের উৎপাদন, ব্যাটারির চার্জ, চাহিদা আর আসল বিদ্যুতের রেট মেলান। জরুরি নয় এমন যন্ত্রের সময় বদলানোর প্রস্তাব দিন। সাইটের ইঞ্জিনিয়ার আর যন্ত্র প্রস্তুতকারকের অনুমতি নিয়েই পরে কন্ট্রোল যোগ করুন। ব্যাকআপ চার্জ, নিরাপত্তার ব্যবস্থা আর হাতে চালানোর সুযোগ রাখুন।',
  business_model = 'প্রতিটি ভবনে সিস্টেম বসানোর জন্য এককালীন ইন্টিগ্রেশন ফি নিন। এরপর মাসিক সাবস্ক্রিপশন ফি বা বিদ্যুতের বিল যতটুকু বাঁচল তার একটি অংশ পার্সেন্টেজ হিসেবে নিন।',
  steps_json = '["সাইটের ইঞ্জিনিয়ারের সাথে বিল, যন্ত্রপাতি আর চালানোর রেকর্ড দেখুন। কোন যন্ত্রের সময় নিরাপদে বদলানো যায়, বের করুন।","ব্যাটারির ক্ষয় আর ব্যাকআপের প্রয়োজন ধরে সম্ভাব্য শিডিউলের হিসাব করুন। এখন যেভাবে চলে, তার সাথে মেলান।","অনুমোদিত ট্রায়ালে প্রথমে শুধু মনিটর করুন। অটোমেটিক কন্ট্রোলের প্রস্তাব দেওয়ার আগে কাছাকাছি চাহিদা আর আবহাওয়ায় খরচ মাপুন।"]',
  prototype = 'লাইভ সোলার জেনারেশন, ব্যাটারির স্ট্যাটাস, গ্রিডের ব্যবহার আর অটোমেটেড সুইচিংয়ের সাজেশন দেখানোর জন্য একটি এনার্জি ফ্লো ড্যাশবোর্ড বানিয়ে ফেলুন।'
WHERE approach_id = 'distributed-energy-orchestration' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'distributed-energy-orchestration-problem';

-- underwater-inspection-robotics
UPDATE problem_text SET
  title = 'Muddy water makes underwater inspections difficult',
  summary = 'Low visibility and currents can make it harder to inspect ship hulls, bridge pillars and water intakes.',
  customer = 'Inland cargo vessel owners, river port operators, bridge maintenance authorities, and power plant water intake managers.',
  context = 'An underwater inspection needs usable evidence, not just a camera in the water. Silt can block the view, and current can make a robot hard to control. Sonar may help show shapes where cameras cannot, but it does not replace every test. The customer’s engineer or surveyor needs to agree on what evidence is acceptable.',
  unknown = 'Will ship owners and infrastructure managers pay for underwater robot inspections that deliver clear sonar and video reports without dry-docking?'
WHERE problem_id = 'underwater-inspection-robotics-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'ঘোলা পানিতে ডুবন্ত কাঠামো চেক করা কঠিন',
  summary = 'ঘোলা পানি আর স্রোতে জাহাজের তলা, ব্রিজের পিলার আর পানি টানার মুখ চেক করা কঠিন হতে পারে।',
  customer = 'কার্গো জাহাজের মালিক, নদী বন্দরের অপারেটর, ব্রিজ রক্ষণাবেক্ষণ কর্তৃপক্ষ এবং পাওয়ার প্ল্যান্টের ওয়াটার ইনটেক ম্যানেজাররা।',
  context = 'পানির নিচে ক্যামেরা নামালেই ইন্সপেকশন হয় না। কাজে লাগবে এমন প্রমাণ দরকার। পলিতে ক্যামেরার দৃশ্য আটকে যায়, স্রোতে রোবট চালানোও কঠিন হতে পারে। ক্যামেরায় দেখা না গেলে সোনারে আকৃতি বোঝা যেতে পারে। তবে তা সব টেস্টের বিকল্প নয়। কী প্রমাণ গ্রহণযোগ্য, কাস্টমারের ইঞ্জিনিয়ার বা সার্ভেয়ারের সাথে আগে ঠিক করুন।',
  unknown = 'জাহাজ মালিকরা আর ইনফ্রাস্ট্রাকচার ম্যানেজাররা কি ড্রাইডকে না উঠিয়েই পরিষ্কার সোনার ও ভিডিও রিপোর্টের জন্য রোবট দিয়ে পানির নিচে ইন্সপেকশনের খরচ দেবেন?'
WHERE problem_id = 'underwater-inspection-robotics-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Inspect underwater ship hulls and bridge pillars with robotic submersibles',
  summary = 'Use a remotely operated underwater robot to collect inspection evidence, with sonar where visibility is poor.',
  description = 'Start with one inspection task agreed with a qualified engineer or surveyor. Use a suitable remotely operated vehicle, or ROV, with cameras and sonar as needed. Metal thickness needs a separate suitable measuring probe; images alone do not measure it. Record what was inspected and what could not be checked. Certification or replacing dry-docking needs the relevant authority’s acceptance.',
  steps_json = '["Ask ship owners and a qualified surveyor which inspection task needs better evidence and what they will accept.","With site permission and an experienced operator, test a rented ROV in controlled conditions. Check currents, visibility and retrieval arrangements.","Run one paid inspection within the agreed scope. Have the engineer review the evidence, limitations and full cost before offering repeat work."]',
  prototype = 'Make a sample report showing the inspected area, labelled camera and sonar images, observations and parts that need further checks.'
WHERE approach_id = 'underwater-inspection-robotics' AND locale = 'en';
UPDATE approach_text SET
  title = 'পানির নিচের রোবট দিয়ে জাহাজের তলা আর ব্রিজের পিলার চেক করুন',
  summary = 'রিমোটে চালানো পানির নিচের রোবট দিয়ে ইন্সপেকশনের প্রমাণ জোগাড় করুন। ঘোলা পানিতে দরকার হলে সোনার ব্যবহার করুন।',
  description = 'যোগ্য ইঞ্জিনিয়ার বা সার্ভেয়ারের সাথে ঠিক করা একটি ইন্সপেকশনের কাজ দিয়ে শুরু করুন। উপযুক্ত রিমোটে চালানো রোবট বা ROV ব্যবহার করুন। দরকারমতো ক্যামেরা আর সোনার রাখুন। ধাতুর পুরুত্ব মাপতে আলাদা উপযুক্ত প্রোব লাগে, শুধু ছবি দিয়ে তা মাপা যায় না। কী চেক করলেন আর কী করা যায়নি, লিখুন। সার্টিফিকেশন বা ড্রাইডকের বিকল্প হিসেবে নিতে হলে সংশ্লিষ্ট কর্তৃপক্ষের গ্রহণযোগ্যতা লাগবে।',
  steps_json = '["জাহাজ মালিক আর যোগ্য সার্ভেয়ারকে জিজ্ঞেস করুন কোন ইন্সপেকশনে ভালো প্রমাণ দরকার আর তাঁরা কী গ্রহণ করবেন।","সাইটের অনুমতি আর অভিজ্ঞ অপারেটর নিয়ে নিয়ন্ত্রিত পরিবেশে ভাড়া করা ROV টেস্ট করুন। স্রোত, দৃশ্য আর রোবট ফেরত তোলার ব্যবস্থা চেক করুন।","ঠিক করা পরিধিতে একটি পেইড ইন্সপেকশন করুন। আবার কাজের প্রস্তাব দেওয়ার আগে ইঞ্জিনিয়ারকে দিয়ে প্রমাণ, সীমাবদ্ধতা আর পুরো খরচ রিভিউ করান।"]',
  prototype = 'ইন্সপেকশনের জায়গা, লেবেল দেওয়া ক্যামেরা ও সোনারের ছবি, কী দেখা গেছে আর কোথায় আরও চেক দরকার, তা দিয়ে নমুনা রিপোর্ট বানান।'
WHERE approach_id = 'underwater-inspection-robotics' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'underwater-inspection-robotics-problem';

-- shared-farm-robotics
UPDATE problem_text SET
  title = 'Small farms may not justify buying a machine for seasonal work',
  summary = 'Farmers struggle to hire workers during planting and harvest seasons, but buying a modern robot or machine for a small plot is too costly.',
  customer = 'Smallholder farmers, rural agricultural cooperatives, and local farm-service entrepreneurs.',
  context = 'A farmer may need a machine for only a short part of the year. Buying it also means paying for repairs, storage and an operator. A shared service can spread those costs, but the machine must suit local plots and crops. Existing machine-rental services are the starting comparison, not just hand labour.',
  unknown = 'Will clusters of smallholder farmers pay a pay-per-bigha fee to hire trained operators who bring automated machines to their fields?'
WHERE problem_id = 'shared-farm-robotics-problem' AND locale = 'en';
UPDATE problem_text SET
  title = 'মৌসুমের অল্প কাজের জন্য ছোট খামারের মেশিন কেনার খরচ নাও উঠতে পারে',
  summary = 'চারা বোনা আর ফসল কাটার সময় কৃষকরা শ্রমিক পান না, আবার ছোট জমির জন্য আধুনিক রোবট বা মেশিন কেনাও তাঁদের জন্য অনেক বেশি খরচের ব্যাপার।',
  customer = 'ছোট কৃষক, গ্রামের কৃষি সমবায় এবং কৃষি সেবার ছোট ব্যবসায়ীরা।',
  context = 'বছরের অল্প কিছুদিন কৃষকের মেশিন লাগতে পারে। কিনলে মেরামত, রাখার জায়গা আর অপারেটরের খরচও আছে। শেয়ার্ড সার্ভিসে খরচ ভাগ হতে পারে। তবে মেশিনটা এলাকার জমি আর ফসলের জন্য উপযুক্ত হতে হবে। শুধু হাতের কাজের সাথে নয়, চালু মেশিন ভাড়ার সাথেও তুলনা করুন।',
  unknown = 'কৃষকরা কি নিজেদের ছোট ছোট জমি মিলিয়ে বিঘা-হিসেবে টাকা দিয়ে অটোমেটেড মেশিন আর অপারেটর ভাড়া করতে রাজি হবেন?'
WHERE problem_id = 'shared-farm-robotics-problem' AND locale = 'bn';
UPDATE approach_text SET
  title = 'Provide farm robotics and modern machinery as a shared pay-per-bigha service',
  summary = 'Let smallholder farmers book automated farm machinery by the bigha, with trained operators completing the work on demand.',
  description = 'Start with one task and one farming area. Rent suitable equipment before buying it, and work with a trained operator. Group nearby plots so travel and setup do not eat up the working day. Agree on how the completed area is measured and charge for accepted work. Add robotics only if it improves on available machines.',
  steps_json = '["Ask 15 farmers which seasonal task is costly or hard to book. Compare existing rental services.","Rent one suitable machine with a trained operator. Agree on plot access, safety, work quality and the measured area for a small paid trial.","Track output quality, travel, repairs, idle time and cost per unit of land. Ask farmers to book the next suitable job."]',
  prototype = 'Design a village booking ledger and route sheet: cluster neighboring plots by date, record farmer phone numbers, advance payments, and operator work logs.'
WHERE approach_id = 'shared-farm-robotics' AND locale = 'en';
UPDATE approach_text SET
  title = 'বিঘা-হিসেবে ভাড়ায় ফার্ম রোবোটিক্স আর আধুনিক কৃষি মেশিন সার্ভিস দিন',
  summary = 'ছোট কৃষকদের বিঘা-হিসেবে অটোমেটেড কৃষি মেশিন বুক করার সুযোগ দিন, যেখানে দক্ষ অপারেটররা এসে তাঁদের কাজ করে দিয়ে যাবেন।',
  description = 'একটি কাজ আর একটি কৃষি এলাকা দিয়ে শুরু করুন। কেনার আগে উপযুক্ত মেশিন ভাড়া নিন আর দক্ষ অপারেটরকে সাথে রাখুন। পাশের জমিগুলো মিলিয়ে কাজ করুন, যাতে যাতায়াত আর সেটআপেই দিন না যায়। কাজের জমি কীভাবে মাপবেন, আগে ঠিক করুন। গ্রহণযোগ্যভাবে শেষ হওয়া কাজের জন্য ফি নিন। চালু মেশিনের চেয়ে কাজে সুবিধা হলেই রোবোটিক্স যোগ করুন।',
  steps_json = '["১৫ জন কৃষককে জিজ্ঞেস করুন মৌসুমের কোন কাজে বেশি খরচ বা বুকিংয়ে সমস্যা হয়। চালু ভাড়ার সেবাগুলোর সাথে মেলান।","দক্ষ অপারেটরসহ উপযুক্ত একটি মেশিন ভাড়া নিন। ছোট পেইড ট্রায়ালের আগে জমিতে ঢোকার পথ, নিরাপত্তা, কাজের মান আর মাপের নিয়ম ঠিক করুন।","কাজের মান, যাতায়াত, মেরামত, বসে থাকার সময় আর জমিপ্রতি খরচ হিসাব করুন। কৃষককে পরের উপযুক্ত কাজ বুক করতে বলুন।"]',
  prototype = 'গ্রামের জন্য বুকিং খাতা আর রুট শিট ডিজাইন করুন: তারিখ অনুযায়ী আশেপাশের জমিগুলো মেলাবেন, কৃষকের ফোন নম্বর, অ্যাডভান্স পেমেন্ট আর অপারেটরের কাজের হিসাব রাখবেন।'
WHERE approach_id = 'shared-farm-robotics' AND locale = 'bn';
UPDATE problems SET revision = revision + 1 WHERE id = 'shared-farm-robotics-problem';

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Accellera: Universal Verification Methodology","url":"https://www.accellera.org/downloads/standards/uvm","date":"2026-09-26","en":"Accellera describes UVM as a verification methodology. It is not a programming language.","bn":"Accellera-এর বর্ণনায় UVM চিপ যাচাইয়ের একটি পদ্ধতি। এটি প্রোগ্রামিং ভাষা নয়।"}'))
WHERE id = 'chip-verification-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.accellera.org/downloads/standards/uvm');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"FAO: water quality in fish ponds","url":"https://www.fao.org/fishery/static/FAO_Training/FAO_Training/General/x6709e/x6709e02.htm","date":"2026-09-26","en":"FAO explains daily oxygen changes and how fish species and pond conditions affect oxygen needs.","bn":"FAO দিনে-রাতে অক্সিজেনের পরিবর্তন আর মাছের ধরন ও পুকুরের অবস্থায় অক্সিজেনের প্রয়োজন কীভাবে বদলায়, তা বুঝিয়েছে।"}'))
WHERE id = 'fish-farm-autopilot-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.fao.org/fishery/static/FAO_Training/FAO_Training/General/x6709e/x6709e02.htm');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"ESA: cloud-free crop maps","url":"https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Cloud-free_crop_maps_foster_sustainable_farming","date":"2026-09-26","en":"ESA describes radar and optical crop observations as complementary sources, not identical measurements.","bn":"ESA কৃষি পর্যবেক্ষণে রাডার আর আলো দিয়ে তোলা ছবিকে একে অপরের সহায়ক বলেছে। দুটো একই মাপ দেয় না।"}'))
WHERE id = 'crop-loss-data-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Cloud-free_crop_maps_foster_sustainable_farming');

UPDATE problems SET sources_json = json_insert(sources_json, '$[#]', json('{"title":"Blueye: underwater metal thickness measurement","url":"https://www.blueye.no/blog/maaling-av-metall-under-vann-ved-hjelp-av-rov","date":"2026-09-26","en":"Blueye describes using a separate ultrasonic gauge on an ROV to measure metal thickness. Camera images alone do not do that.","bn":"Blueye পানির নিচের রোবটে আলাদা আলট্রাসনিক যন্ত্র দিয়ে ধাতুর পুরুত্ব মাপার কথা বলেছে। শুধু ক্যামেরার ছবি দিয়ে এই মাপ পাওয়া যায় না।"}'))
WHERE id = 'underwater-inspection-robotics-problem' AND NOT EXISTS (SELECT 1 FROM json_each(problems.sources_json) WHERE json_extract(value, '$.url') = 'https://www.blueye.no/blog/maaling-av-metall-under-vann-ved-hjelp-av-rov');
