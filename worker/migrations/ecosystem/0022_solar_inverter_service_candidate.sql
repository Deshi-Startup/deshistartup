-- Editorial candidate from an accepted submission. This does not publish it or
-- link private contributor records. Prepare a reviewed public release separately.

UPDATE problem_text SET
  title = 'Rooftop solar systems need reliable care',
  summary = 'Dirty panels or broken equipment can cut the power a solar system makes. Someone needs to find the cause and fix it.',
  customer = 'Owners of commercial rooftop solar systems and the companies that install them.',
  context = 'IEEFA points to problems with solar upkeep. CPD describes missed checks and early inverter failures in some older Dhaka systems. This does not prove people will pay for a new repair service. Some firms already offer upkeep. Low power can also be caused by dirty panels, a power cut or faulty wiring.',
  unknown = 'When an installer or warranty team is slow to help, who would pay someone else to find the fault? Would that fee cover parts, travel and follow-up visits?'
WHERE problem_id = 'solar-maintenance' AND locale = 'en';

UPDATE problem_text SET
  title = 'ছাদের সোলার নিয়মিত দেখভাল করা দরকার',
  summary = 'প্যানেলে ময়লা জমলে বা যন্ত্র নষ্ট হলে সোলার থেকে কম বিদ্যুৎ পাওয়া যায়। কী সমস্যা হয়েছে, সেটা বুঝে ঠিক করার লোক দরকার।',
  customer = 'বাণিজ্যিক ভবনের সোলারের মালিক আর যেসব কোম্পানি সেগুলো বসিয়েছে।',
  context = 'সোলার দেখভালে সমস্যা হতে পারে বলে IEEFA জানিয়েছে। CPD-ও ঢাকার পুরোনো কিছু সোলার সিস্টেমে পরীক্ষা বাদ পড়া আর ইনভার্টার নষ্ট হওয়ার কথা লিখেছে। তবে নতুন সার্ভিসের জন্য কেউ ফি দেবেন কি না, তা জানা যায় না। কিছু কোম্পানি আগে থেকেই এই কাজ করে। বিদ্যুৎ কম পেলেই ইনভার্টার নষ্ট ধরে নেবেন না। প্যানেলে ময়লা, বিদ্যুৎ চলে যাওয়া বা তারের সমস্যাও থাকতে পারে।',
  unknown = 'ইনস্টলার বা ওয়ারেন্টির সেবা পেতে দেরি হলে অন্য কাউকে দিয়ে সমস্যা খোঁজানোর ফি কে দেবেন? পার্টস, যাতায়াত আর আবার যাওয়ার খরচ কি সেই আয় থেকে উঠবে?'
WHERE problem_id = 'solar-maintenance' AND locale = 'bn';

UPDATE problems SET sources_json = json_insert(sources_json,
  '$[#]', json('{"title":"CPD · Rooftop solar programme briefing","url":"https://cpd.org.bd/resources/2025/07/CPD_Briefing_on_National_Rooftop_Project.pdf","date":"July 2025","en":"CPD reports missed upkeep and early equipment failures in some older Dhaka rooftop systems. It does not show whether businesses would pay for a new inverter service.","bn":"ঢাকার পুরোনো কিছু ছাদসোলার সিস্টেমে ঠিকমতো দেখভাল না করা আর যন্ত্র নষ্ট হওয়ার কথা CPD লিখেছে। নতুন ইনভার্টার সার্ভিসের জন্য কেউ ফি দেবেন কি না, তা এই রিপোর্টে জানা যায় না।"}'),
  '$[#]', json('{"title":"SREDA · Approved three-phase inverters","url":"https://nsrra.sreda.gov.bd/solar/nem/gti3ph/index.php","date":"Checked 23 September 2026","en":"SREDA lists inverter models approved for net metering. A replacement must also meet the rules for the site and power company.","bn":"নেট মিটারিংয়ের জন্য কোন ইনভার্টার মডেল অনুমোদিত, তা SREDA-র তালিকায় আছে। বদলানোর আগে ভবনের ব্যবস্থা আর বিদ্যুৎ কোম্পানির নিয়মও মিলিয়ে নিতে হবে।"}'),
  '$[#]', json('{"title":"SREDA · Net Metering Guidelines 2025","url":"https://solar.sreda.gov.bd/doc/Net%20Metering%20Guidelines-2025.pdf","date":"2025","en":"These rules cover solar inverters connected to the power grid. Check any replacement with the installer and power company.","bn":"বিদ্যুতের গ্রিডে যুক্ত সোলার ইনভার্টারের নিয়ম এখানে আছে। বদলানোর আগে ইনস্টলার আর বিদ্যুৎ কোম্পানির সঙ্গে মিলিয়ে নিন।"}'),
  '$[#]', json('{"title":"SEDCOL · Solar operations and maintenance","url":"https://www.solarland.com.bd/capabilities/om/","date":"Checked 23 September 2026","en":"SEDCOL says it checks inverters and fixes solar system faults. This is the company’s own description, not proof of its market share or service quality.","bn":"SEDCOL বলছে, তারা ইনভার্টার পরীক্ষা করে আর সোলারের সমস্যা ঠিক করে। এটা কোম্পানির নিজের কথা। তাদের সেবার মান বা বাজারে কতটা কাজ করছে, তা এখানে যাচাই করা যায় না।"}')),
  revision = revision + 1
WHERE id = 'solar-maintenance';

INSERT INTO approaches (id, problem_id, kind, position, added_at, guides_json)
VALUES ('solar-inverter-repair', 'solar-maintenance', 'service', '1', '2026-09-23',
  '["validation/customer-interviews","validation/demand-without-building","metrics/unit-economics"]');

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'en',
  'Help fix rooftop solar inverter faults',
  'Help installers find inverter faults, then arrange an approved repair or replacement when needed.',
  'An inverter turns power from solar panels into the kind a building can use. Work with rooftop solar installers in one area. When a customer reports a problem, a qualified technician checks if the inverter is really the cause. Check its model and warranty before working with the installer or maker on a repair or replacement. Some solar firms already do this. Find out if they need extra help before building a business around it.',
  'Before a visit, agree whether the installer or building owner pays to find the fault. Price repair or replacement separately. Offer regular support only if repeat jobs pay enough.',
  '["Talk to five solar installers about recent inverter problems. Ask what went wrong, how long help took, who paid and how it ended. Would they send this work to someone else?","Offer a paid fault check with a qualified solar technician. Follow site safety and warranty rules. Arrange repairs through the installer or a service team approved by the maker. Check the rules for connecting solar to the power grid before replacing an inverter.","Track five paid jobs from the first call to the fix. Count technician time, parts, travel and return visits. Ask whether installers would send more jobs at a price that covers all of this."]',
  'Installers keep sending paid jobs, and the fees cover the full cost of each job.',
  'Make a simple job sheet for the inverter model, reported problem, warranty, technician time, parts, price and result. Try it with sample cases. Do not connect it to live electrical equipment.'
);

INSERT INTO approach_text (approach_id, locale, title, summary, description, business_model, steps_json, signal, prototype) VALUES (
  'solar-inverter-repair', 'bn',
  'ছাদের সোলার ইনভার্টার ঠিক করার সেবা দিন',
  'ইনস্টলারকে ইনভার্টারের সমস্যা খুঁজতে সাহায্য করুন। দরকার হলে নিয়ম মেনে মেরামত বা বদলের ব্যবস্থা করুন।',
  'প্যানেল থেকে পাওয়া বিদ্যুৎ যেন ভবনে ব্যবহার করা যায়, ইনভার্টার সেই কাজ করে। শুরুতে এক এলাকার সোলার বসানো কোম্পানিগুলোর সঙ্গে কাজ করুন। কোনো সমস্যা হলে দক্ষ টেকনিশিয়ান দেখে নেবেন, দোষটা সত্যিই ইনভার্টারের কি না। এরপর মডেল আর ওয়ারেন্টি দেখে ইনস্টলার বা যন্ত্রটি বানানো কোম্পানির সঙ্গে ঠিক করুন কী করতে হবে। কিছু সোলার কোম্পানি আগেই এই কাজ করে। তাদের বাড়তি সাহায্য দরকার কি না, আগে জেনে নিন।',
  'কাজে যাওয়ার আগে ঠিক করুন, সমস্যা খোঁজার ফি ইনস্টলার দেবেন, নাকি ভবনের মালিক। মেরামত বা যন্ত্র বদলের দাম আলাদা করে বলুন। বারবার কাজ পেলে আর খরচ উঠলে তবেই নিয়মিত সাপোর্টের কথা ভাবুন।',
  '["পাঁচটি সোলার বসানো কোম্পানির সঙ্গে কথা বলুন। সাম্প্রতিক ইনভার্টার সমস্যায় কী হয়েছিল, সাহায্য পেতে কত সময় লেগেছিল, কে টাকা দিয়েছেন আর শেষে কী হয়েছে, জেনে নিন। এমন কাজ তাঁরা বাইরে কাউকে দেবেন কি না, সেটাও জিজ্ঞেস করুন।","দক্ষ সোলার টেকনিশিয়ানকে সঙ্গে নিয়ে ফি দিয়ে সমস্যা পরীক্ষা করার প্রস্তাব দিন। ভবনের নিরাপত্তা আর ওয়ারেন্টির নিয়ম মেনে চলুন। ইনস্টলার বা যন্ত্র প্রস্তুতকারকের অনুমোদিত সার্ভিস টিমের মাধ্যমেই মেরামত করান। ইনভার্টার বদলালে গ্রিডে যুক্ত সোলারের বর্তমান নিয়ম দেখে নিন।","ফি নিয়েছেন এমন পাঁচটি কাজের প্রথম ফোন থেকে সমাধান পর্যন্ত সময় আর খরচ লিখে রাখুন। টেকনিশিয়ান, পার্টস, যাতায়াত আর আবার যাওয়ার খরচও ধরুন। এই দামে আরও কাজ পাওয়া যাবে কি না, ইনস্টলারদের জিজ্ঞেস করুন।"]',
  'ইনস্টলাররা আবার কাজ পাঠাচ্ছেন, আর প্রতিটি কাজের আয় থেকে পুরো খরচ উঠে আসছে।',
  'ইনভার্টারের মডেল, সমস্যা, ওয়ারেন্টি, টেকনিশিয়ানের সময়, পার্টস, দাম আর ফল লেখার সহজ খাতা বানান। নমুনা তথ্য দিয়ে পরীক্ষা করুন। চালু বৈদ্যুতিক যন্ত্রের সঙ্গে যুক্ত করবেন না।'
);
