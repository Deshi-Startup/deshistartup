-- Plain-language revision of the published app-recovery idea. Keep its ID and
-- source URLs; a new public release is still required for readers to see it.

UPDATE problems SET
  sources_json = json_set(sources_json,
    '$[0].en', 'BCC describes a backup site in Jashore for its government cloud. This shows such a site exists in Bangladesh, not that private companies need another one.',
    '$[0].bn', 'BCC বলছে, তাদের সরকারি ক্লাউডের জন্য যশোরে বিকল্প কেন্দ্র আছে। দেশে এমন কেন্দ্র আছে, এটুকু বোঝা যায়। বেসরকারি কোম্পানির জন্য আরও কেন্দ্র দরকার কি না, তা জানা যায় না।',
    '$[1].en', 'BCC says teams should set a goal for how fast an app must return and how much data they can afford to lose, then test it. These are BCC’s terms for its own customers.',
    '$[1].bn', 'অ্যাপ কত তাড়াতাড়ি ফের চালু করতে হবে আর কতটা ডেটা হারানো চলবে, তা আগে ঠিক করে পরীক্ষা করতে বলে BCC। এগুলো তাদের নিজের কাস্টমারদের জন্য শর্ত।',
    '$[2].en', 'CoLoCity says it rents server space with backup power, network choices and support. Get a real price and check its terms. The page does not say it will restart an app for you.',
    '$[2].bn', 'CoLoCity বলছে, তারা সার্ভার রাখার জায়গা, বিকল্প বিদ্যুৎ, নেটওয়ার্ক আর সাপোর্ট দেয়। আসল দাম ও শর্ত জেনে নিন। অ্যাপ ফের চালু করে দেওয়ার সেবা আছে কি না, এই পেজে বলা নেই।',
    '$[3].en', 'Bangladesh Bank requires some financial firms to plan and test recovery at a separate site. This rule does not apply to every software company.',
    '$[3].bn', 'বাংলাদেশ ব্যাংকের নিয়মে কিছু আর্থিক প্রতিষ্ঠানকে আলাদা জায়গায় অ্যাপ চালুর ব্যবস্থা রাখতে ও পরীক্ষা করতে হয়। সব সফটওয়্যার কোম্পানির জন্য এই নিয়ম নয়।'),
  revision = revision + 1
WHERE id = 'regional-app-recovery';

UPDATE problem_text SET
  title = 'Important apps need a backup plan when their main site fails',
  summary = 'A second server helps only if the app can actually start there when it is needed.',
  customer = 'Software companies in Bangladesh that run important apps for their customers.',
  context = 'Bangladesh already has data centers. BCC describes a backup site in Jashore for its government cloud, and private companies rent out server space. The idea is to help software teams set up and test another place to run an app. We do not yet know which teams would pay for that help.',
  unknown = 'Which teams have not tested their backup plan? How fast must their app be back, how much data could they lose, and would their fee cover the servers, internet, security and support?'
WHERE problem_id = 'regional-app-recovery' AND locale = 'en';

UPDATE problem_text SET
  title = 'মূল সার্ভার বন্ধ হলে জরুরি অ্যাপ চালুর বিকল্প দরকার',
  summary = 'আরেকটি সার্ভার থাকলেই হবে না। দরকারের সময় সেখানে অ্যাপ চালু করা যায় কি না, আগে পরীক্ষা করতে হবে।',
  customer = 'বাংলাদেশে কাস্টমারদের জরুরি অ্যাপ চালায় এমন সফটওয়্যার কোম্পানি।',
  context = 'দেশে ডেটা সেন্টার আগেই আছে। BCC বলছে, তাদের সরকারি ক্লাউডের জন্য যশোরে বিকল্প কেন্দ্র আছে। বেসরকারি কোম্পানিও সার্ভার রাখার জায়গা ভাড়া দেয়। নতুন কেন্দ্র বানানোর বদলে সফটওয়্যার কোম্পানিকে অন্য জায়গায় অ্যাপ চালুর ব্যবস্থা করে দিতে পারেন। আগে পরীক্ষা করে দেখুন, এই সাহায্যের জন্য কে ফি দেবেন।',
  unknown = 'কোন কোম্পানি তাদের বিকল্প ব্যবস্থা পরীক্ষা করেনি? অ্যাপ কত তাড়াতাড়ি ফের চালু করতে হবে, কতটা ডেটা হারানো চলবে, আর পাওয়া ফি দিয়ে সার্ভার, ইন্টারনেট, নিরাপত্তা ও সাপোর্টের খরচ উঠবে কি?'
WHERE problem_id = 'regional-app-recovery' AND locale = 'bn';

UPDATE approach_text SET
  title = 'Help apps come back after a server failure',
  summary = 'Help software companies set up a backup place for an app and test that it works.',
  description = 'Saving a copy of an app’s data does not mean the app will start when its main site fails. Help a software company set up a second place to run an important app. Practice switching to it before there is a real outage. Rent space from existing data centers first. Only think about building a small center if customers keep paying and the costs make sense.',
  business_model = 'Charge once to set up the backup, then a monthly fee to check it and offer support. Show server and internet costs separately. Agree on how fast the app must be back before setting a price.',
  steps_json = json('["Talk to five software companies. Ask about one important app: where it runs, how they back it up, when they last tested it, how long it can be down and who would pay for help. Check what they can already buy.","Get written prices and terms from providers in different places. Check power, internet, security, access and support. Run a small paid test with sample data and an agreed time to get the app running again.","With the test app, pretend the main site has failed. Measure how long the app takes to return, how much data is lost, staff time and monthly costs. Look at building a small center only after repeat paid work; check permits and site risks before spending money."]'),
  signal = 'A customer pays again after a test meets the agreed recovery time, and the fee covers both sites and support.',
  prototype = 'Make a one-page plan and test log for a sample app. Note the main and backup sites, last backup, target time, actual time, staff time and monthly cost. Use sample data, not a live customer app.'
WHERE approach_id = 'modular-data-centers' AND locale = 'en';

UPDATE approach_text SET
  title = 'সার্ভার বন্ধ হলে অ্যাপ ফের চালুর সেবা দিন',
  summary = 'সফটওয়্যার কোম্পানির অ্যাপ অন্য জায়গায় চালুর ব্যবস্থা করুন। দরকারের আগেই পরীক্ষা করে দেখুন, তা কাজ করে কি না।',
  description = 'অ্যাপের ডেটার কপি রাখলেই মূল সার্ভার বন্ধ হওয়ার পর অ্যাপ চালু হবে, এমন নয়। সফটওয়্যার কোম্পানিকে অন্য জায়গায় গুরুত্বপূর্ণ অ্যাপ চালুর ব্যবস্থা করতে সাহায্য করুন। মূল সার্ভার বন্ধ হলে সেখানে অ্যাপ চালু করা যায় কি না, আগেই পরীক্ষা করুন। শুরুতে চালু ডেটা সেন্টার থেকে জায়গা ভাড়া নিন। নিয়মিত ফি দেওয়া কাস্টমার না পেলে আর খরচ না উঠলে নিজের ছোট কেন্দ্র বানাবেন না।',
  business_model = 'বিকল্প ব্যবস্থা বসানোর জন্য একবার ফি নিন। এরপর পরীক্ষা আর সাপোর্টের জন্য মাসিক ফি নিতে পারেন। সার্ভার ভাড়া আর ইন্টারনেটের খরচ আলাদা দেখান। কত সময়ের মধ্যে অ্যাপ ফের চালু করবেন, দাম বলার আগেই তা ঠিক করুন।',
  steps_json = json('["পাঁচটি সফটওয়্যার কোম্পানির সঙ্গে কথা বলুন। একটি গুরুত্বপূর্ণ অ্যাপ কোথায় চলে, ডেটার কপি কীভাবে রাখে, শেষ কবে অ্যাপ ফের চালু করে দেখেছে আর কতক্ষণ বন্ধ থাকলে সমস্যা, জেনে নিন। এই সেবার ফি কে দেবেন আর এখন কী বিকল্প আছে, সেটাও দেখুন।","আলাদা জায়গার সেবাদাতাদের কাছ থেকে লিখিত দাম আর শর্ত নিন। বিদ্যুৎ, ইন্টারনেট, নিরাপত্তা, জায়গায় ঢোকার সুযোগ আর সাপোর্ট দেখুন। নমুনা ডেটা দিয়ে ছোট একটি পরীক্ষামূলক কাজ করুন, ফি নিয়েই। অ্যাপ কত সময়ে চালু করবেন, আগে ঠিক করুন।","নমুনা অ্যাপে মূল সার্ভার বন্ধ ধরে পরীক্ষা করুন। অ্যাপ চালু হতে কত সময় লাগে, কতটা ডেটা হারায়, কর্মীদের কত সময় যায় আর মাসে কত খরচ হয়, লিখে রাখুন। বারবার ফি দিয়ে কাজ পাওয়া গেলে তবেই ছোট কেন্দ্র বানানোর হিসাব করুন। টাকা খরচের আগে অনুমতি আর জায়গার ঝুঁকি দেখুন।"]'),
  signal = 'পরীক্ষায় ঠিক করা সময়ের মধ্যে অ্যাপ চালু হচ্ছে, কাস্টমার আবার ফি দিচ্ছেন, আর সেই টাকা দিয়ে দুই জায়গা ও সাপোর্টের খরচ উঠছে।',
  prototype = 'নমুনা অ্যাপের জন্য এক পাতার পরিকল্পনা আর পরীক্ষার খাতা বানান। মূল ও বিকল্প জায়গা, শেষ ব্যাকআপ, কত সময়ে অ্যাপ ফেরার কথা, আসলে কত সময় লেগেছে, কর্মীদের সময় আর মাসিক খরচ লিখুন। আসল কাস্টমারের ডেটা ব্যবহার করবেন না।'
WHERE approach_id = 'modular-data-centers' AND locale = 'bn';
