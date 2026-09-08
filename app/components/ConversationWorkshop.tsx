import './DemandTest.css'

const workshops = {
  en: {
    interview: {
      label: 'Practise following the evidence',
      file: 'deshi-startup-interview-notes.txt',
      worksheet: `CUSTOMER INTERVIEW NOTES — DESHI STARTUP

Purpose of this conversation:
Respondent code (avoid personal details):
Date and relevant role:
Permission to take notes / quote / follow up (record separately):

Recent event described:
What they actually did:
Current alternative and what works well:
Time or money mentioned (exact, estimate, or unknown):
Direct quote (only if permitted):
My interpretation (separate from the quote):
Evidence against my assumption:
What I forgot to ask or still do not know:
Next question and why it matters:
Agreed follow-up, owner, and date:

REVIEW ACROSS CONVERSATIONS
Who did I invite, who replied, and who did I actually interview?
Which observations repeat, among which people?
Which observations conflict?
What cannot be inferred from this sample?
What bounded test should come next, if any?

Unknown is not zero. An interview is not proof of demand.
Do not copy confidential records into this worksheet.
https://deshistartup.com/en/validation/interview-scripts
`,
      cases: [
        {
          title: '1. A vague complaint',
          situation: 'A training-centre manager says, “Scheduling takes forever.” Choose your next question.',
          options: [
            ['So you need automated reminders?', 'That suggests your solution before you know what took time. You could miss an issue with staffing or approvals that reminders would not solve.'],
            ['Could you describe the most recent schedule change?', 'Start here. Ask what happened, which steps took time, and what they did next. If they cannot recall an example, record that uncertainty rather than inventing a number.'],
            ['Would you say it wastes at least five hours a week?', 'The proposed number can steer the answer. First ask how they know the time involved and whether they can recall a particular instance. An estimate should remain labelled as an estimate.']
          ]
        },
        {
          title: '2. The current solution works',
          situation: 'Another manager says, “Our shared calendar works well. We rarely need to call anyone.”',
          options: [
            ['Explain why your app would be better.', 'That turns discovery into a pitch and discourages evidence that challenges your idea. Understand the current arrangement first.'],
            ['Ask what makes the calendar work well for their team.', 'Useful. Learn what they value and when, if ever, it falls short. A satisfactory alternative is evidence to retain. This person does not need to become a prospect.'],
            ['Give them a low score and discard the notes.', 'Their experience may explain why your assumption applies only to some teams. Keep the observation and identify what differs rather than throwing it away.']
          ]
        },
        {
          title: '3. A question was not answered',
          situation: 'You did not ask who approves software purchases. Your notes have no answer about the decision-maker.',
          options: [
            ['Record that the manager has no buying authority.', 'You do not know that. Missing evidence and evidence of no authority are different.'],
            ['Assume the manager can approve it because they seemed enthusiastic.', 'Enthusiasm does not establish authority. Keep the unknown visible.'],
            ['Write “not asked” and plan a relevant follow-up.', 'Yes. Record the gap honestly. If a later sales discussion is appropriate, ask how a purchase like this would be evaluated and approved.']
          ]
        }
      ]
    },
    sales: {
      label: 'Practise a first sales conversation',
      file: 'deshi-startup-sales-conversation.txt',
      worksheet: `FIRST SALES CONVERSATION — DESHI STARTUP

Who I am speaking with and why this offer may fit:
What exists today:
What is not available yet:
Scope, price, timing, and material conditions I can stand behind:
What I need to learn about the customer's current approach:

OPEN
Hi [name], I'm [name] from [business]. We offer [specific offer].
You mentioned [relevant context]. Would you like a short explanation?

UNDERSTAND
How are you handling [task] today?
What would need to change for a different approach to be worthwhile?

EXPLAIN
For [price], we can provide [scope] by [time].
This includes [items] and does not include [limits].
Does that address the part you described?

AGREE A NEXT STEP
Would [specific demonstration or next step] be useful?
Who would need to be involved, and what time would work?
It's fine if this is not a fit.

RECORD AFTERWARD
What they said / asked:
What I promised (only promises I can deliver):
What remains unanswered and who will check:
Next action, owner, and date:
Permission and agreed timing for follow-up:
Outcome: declined / no reply / next step agreed / completed purchase / other

A demo agreement is not a sale. Do not invent customer results or scarcity.
Replace every bracket, check the facts, and respect a request to stop.
https://deshistartup.com/en/customers/whatsapp-messenger-sales
`,
      cases: [
        {
          title: '1. “Send me the price.”',
          situation: 'Someone asks what your scheduling service costs. You have a defined price and scope.',
          options: [
            ['Hide the price until they agree to a call.', 'They asked a direct question. Give the price and what it covers, then ask only what you need to check fit.'],
            ['State the price, scope, and any material conditions.', 'A useful answer lets them judge the offer. If pricing depends on scope, explain that dependency and ask the specific missing question.'],
            ['Say the price doubles tomorrow, although it does not.', 'That would invent urgency. Use only real, relevant conditions.']
          ]
        },
        {
          title: '2. “That costs more than we expected.”',
          situation: 'The prospect has seen the scope and price but says it is too expensive.',
          options: [
            ['Immediately promise a large discount.', 'First understand the concern. A discount changes the economics and may not address a mismatch in scope, timing, or usefulness.'],
            ['Ask which part of the offer or budget does not fit.', 'This helps you understand the objection. You can discuss a genuinely smaller scope if you can deliver it, or accept that the offer is not a fit.'],
            ['Promise that the service will pay for itself in a week.', 'Do not promise a result you cannot substantiate. Explain what you can deliver and what remains uncertain.']
          ]
        },
        {
          title: '3. “Please do not message me again.”',
          situation: 'The person clearly declines further contact.',
          options: [
            ['Send one final promotion anyway.', 'They have already made the boundary clear. Another promotion ignores it.'],
            ['Stop promotional follow-up and record the request.', 'Respect the request. Mark the contact so you do not restart the same approach later. Keep only the record needed to honour that preference.'],
            ['Ask a teammate to contact them instead.', 'Changing the sender does not change the request. Do not route around it.']
          ]
        }
      ]
    }
  },
  bn: {
    interview: {
      label: 'প্রমাণ যাচাইয়ের অনুশীলন করুন',
      file: 'deshi-startup-interview-notes.txt',
      worksheet: `কাস্টমার ইন্টারভিউ নোটস – দেশি স্টার্টআপ

এই আলাপের উদ্দেশ্য:
অংশগ্রহণকারীর কোড (ব্যক্তিগত তথ্য পরিহার করুন):
তারিখ এবং সংশ্লিষ্ট ভূমিকা:
নোট নেওয়া / উদ্ধৃতি ব্যবহার / পরবর্তীতে যোগাযোগের অনুমতি (আলাদা করে লিখে রাখুন):

বর্ণিত সাম্প্রতিক ঘটনা:
তাঁরা বাস্তবে যা করেছিলেন:
বর্তমান বিকল্প এবং এর কোন দিকটি ভালো কাজ করে:
সময় বা টাকার উল্লেখ (সঠিক পরিমাণ, আনুমানিক, বা অজানা):
সরাসরি উদ্ধৃতি (কেবলমাত্র অনুমতি থাকলে):
আমার বিশ্লেষণ (উদ্ধৃতি থেকে আলাদা রাখুন):
আমার ধারণার বিপক্ষ প্রমাণ:
যা জিজ্ঞাসা করতে ভুলে গেছি বা এখনও জানি না:
পরবর্তী প্রশ্ন এবং এটি কেন গুরুত্বপূর্ণ:
পরবর্তীতে যোগাযোগের বিষয়ে সম্মতি, দায়িত্বপ্রাপ্ত ব্যক্তি এবং তারিখ:

একাধিক আলাপের তুলনামূলক পর্যালোচনা
কাকে আমন্ত্রণ জানিয়েছিলাম, কে উত্তর দিয়েছেন, এবং বাস্তবে কার ইন্টারভিউ নিয়েছি?
কোন পর্যবেক্ষণগুলো বারবার উঠে এসেছে এবং কাদের ক্ষেত্রে?
কোন পর্যবেক্ষণগুলোর মধ্যে বৈপরীত্য রয়েছে?
এই নমুনা থেকে কী উপসংহার টানা সম্ভব নয়?
এর পরে কোন সুনির্দিষ্ট টেস্টটি করা উচিত (যদি থাকে)?

অজানা মানেই শূন্য নয়। একটি ইন্টারভিউ চাহিদার প্রমাণ নয়।
গোপনীয় তথ্য এই ওয়ার্কশিটে কপি করবেন না।
https://deshistartup.com/validation/interview-scripts
`,
      cases: [
        {
          title: '১. অস্পষ্ট অভিযোগ',
          situation: 'একজন ট্রেনিং-সেন্টার ম্যানেজার বললেন, “শিডিউল করতে অনেক সময় লেগে যায়।” আপনার পরবর্তী প্রশ্নটি বেছে নিন।',
          options: [
            ['তাহলে আপনার কি অটোমেটেড রিমাইন্ডার প্রয়োজন?', 'এর মাধ্যমে আপনি মূল সমস্যাটি না জেনেই নিজের সমাধানের প্রস্তাব দিয়ে ফেলছেন। হতে পারে সমস্যাটি লোকবল বা অনুমোদনের, যা রিমাইন্ডার দিয়ে সমাধান হবে না।'],
            ['সবশেষ শিডিউল পরিবর্তনের কথাটি কি একটু খুলে বলবেন?', 'এখান থেকেই শুরু করুন। কী ঘটেছিল, কোন ধাপে সময় লেগেছিল এবং এরপর তাঁরা কী করেছিলেন তা জানতে চান। যদি তাঁরা নির্দিষ্ট কোনো উদাহরণ মনে করতে না পারেন, তবে কোনো কাল্পনিক সংখ্যা না বসিয়ে সেই অনিশ্চয়তাটিই লিখে রাখুন।'],
            ['আপনার কি মনে হয় এতে সপ্তাহে অন্তত পাঁচ ঘণ্টা নষ্ট হয়?', 'এভাবে কোনো নির্দিষ্ট সংখ্যা বলে দিলে উত্তরটি প্রভাবিত হতে পারে। প্রথমে জানতে চান যে তাঁরা কীভাবে এই সময়ের হিসাব পেলেন এবং নির্দিষ্ট কোনো ঘটনা মনে করতে পারেন কি না। আনুমানিক হিসাবকে সবসময় আনুমানিক হিসেবেই চিহ্নিত করা উচিত।']
          ]
        },
        {
          title: '২. বর্তমান সমাধানটি ভালো কাজ করছে',
          situation: 'আরেকজন ম্যানেজার বললেন, “আমাদের শেয়ার করা ক্যালেন্ডারটি বেশ ভালোই কাজ করছে। কাউকে কল করার প্রয়োজন খুব একটা হয় না।”',
          options: [
            ['আপনার অ্যাপটি কেন আরও ভালো হবে তা বুঝিয়ে বলুন।', 'এর ফলে এটি আর ডিসকভারি থাকে না, বরং বিক্রির চেষ্টায় পরিণত হয় এবং এটি আপনার ধারণার বিপক্ষ প্রমাণগুলোকে নিরুৎসাহিত করে। প্রথমে তাদের বর্তমান অবস্থাটি বোঝার চেষ্টা করুন।'],
            ['ক্যালেন্ডারটি কেন তাদের জন্য ভালো কাজ করছে তা জানতে চান।', 'এটি কার্যকর। তাঁরা কোন বিষয়টিকে গুরুত্ব দেয় এবং এর কোনো সীমাবদ্ধতা আছে কি না, তা বোঝার চেষ্টা করুন। একটি সন্তোষজনক বিকল্পও একটি গুরুত্বপূর্ণ প্রমাণ। এই ব্যক্তিকে সম্ভাব্য ক্রেতা হতেই হবে, এমন কোনো কথা নেই।'],
            ['তাঁদেরকে কম স্কোর দিয়ে নোটগুলো বাতিল করে দিন।', 'তাদের অভিজ্ঞতা হয়তো বলে দিচ্ছে কেন আপনার ধারণাটি কেবল নির্দিষ্ট কিছু দলের ক্ষেত্রে প্রযোজ্য। নোটগুলো বাতিল না করে বরং পার্থক্যগুলো খুঁজে বের করুন।']
          ]
        },
        {
          title: '৩. একটি প্রশ্নের উত্তর পাওয়া যায়নি',
          situation: 'সফটওয়্যার কেনার অনুমোদন কে দেন, তা আপনি জিজ্ঞাসা করতে ভুলে গেছেন। সিদ্ধান্ত গ্রহণকারীর ব্যাপারে আপনার নোটে কোনো উত্তর নেই।',
          options: [
            ['লিখে রাখুন যে ম্যানেজারের কেনার কোনো ক্ষমতা নেই।', 'আপনি আসলে সেটি জানেন না। প্রমাণ না থাকা আর ক্ষমতা না থাকার প্রমাণ এক জিনিস নয়।'],
            ['যেহেতু তাকে বেশ আগ্রহী মনে হচ্ছিল, ধরে নিন তিনি নিজেই অনুমোদন দিতে পারবেন।', 'আগ্রহ থাকা মানেই ক্ষমতা থাকা নয়। অজানা বিষয়টিকে অজানাই রাখুন।'],
            ['লিখে রাখুন “জিজ্ঞাসা করা হয়নি” এবং পরবর্তীতে কীভাবে এর উত্তর পাওয়া যায় তার পরিকল্পনা করুন।', 'হ্যাঁ। এই ঘাটতিটি সততার সাথে লিখে রাখুন। যদি পরবর্তীতে বিক্রয় সংক্রান্ত আলাপ করার সুযোগ আসে, তবে এ ধরনের কেনাকাটা কীভাবে যাচাই ও অনুমোদন করা হয় তা জেনে নিন।']
          ]
        }
      ]
    },
    sales: {
      label: 'প্রথম বিক্রয়ের আলাপ অনুশীলন করুন',
      file: 'deshi-startup-sales-conversation.txt',
      worksheet: `প্রথম সেলস কনভারসেশন – দেশি স্টার্টআপ

যার সাথে কথা বলছি এবং এই অফারটি কেন তার জন্য উপযুক্ত হতে পারে:
বর্তমানে যা আছে:
যেগুলো এখনও দেওয়া সম্ভব নয়:
যে কাজের পরিধি, দাম, সময় এবং শর্তাবলীর প্রতিশ্রুতি আমি রাখতে পারব:
গ্রাহকের বর্তমান কাজ করার পদ্ধতি সম্পর্কে আমার যা জানা প্রয়োজন:

শুরু করা
হ্যালো [নাম], আমি [ব্যবসার নাম] থেকে [নিজের নাম] বলছি। আমরা [সুনির্দিষ্ট অফার] দিয়ে থাকি।
আপনি [সংশ্লিষ্ট প্রেক্ষাপট] উল্লেখ করেছিলেন। আমি কি সংক্ষেপে আমাদের অফারটি সম্পর্কে জানাব?

বোঝার চেষ্টা
বর্তমানে আপনারা [কাজটি] কীভাবে করছেন?
নতুন কোনো পদ্ধতি কার্যকর হতে হলে বর্তমানের কী পরিবর্তন করা প্রয়োজন?

বিস্তারিত জানানো
[দাম]-এর বিনিময়ে, আমরা [সময়]-এর মধ্যে [কাজের পরিধি] সম্পন্ন করতে পারব।
এর মধ্যে [যে বিষয়গুলো অন্তর্ভুক্ত] থাকবে এবং [যেগুলো অন্তর্ভুক্ত নয়] থাকবে না।
আপনি যে সমস্যার কথা বলেছিলেন, এটি কি তার সমাধান করতে পারবে?

পরবর্তী ধাপে সম্মতি
[সুনির্দিষ্ট ডেমো বা পরবর্তী ধাপ] কি আপনার কাজে আসবে?
এর সাথে আর কাদের যুক্ত হওয়া প্রয়োজন এবং কখন সুবিধা হয়?
যদি আপনার মনে হয় এটি উপযুক্ত নয়, তবে কোনো সমস্যা নেই।

পরবর্তীতে লিখে রাখা
তাঁরা যা বলেছেন / জিজ্ঞাসা করেছেন:
আমি যে প্রতিশ্রুতি দিয়েছি (কেবলমাত্র সেই প্রতিশ্রুতি যা আমি পূরণ করতে পারব):
যে উত্তরগুলো এখনও পাওয়া যায়নি এবং কে সেগুলো যাচাই করবেন:
পরবর্তী পদক্ষেপ, দায়িত্বপ্রাপ্ত ব্যক্তি এবং তারিখ:
পরবর্তীতে যোগাযোগের অনুমতি এবং নির্ধারিত সময়:
ফলাফল: প্রত্যাখ্যান করেছেন / উত্তর দেননি / পরবর্তী ধাপে সম্মতি দিয়েছেন / ক্রয় সম্পন্ন করেছেন / অন্যান্য

ডেমোর সম্মতি মানেই বিক্রি নয়। গ্রাহকের কাল্পনিক ফলাফল বা কৃত্রিম সংকট তৈরি করবেন না।
সবগুলো ব্র্যাকেটের অংশ পরিবর্তন করুন, তথ্য যাচাই করুন এবং যোগাযোগের ক্ষেত্রে না-কে সম্মান করুন।
https://deshistartup.com/customers/whatsapp-messenger-sales
`,
      cases: [
        {
          title: '১. “আমাকে দামটা পাঠিয়ে দিন।”',
          situation: 'কেউ একজন আপনার শিডিউলিং সেবার দাম জানতে চাইলেন। আপনার সেবার একটি নির্দিষ্ট দাম এবং কাজের পরিধি রয়েছে।',
          options: [
            ['কলে কথা বলতে রাজি না হওয়া পর্যন্ত দাম গোপন রাখুন।', 'তাঁরা সরাসরি প্রশ্ন করেছেন। দাম এবং এর বিনিময়ে কী পাওয়া যাবে তা জানিয়ে দিন। এরপর কেবল অফারটি তাদের জন্য উপযুক্ত কি না তা যাচাই করার জন্য প্রয়োজনীয় প্রশ্নটি করুন।'],
            ['দাম, কাজের পরিধি এবং অন্যান্য গুরুত্বপূর্ণ শর্তগুলো জানিয়ে দিন।', 'একটি পরিষ্কার উত্তরের মাধ্যমে তাঁরা অফারটি যাচাই করার সুযোগ পাবেন। যদি কাজের পরিধির উপর দাম নির্ভর করে, তবে সেই বিষয়টি বুঝিয়ে বলুন এবং এ সম্পর্কিত সুনির্দিষ্ট প্রশ্নটি করুন।'],
            ['তাদের বলুন যে আগামীকাল দাম দ্বিগুণ হয়ে যাবে, যদিও বাস্তবে এমন কিছু হবে না।', 'এর মাধ্যমে কৃত্রিম তাগিদ তৈরি করা হবে। সবসময় কেবল বাস্তব ও প্রাসঙ্গিক শর্তগুলো ব্যবহার করুন।']
          ]
        },
        {
          title: '২. “এটি আমাদের বাজেটের চেয়ে অনেক বেশি।”',
          situation: 'সম্ভাব্য ক্রেতা কাজের পরিধি এবং দাম দেখার পর জানালেন যে দামটা অনেক বেশি।',
          options: [
            ['সাথে সাথেই বড় অংকের ডিসকাউন্টের প্রতিশ্রুতি দিন।', 'প্রথমে তাদের উদ্বেগের জায়গাটি বোঝার চেষ্টা করুন। ডিসকাউন্ট দিলে অর্থনৈতিক দিকটি পরিবর্তন হয় ঠিকই, কিন্তু এর মাধ্যমে কাজের পরিধি, সময় বা প্রয়োজনীয়তার ঘাটতিগুলো পূরণ নাও হতে পারে।'],
            ['জানতে চান অফার বা বাজেটের কোন অংশটি তাদের সাথে মিলছে না।', 'এটি আপনাকে তাদের আপত্তির জায়গাটি বুঝতে সাহায্য করবে। আপনি চাইলে ছোট পরিসরে কাজ করার প্রস্তাব দিতে পারেন (যদি তা করা সম্ভব হয়), অথবা অফারটি তাদের জন্য উপযুক্ত নয় বলে মেনে নিতে পারেন।'],
            ['প্রতিশ্রুতি দিন যে এক সপ্তাহের মধ্যেই এই সেবার খরচ উঠে আসবে।', 'এমন কোনো প্রতিশ্রুতি দেবেন না যার প্রমাণ আপনার কাছে নেই। আপনি ঠিক কী দিতে পারবেন এবং কোন বিষয়গুলো এখনও অনিশ্চিত, তা বুঝিয়ে বলুন।']
          ]
        },
        {
          title: '৩. “দয়া করে আমাকে আর কোনো মেসেজ পাঠাবেন না।”',
          situation: 'ওই ব্যক্তি স্পষ্টভাবে আর যোগাযোগ করতে বারণ করেছেন।',
          options: [
            ['তবুও শেষবারের মতো একটি প্রোমোশনাল মেসেজ পাঠিয়ে দিন।', 'তাঁরা আগেই তাদের সীমানা স্পষ্ট করে দিয়েছেন। নতুন করে মেসেজ পাঠানোর অর্থ হলো সেই সীমানাকে অসম্মান করা।'],
            ['প্রোমোশনাল মেসেজ পাঠানো বন্ধ করুন এবং তাদের অনুরোধটি লিখে রাখুন।', 'তাদের অনুরোধের প্রতি সম্মান দেখান। কন্ট্যাক্টটি চিহ্নিত করে রাখুন যেন পরবর্তীতে আবার একইভাবে যোগাযোগ করা না হয়। কেবল তাদের এই পছন্দটি মনে রাখার জন্য যতটুকু তথ্য রাখা প্রয়োজন, ততটুকুই রাখুন।'],
            ['আপনার দলের অন্য কাউকে তাদের সাথে যোগাযোগ করতে বলুন।', 'যোগাযোগকারী পরিবর্তন করলেই তাদের অনুরোধ পাল্টে যায় না। বিকল্প উপায়ে যোগাযোগের চেষ্টা করবেন না।']
          ]
        }
      ]
    }
  }
}

export default function ConversationWorkshop({ kind, locale = 'bn' }: { kind: 'interview' | 'sales', locale?: 'bn' | 'en' }) {
  const isEn = locale === 'en'
  const workshopData = workshops[isEn ? 'en' : 'bn']
  const workshop = workshopData[kind]
  return (
    <section aria-label={workshop.label}>
      <div className="demand-practice">
        <p>{isEn ? 'These are fictional practice conversations. Choose an answer to reveal the explanation, then compare the alternatives. There is no score.' : 'এগুলো কাল্পনিক অনুশীলনী। যেকোনো একটি উত্তর বেছে নিয়ে তার ব্যাখ্যা দেখুন এবং অন্যান্য বিকল্পের সাথে তুলনা করুন। এখানে কোনো স্কোর নেই।'}</p>
        {workshop.cases.map(item => (
          <section className="demand-practice__case" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.situation}</p>
            {item.options.map(([answer, feedback]) => (
              <details key={answer}><summary>{answer}</summary><p><strong>{isEn ? 'Why:' : 'কারণ:'}</strong> {feedback}</p></details>
            ))}
          </section>
        ))}
      </div>
      <div className="demand-tool">
        <p>{isEn ? 'Take the worksheet into your next conversation. It is a plain text file you can edit or print.' : 'আপনার পরবর্তী আলাপচারিতায় ওয়ার্কশিটটি সাথে রাখুন। এটি একটি সাধারণ টেক্সট ফাইল যা আপনি এডিট বা প্রিন্ট করতে পারবেন।'}</p>
        <a className="demand-tool__download" download={workshop.file}
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(workshop.worksheet)}`}>
          {isEn
            ? `Download the ${kind === 'interview' ? 'interview notes' : 'sales conversation'} worksheet (.txt)`
            : `${kind === 'interview' ? 'ইন্টারভিউ নোটস' : 'সেলস কনভারসেশন'} ওয়ার্কশিট ডাউনলোড করুন (.txt)`}
        </a>
        <details className="demand-tool__preview"><summary>{isEn ? 'Preview and copy the worksheet' : 'ওয়ার্কশিটটি দেখুন ও কপি করুন'}</summary><pre>{workshop.worksheet}</pre></details>
      </div>
    </section>
  )
}
