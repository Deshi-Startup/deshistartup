-- A focused idea developed from an accepted modular data-center proposal.
-- Existing sites are the starting point; a new modular site is conditional.
-- Private submission and contributor records remain private and unchanged.

INSERT INTO problems (id, slug, sector, places_json, sources_json) VALUES (
  'regional-app-recovery', 'regional-app-recovery', 'technology', '["anywhere"]',
  '[{"title":"BCC · National Data Center portfolio","url":"https://ndc.bcc.gov.bd/wp-content/uploads/2023/07/NDC-Portfolio-v5.1.2.pdf","date":"2023 portfolio, checked 23 September 2026","en":"BCC describes disaster-recovery capacity at Jashore for its government cloud. This establishes an existing Bangladesh example, not a gap in private-sector supply.","bn":"BCC তাদের সরকারি ক্লাউডের জন্য যশোরে বিকল্প কেন্দ্রের কথা জানিয়েছে। দেশে এমন ব্যবস্থার উদাহরণ এটি; বেসরকারি বাজারে ঘাটতির প্রমাণ নয়।"},{"title":"BCC · National Data Center service terms","url":"https://ndc.bcc.gov.bd/wp-content/uploads/2025/02/0.-Combined_Frame-Agreement-for-NDC-ServicesModified-V6_VPS-03.12.2024-1.pdf","date":"2024 service terms, checked 23 September 2026","en":"BCC says recovery-time and data-loss targets depend on application design and should be tested in a drill. Its terms apply to its own customers.","bn":"কত সময়ে সেবা ফিরবে আর কতটা ডেটা হারাতে পারে, তা অ্যাপের নকশার ওপর নির্ভর করে বলে BCC জানিয়েছে। মহড়া দিয়ে যাচাই করার কথাও আছে। এসব তাদের গ্রাহকদের সেবার শর্ত।"},{"title":"CoLoCity · Shared rack colocation","url":"https://colocity.com.bd/shared-rack/","date":"Checked 23 September 2026","en":"The provider advertises rack space, redundant power, network options and support. Compare an actual quote and site terms; the page does not establish a managed app-recovery service.","bn":"প্রতিষ্ঠানটি সার্ভার রাখার জায়গা, বিদ্যুতের বিকল্প ব্যবস্থা, নেটওয়ার্ক ও সাপোর্ট দেওয়ার কথা জানিয়েছে। বাস্তব খরচ ও শর্ত জানতে প্রস্তাব নিতে হবে। অ্যাপ ফের চালুর পুরো সেবা আছে কি না, এই পেজে স্পষ্ট নয়।"},{"title":"Bangladesh Bank · ICT security guideline for regulated finance","url":"https://www.bb.org.bd/aboutus/regulationguideline/brpd/jun192023_ictsecurityv4.pdf","date":"2023 guideline, checked 23 September 2026","en":"Regulated financial organizations must plan and test geographically separate disaster recovery; approvals apply to their sites. These requirements do not automatically apply to every software customer.","bn":"বাংলাদেশ ব্যাংকের আওতাধীন আর্থিক প্রতিষ্ঠানকে আলাদা জায়গায় বিকল্প কেন্দ্র রাখা ও পরীক্ষা করতে হয়; কেন্দ্রের জন্য অনুমোদনের শর্তও আছে। সব সফটওয়্যার কোম্পানির ওপর একই নিয়ম প্রযোজ্য ধরে নেওয়া যাবে না।"}]'
);

INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'regional-app-recovery', 'en',
  'Business apps need a tested way to recover after a hosting failure',
  'A second server helps only if an app can actually restart there in time.',
  'Bangladeshi software companies running business-critical apps for customers.',
  'Bangladesh already has local data-center and disaster-recovery capacity. BCC describes a recovery site in Jashore; private operators advertise colocation. A founder could test whether software teams need help setting up, monitoring and rehearsing recovery across separate sites, rather than selling another empty rack.',
  'Which app owners lack a recovery plan they have tested? What recovery time and data loss can they accept, what do existing providers offer, and will a managed service cover capacity, network, security and support costs?'
);

INSERT INTO problem_text (problem_id, locale, title, summary, customer, context, unknown) VALUES (
  'regional-app-recovery', 'bn',
  'সার্ভার বন্ধ হলে অ্যাপ চালুর বিকল্প ব্যবস্থা আগে থেকে পরীক্ষা করা দরকার',
  'অন্য জায়গায় সার্ভার থাকলেই হবে না। প্রয়োজনের সময় সেখানে অ্যাপ চালু করা যায় কি না, তা পরীক্ষা করতে হবে।',
  'বাংলাদেশে গ্রাহকদের গুরুত্বপূর্ণ অ্যাপ চালায় এমন সফটওয়্যার কোম্পানি।',
  'দেশে ডেটা সেন্টার ও বিকল্প কেন্দ্র আগেই আছে। BCC যশোরে তাদের বিকল্প কেন্দ্রের কথা জানিয়েছে, আর বেসরকারি প্রতিষ্ঠানগুলো সার্ভার রাখার জায়গা দিচ্ছে। নতুন র‌্যাক ভাড়া দেওয়ার বদলে আলাদা দুই জায়গায় অ্যাপ চালুর ব্যবস্থা করে, তা নিয়মিত পরীক্ষা ও দেখভালের সেবা কার দরকার, সেটাই খুঁজে দেখতে হবে।',
  'কার অ্যাপ বন্ধ হলে বড় সমস্যা হয়, আর তারা এখন কত সময়ে ফের চালু করতে পারে? চালু সেবাদাতারা কী দিচ্ছে? জায়গা, সংযোগ, নিরাপত্তা ও সাপোর্টের পুরো খরচ রেখেও গ্রাহকের দেওয়া দামে কাজটি পোষাবে কি?'
);

INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json) VALUES (
  'modular-data-centers', 'regional-app-recovery', 'service', '0', '2026-09-23',
  '["ideas/competitor-map","validation/demand-without-building","metrics/unit-economics"]'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'modular-data-centers', 'en',
  'Keep Bangladesh apps running when a data center fails',
  'Set up and test a second hosting site for software companies, using existing data centers before considering small modular facilities.',
  'A backup copy is useful only if an app can be restored when its main site fails. Help software teams agree how quickly they need to recover and how much data they can lose, then set up a second site and rehearse the switch. Start with capacity rented from separate providers. Build a small modular site later only if recurring customer demand and site economics justify it.',
  'Charge for setup and a monthly service covering monitoring, recovery drills and support. Show hosting and network costs separately; agree recovery targets before quoting a price.',
  '["Ask five software companies about one important app each: where it runs, how backups work, the last recovery test, acceptable downtime and who would pay to improve it. Compare the services they can already buy.","Get written terms from providers in separate locations. Check power, network paths, security, access and support. Run a small paid pilot with a non-sensitive test environment and an agreed recovery target.","Rehearse a site failure. Measure time to restore, data lost, staff hours and the full monthly cost. Seek repeat contracts before pricing any new modular facility; check permissions and site risks before committing capital."]',
  'A paying customer renews after a recovery drill meets its agreed target, and the fee covers both sites and hands-on support.',
  'Make a one-page recovery plan and drill log for a sample app: the primary and backup sites, last backup, recovery target, actual result, support time and monthly cost. Use test data, not a production system.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'modular-data-centers', 'bn',
  'ডেটা সেন্টার বন্ধ হলেও অ্যাপ চালু রাখার সেবা দিন',
  'সফটওয়্যার কোম্পানির অ্যাপ চালানোর জন্য আরেকটি কেন্দ্র প্রস্তুত রাখুন ও পরীক্ষা করুন। শুরুতে চালু কেন্দ্রের জায়গা ভাড়া নিন।',
  'এক জায়গায় অ্যাপ বন্ধ হলে অন্য জায়গায় তা কত দ্রুত চালু হবে? সফটওয়্যার কোম্পানির সঙ্গে আগে সেই সময় আর কতটা ডেটা হারানো চলবে, ঠিক করে নিন। তারপর আলাদা কেন্দ্রে বিকল্প ব্যবস্থা করে মহড়া দিন। শুরুতে চালু দুই সেবাদাতার জায়গা ভাড়া নিতে পারেন। নিয়মিত গ্রাহক ও খরচের হিসাব মিললে তবেই ছোট মডিউলার কেন্দ্র বসানোর কথা ভাবুন।',
  'ব্যবস্থা বসানোর জন্য এককালীন ফি, দেখভাল ও মহড়ার জন্য মাসিক ফি নিতে পারেন। কেন্দ্রের ভাড়া ও সংযোগের খরচ আলাদা করে দেখান। কত সময়ে সেবা ফেরানোর দায়িত্ব নেবেন, দাম ঠিক করার আগেই গ্রাহকের সঙ্গে তা মিলিয়ে নিন।',
  '["পাঁচটি সফটওয়্যার কোম্পানির কাছে একটি করে গুরুত্বপূর্ণ অ্যাপের কথা শুনুন। এখন কোথায় চলে, ব্যাকআপ আছে কি না, শেষ কবে তা পরীক্ষা হয়েছে আর কতক্ষণ বন্ধ থাকলে সমস্যা, জেনে নিন। ভালো বিকল্পের জন্য কে টাকা দেবেন, সেটাও বুঝে নিন।","আলাদা জায়গার সেবাদাতাদের কাছ থেকে খরচ ও শর্ত লিখিত নিন। বিদ্যুৎ, নেটওয়ার্ক, নিরাপত্তা, যাতায়াত ও সাপোর্ট মিলিয়ে দেখুন। গ্রাহকের সঙ্গে সময় ঠিক করে ফি নিয়ে পরীক্ষামূলক কাজ করুন; সংবেদনশীল তথ্য ব্যবহার করবেন না।","মূল কেন্দ্র বন্ধ হওয়ার মহড়া দিয়ে দেখুন, অ্যাপ ফের চালু হতে কত সময় লাগে, কতটা ডেটা হারায় আর পুরো মাসের খরচ কত। নিয়মিত চুক্তি পাওয়ার পরই নতুন মডিউলার কেন্দ্রের হিসাব করুন। যন্ত্র কেনার আগে অনুমতি ও জায়গার ঝুঁকিও দেখুন।"]',
  'মহড়ায় ঠিক করা সময়ের মধ্যে অ্যাপ চালু হচ্ছে, গ্রাহক আবার ফি দিচ্ছেন, আর সেই আয় দিয়ে দুই কেন্দ্র ও সাপোর্টের খরচ উঠছে।',
  'নমুনা অ্যাপের জন্য এক পাতার পরিকল্পনা ও মহড়ার খাতা বানান। মূল ও বিকল্প কেন্দ্র, শেষ ব্যাকআপ, কত সময়ে ফের চালুর কথা, বাস্তবে কত সময় লেগেছে, সাপোর্ট ও মাসিক খরচ লিখে রাখুন। আসল গ্রাহকের তথ্য ব্যবহার করবেন না।'
);
