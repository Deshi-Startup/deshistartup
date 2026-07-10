# Bangla Style Guide – বাংলা লেখার নিয়ম

**Status: binding for every Bengali page, UI string, and description on this site.**
Created 2026-07-08 after a language audit found that much of the content read like English
thought translated into Bangla. Amended 2026-07-11 after reader feedback caught the *opposite*
failure on the homepage – Bangla that reads like translated English ad copy (§2.12–2.14).
This guide exists so neither happens again.

Who this is for: every human contributor and every AI agent writing Bengali content here.
Agents: read this file **before** writing or editing any Bangla. The short public version for
contributors lives on the `/contribute` page; this file is the full standard.

**Companion standard:** [`EDITORIAL.md`](./EDITORIAL.md) governs what a page *teaches* and how
(reader model, teaching loop, example policy, stories, actionability). This file governs how the
Bangla *reads*. Both are binding – a page must pass both checklists (§7 here + EDITORIAL.md §12).

---

## 0. The one rule

**If it reads like a translation, it is wrong – even when every word is Bangla.**

The test is not "is this grammatically correct?" It is: *would a smart Bangladeshi founder,
writing a helpful Facebook or LinkedIn post in Dhaka today, ever compose this sentence?*
If not, rewrite it. Correct-but-unnatural is a failure.

Our reader should never be able to smell an English original underneath. The moment they can,
we sound foreign – and this project's entire moat is trust.

There are **two ways to smell the English underneath**, and this file guards against both:

1. **Gazette-Bangla** – translated English *prose*: যদি-chains, verbal nouns, bureaucratic
   passives, এবং-chains (§2.1–2.9, §3.2).
2. **Billboard-Bangla** – translated English *ad copy*: verbless mic-drop fragments, a site that
   narrates itself with coined verbs, machine-confident claims (§2.12–2.14). Fixing the first
   failure by writing ever-punchier fragments produces the second – that is exactly how the
   2026-07 rewrite over-corrected. The target is neither register. It is a person, speaking in
   complete sentences.

**Anchor persona:** an experienced founder explaining things to a younger founder over tea –
expert, direct, warm, zero pretension. Not a government notice (প্রজ্ঞাপন), not a textbook,
not a news-agency wire, not WhatsApp slang.

**Register:** প্রমিত চলিত বাংলা with the "আপনি" form – the register of a good
10 Minute School blog post, a Prothom Alo explainer, or a thoughtful founder's Facebook post.

---

## 1. Think in Bangla – the writing workflow

Translationese is born in the drafting process, so fix the process:

1. **Never draft in English and translate.** Collect facts, numbers, and structure as bullet
   notes (any language). Then close the notes and *compose each paragraph directly in Bangla*.
2. **Say it before you write it.** If a sentence is fighting you, say it out loud the way you
   would explain it to a friend – then write down what you said and clean it up. The spoken
   sentence is almost always the right skeleton.
3. **Back-translation test:** if your Bangla sentence maps word-for-word onto a fluent English
   sentence, be suspicious. Natural Bangla usually *cannot* be reverse-translated one-to-one –
   the information arrives in a different order.
4. **Read-aloud pass:** after finishing a page, read it aloud once. Every place you stumble or
   take a breath mid-clause is a sentence that needs splitting or reordering.

For AI agents specifically: generate the Bangla paragraph, then re-read it asking "which of
these sentences did I actually think in English first?" – rewrite those from scratch rather
than patching words.

---

## 2. Sentence structure – where translations betray themselves

Bad Bangla on this site is rarely a vocabulary problem. It is English *sentence skeletons*
wearing Bangla words. These are the skeletons to break, each with a real before/after:

### 2.1 Conditionals: participles, not যদি-chains

English: "If you want X, then do Y." The natural Bangla conditional is the **-লে** verb form,
not a full যদি…তাহলে frame.

- ❌ যদি আপনি ফান্ডিং তুলতে চান, তাহলে কোম্পানি নিবন্ধন করতে হবে।
- ✅ ফান্ডিং তুলতে চাইলে কোম্পানি রেজিস্ট্রেশন লাগবে।

যদি is fine for emphasis or long conditions – but if most conditionals on a page start with
যদি, the page was thought in English.

### 2.2 "When": -ার সময় / -লে, not যখন…তখন

- ❌ যখন আপনি ট্রেড লাইসেন্স করবেন, তখন এই কাগজগুলো লাগবে।
- ✅ ট্রেড লাইসেন্স করার সময় এই কাগজগুলো লাগবে।

### 2.3 Break relative-clause chains

English stacks "which/that" clauses; Bangla splits into sentences or uses correlatives
(যেসব…সেগুলো, যা…তা, যত…তত).

- ❌ এমন একটি সমস্যা বাছাই করুন যা মানুষ বারবার অনুভব করে এবং যেটি সমাধানের জন্য তারা টাকা দিতে রাজি।
- ✅ এমন সমস্যা ধরুন, যেটায় মানুষ বারবার পড়ে। আর সমাধানের জন্য টাকা দিতেও রাজি থাকে।

The ban is on *stacking*, not on the construction: a single যা/যেটা clause is native and welcome –
"এই সাইট ব্যবহারিক জিনিস আপনাকে দেবে, যা আসলেই কাজে লাগবে।" Avoiding relative clauses entirely is
its own over-correction.

### 2.4 Kill the "X হলো Y" definition reflex

"The goal is… / The problem is… / The difference is…" produces an endless "…হলো…" drumbeat.
State the thing directly, or flip the sentence.

- ❌ এই গাইডের লক্ষ্য হলো আপনাকে পেমেন্ট অপশন মুখস্থ করানো নয়। লক্ষ্য হলো কোন ব্যবসায় কোন পথ যুক্তিযুক্ত তা বোঝানো।
- ✅ এই গাইড আপনাকে পেমেন্ট অপশন মুখস্থ করাবে না। কোন ব্যবসায় কোন পথ কাজ করে, সেটা ধরিয়ে দেবে।

হলো is a normal word – the *reflex* is the problem. One definitional হলো per section is plenty.

### 2.5 Verbs, not verbal nouns

English loves abstract nouns ("confirmation", "implementation", "verification"); Bangla loves
verbs. Nominalized actions are the fastest way to sound like a circular from a ministry.

- ❌ ফোনে অর্ডার নিশ্চিতকরণ জরুরি। | ✅ ফোনে অর্ডারটা কনফার্ম করে নিন।
- ❌ পরিকল্পনার বাস্তবায়ন করুন। | ✅ পরিকল্পনামতো কাজে নামুন।

### 2.6 Active over bureaucratic passive

- ❌ আবেদন করা হয়ে থাকে / প্রদান করা হয় | ✅ আবেদন করেন / দেন

Impersonal passives are fine where the actor truly doesn't matter ("ফি নেওয়া হয়"), but never
as the default voice.

### 2.7 Ration the "-ভাবে" adverbs

Every English "-ly" adverb becoming "-ভাবে" is a classic tell (কার্যকরভাবে, নিয়মিতভাবে,
সঠিকভাবে…). Usually the sentence wants a different verb, or nothing.

- ❌ কুরিয়ার রিপোর্ট নিয়মিতভাবে মিলান। | ✅ কুরিয়ার রিপোর্ট নিয়মিত মিলান।
- ❌ মোটরবাইক আরও কার্যকরভাবে ব্যবহার করা যায় কি না | ✅ মোটরবাইক আরও কাজে লাগানো যায় কি না

### 2.8 Connectives: আর/ও and full stops, not এবং-chains

Written-English rhythm joins clauses with "and"; the audit found **এবং ৪৭৯ বার**. Natural
Bangla uses আর, ও, a comma – or simply ends the sentence and starts a new one. Similarly,
every contrast became কিন্তু (৪২৩ বার against তবে ২১ বার). Mild turns want তবে; many need no
connective at all. Starting a sentence with আর or তাই is perfectly good Bangla.

- ❌ ট্রেড লাইসেন্স করুন এবং ব্যাংক অ্যাকাউন্ট খুলুন এবং হিসাব রাখা শুরু করুন।
- ✅ ট্রেড লাইসেন্স করুন, ব্যাংক অ্যাকাউন্ট খুলুন। আর প্রথম দিন থেকেই হিসাব রাখুন।

### 2.9 Drop what the reader already knows (pro-drop)

English must repeat "it/this/your"; Bangla drops them. Repeated এটি/এটা/সেটি and আপনার in
every sentence mirrors English syntax.

- ❌ এটি আস্থা তৈরি করতে সাহায্য করে, কিন্তু এটি ব্যবসার জন্য ঝুঁকিও তৈরি করে।
- ✅ এতে গ্রাহকের ভরসা বাড়ে ঠিকই, তবে ব্যবসার ঝুঁকিও বাড়ে।

Pro-drop is for flow, **not amputation**. Splitting one thought at a দাঁড়ি and letting the second
sentence dangle without its subject –

- ❌ তাই এই সাইট বিদেশি পরামর্শ কপি করে না। বাংলাদেশে কীভাবে কাজ হয়, সেটা ধরে ব্যাখ্যা করে।

– is an English staccato skeleton with the subject cut off, not pro-drop. Either join the clauses
the Bangla way (…কপি না করে বরং … ব্যাখ্যা করার চেষ্টা করি) or give the second sentence its own
subject. See §2.12–2.13 for the full homepage case.

### 2.10 Rhythm: short sentences, varied length, questions

Translated prose runs at one uniform medium-long sentence length. Human Bangla breathes:
a short sentence lands a point, a longer one explains it, a question pulls the reader in.

- Most sentences under ~১৫-১৮ words; one idea per sentence.
- **Short means a short *complete* sentence, never a verbless stub (§2.12).** A well-jointed
  spoken sentence of ২০ words beats two amputated ones – the limit is breath and parse, not
  word count. And uniform staccato is as much a tell as uniform length: if every sentence is
  punchy-short, the page reads like a drum machine, i.e. like ad copy (§2.12).
- Use direct questions freely – "তাহলে শুরু করবেন কোথা থেকে?" – and answer them.
- Scenario openers are native style: "ধরুন, আপনি চট্টগ্রামে বসে হোমমেড খাবারের পেজ চালান।"
- Discourse markers give the human voice – মানে, আসলে, সোজা কথায়, বাস্তবে, দেখা যায়,
  এক কথায় – use them where they help, without turning the page into chat.

### 2.11 "শুধু X নয়, Y-ও" – once per page, not once per paragraph

"Not only X but also Y" is a fine construction that the current content uses as a crutch.
Same for "X নয়; বরং Y". Vary the rhetoric or state Y plainly.

The same check applies **across pages**. The 2026-07 content grew one mold – "X মানে শুধু Y নয়…" –
opening the সারকথা of eight-plus pages (১৪ uses site-wide). Each instance reads fine alone; a
reader who opens two pages back to back hears a machine. Before publishing, compare your সারকথা's
first sentence against the sibling pages' – same skeleton, recast it. `lint:bangla` flags
"মানে শুধু" twice on one page; the cross-page echo only a human can hear.

### 2.12 The ad-fragment trap – every sentence needs a subject and a predicate

§2.1–2.9 catch translated English *prose*. This catches translated English *advertising* – the
clipped mic-drop rhythm of a billboard, wearing Bangla words. Reader feedback (2026-07-11)
caught it in the homepage hero:

- ❌ দেশি স্টার্টআপ সেই "এখন কী করব?" প্রশ্নের সহজ বাংলা উত্তর সাজায়। অনুপ্রেরণার গল্প নয়, করার মতো কাজ।
- ✅ দেশি স্টার্টআপ সেই "এখন কী করব?" প্রশ্নের উত্তর সহজ বাংলায় আপনার জন্য তুলে ধরে। অর্থাৎ শুধু
  মোটিভেশনাল গল্প নয়, এই সাইট ব্যবহারিক সবকিছু আপনাকে দেবে, যা আসলেই আপনার কাজে লাগবে।

"অনুপ্রেরণার গল্প নয়, করার মতো কাজ।" is "Not inspiration. Action." – a sentence that exists only
in English advertising. The rules:

1. **Every body sentence needs a subject–predicate pair.** A finite verb, or a natural
   zero-copula equation – "ফান্ডিং জ্বালানি, ইঞ্জিন না।" is a full Bangla sentence (subject
   ফান্ডিং, predicate জ্বালানি). What is banned is the *floating fragment with no subject at
   all*, usually a "X নয়, Y।" contrast whose owner went missing.
2. **Fragment license exists only in headings, table cells, and card/UI labels** – never in
   body prose, never in a সারকথা.
3. **Complete the contrast the Bangla way:** অর্থাৎ / বরং / মানে + a subject + a real verb, and
   usually say who it's for (আপনাকে, আপনার কাজে লাগবে). The natural version is *longer* than
   the fragment. That is fine – see §2.10: short means complete-and-short, not amputated.
4. Note the unpacking in the ✅ above: the adjective pile "সহজ বাংলা উত্তর" ("plain-Bangla-answer")
   became "উত্তর সহজ বাংলায় তুলে ধরে". When a noun phrase is doing a whole clause's work,
   unpack it back into a clause – piled-up modifiers are headline compression, another ad habit.

### 2.13 The site speaks as আমরা – self-description needs a human voice

Where the site talks about itself – homepage, about, contribute, hub intros – three tells stack
up fast, and all three come from English marketing copy:

- ❌ তাই এই সাইট বিদেশি পরামর্শ কপি করে না। বাংলাদেশে কীভাবে কাজ হয়, সেটা ধরে ব্যাখ্যা করে।
- ✅ তাই এই সাইটে আমরা সরাসরি বিদেশি পরামর্শ কপি না করে বরং বাংলাদেশে কীভাবে কাজ হয়, সেটা
  ব্যাখ্যা করার চেষ্টা করি।

Everything that changed is a rule:

1. **আমরা exists.** English happily lets an inanimate narrator run a whole page ("this site
   explains…", and the *English mirror may keep that* – this rule is Bangla-specific). In
   Bangla, a page where সাইট/গাইড/পথ performs verb after verb reads like a robot introducing
   itself. People wrote this site; আমরা is the honest, warm register of a Bangla FB/blog post.
   Site-as-subject is fine *in moderation* with verbs a thing can plausibly do – "এই গাইড
   আপনাকে পেমেন্ট অপশন মুখস্থ করাবে না" (§2.4), "এই পথ আপনাকে খালি আইডিয়া থেকে প্রথম যাচাই-করা
   এমভিপি পর্যন্ত নিয়ে যাবে" – the failure is the *whole surface* narrated that way with no
   আমরা anywhere.
2. **Two amputated sentences became one flowing chain** (…না করে বরং… – see §2.9's amputation
   note). Bangla joins contrasting actions with non-finite verbs; English splits them for punch.
3. **The bald claim softened**: ব্যাখ্যা করে → ব্যাখ্যা করার চেষ্টা করি। About our own work,
   modest phrasing (চেষ্টা করি, রাখার চেষ্টা করেছি) is how a trustworthy human writes; bald
   capability statements are machine confidence. Instructions to the *reader* stay direct
   ("ট্রেড লাইসেন্স করুন") – the hedge is for self-claims only, and one চেষ্টা করি per
   paragraph is plenty.
4. **The reader stays in the sentence**: আপনার জন্য, আপনাকে, আপনার কাজে লাগবে। §2.9 bans the
   mechanical *possessive* আপনার echoing English "your" in every noun phrase – it does not ban
   the reader as a person you are talking to. Ad-copy compression deletes the reader; spoken
   Bangla keeps them.
5. Related: the about page's impersonal passives about ourselves ("সূত্র দেওয়া হয়",
   "দেখানো হয়") are §2.6's disease in self-description clothing. Prefer আমরা সূত্র দিই,
   আমরা দেখাই।

### 2.14 Coined collocations – the phone test

Reaching for variety, AI writing coins near-idioms nobody says: উত্তর সাজায়, পথ সাজিয়ে দেয়,
সেটা ধরে ব্যাখ্যা করে। Every word is Bangla; the *combination* is invented – and a native ear
trips on it instantly. The test: **would you say this word-pair on the phone?** If you
hesitate, use the plain verb: তুলে ধরা, দেখানো, বুঝিয়ে বলা, ধরিয়ে দেওয়া, নিয়ে যাওয়া, দেওয়া।

- ❌ এই পথ যোগ্যতা যাচাই থেকে আবেদন ও পিচ পর্যন্ত সাজায়।
- ✅ এই পথ আপনাকে যোগ্যতা যাচাই থেকে আবেদন ও পিচ পর্যন্ত নিয়ে যাবে।

Two refinements:

- The verb itself is usually innocent – সাজানো is perfect for arranging real things (হিসাব
  গুগল শিটে সাজানো, টুলগুলো কাজ অনুযায়ী সাজানো). The misfire is the *abstract* object: an
  answer, a path, a topic being "arranged". Concrete objects, real verbs.
- Watch for **half-remembered idioms**: ধরে ধরে ব্যাখ্যা করা is a real idiom; "সেটা ধরে
  ব্যাখ্যা করে" is its broken half. When a phrase feels *almost* right, recall the full idiom
  or drop it – never publish the fragment of one.

---

## 3. Words and phrases

### 3.1 Calques found on this site – banned, with replacements

| ❌ Never write | ✅ Write instead | Why |
|---|---|---|
| ব্যবসা-থেকে-ব্যবসা | বিটুবি (B2B) | Nobody says the literal phrase; founders say বিটুবি |
| ক্রয়াদেশ | পারচেজ অর্ডার (PO) | Real-world term; ক্রয়াদেশ is gazette language |
| গ্রাহক অর্জন / অধিগ্রহণ | গ্রাহক পাওয়া / কাস্টমার আনা | "Customer acquisition" calque |
| রূপান্তর (conversion অর্থে) | কনভার্শন | রূপান্তর reads as "transformation" |
| নিশ্চিতকরণ | কনফার্ম করা / কনফার্মেশন | Nominalized calque |
| গ্রাহকদের শিক্ষিত করা | গ্রাহককে শেখানো / অভ্যস্ত করা | "Educate the customer" calque |
| শক্ত/দুর্বল সংকেত | শক্ত প্রমাণ / দুর্বল লক্ষণ | "Strong/weak signal" calque |
| পুনরাবৃত্তিযোগ্য মডেল | যে মডেল বারবার খাটানো যায় | "-যোগ্য" stack = MT smell |
| উচ্চ ঝুঁকির অর্ডার | ঝুঁকি বেশি এমন অর্ডার / সন্দেহজনক অর্ডার | "High-risk" calque |
| আইনগত পথনির্দেশনা | আইনি রোডম্যাপ / আইনি প্রস্তুতি | Stiff + calque |
| যাত্রা (journey-এর বাংলা হিসেবে সর্বত্র) | পথ / ধাপ / অভিজ্ঞতা – বা বাদ | Startup-blog cliché |
| গেম চেঞ্জার-জাতীয় রূপক অনুবাদ | বাংলায় ভাবা বাক্য | Idioms never translate |
| খোলা জ্ঞানভাণ্ডার / খোলা প্রজেক্ট | উন্মুক্ত জ্ঞানভাণ্ডার / ওপেন-সোর্স প্রজেক্ট | Adjectival "open" calque – nobody says খোলা জ্ঞানভাণ্ডার (reader feedback, 2026-07-10) |

### 3.2 Formality downshift – same meaning, human word

Sanskritized officialese reads as সরকারি নোটিশ. Default to the everyday word:

| দাপ্তরিক | মানুষের ভাষা |
|---|---|
| প্রদান করা | দেওয়া |
| গ্রহণ করা | নেওয়া |
| সম্পন্ন করা | শেষ করা / সেরে ফেলা |
| প্রয়োজন হবে | লাগবে |
| ব্যতীত | ছাড়া |
| সহায়তা | সাহায্য |
| অবহিত করা | জানানো |
| উক্ত / উল্লিখিত | ওই / সেই |
| বিদ্যমান | আছে / চালু |
| অতিরিক্তভাবে / অধিকন্তু / উপরন্তু | তাছাড়া / আর / সঙ্গে |
| যাইহোক (however অর্থে) | তবে / কিন্তু |
| সুতরাং | তাই |
| কথোপকথন | আলাপ / কথাবার্তা |
| সাক্ষাৎকার (customer interview অর্থে) | গ্রাহকের সঙ্গে আলাপ / ইন্টারভিউ |
| জরিপ | সার্ভে (জরিপ চলবে, মেশাবেন না) |
| ক্ষেত্রে (in case of-এর প্রতিফলন) | বেলায় / হলে / দরকারে – বা বাক্য ভাঙুন |

Words like আস্থা, সহযোগিতা, প্রতিষ্ঠান are correct Bangla – the rule is not "ban Sanskrit",
it is "don't pick the ceremonial word when the everyday one carries the meaning."
ভরসা/বিশ্বাস beat আস্থা in explanatory prose; আস্থা is fine in a heading.

### 3.3 Ration "গুরুত্বপূর্ণ"

The audit found it ৬০ বার. "Important" is English filler; Bangla says *why it matters*:
জরুরি, দরকারি, কাজে লাগবে, না জানলে পরে ঠকবেন, আগে এটা না করলে পরেরটা আটকে যাবে।
Maximum once or twice per page.

### 3.4 English loanwords – keep them, spell them in Bangla script

Founders live in a mixed vocabulary; pretending otherwise creates gazette-Bangla. Policy:

1. **Established startup/business/legal terms stay, written in Bangla script:**
   স্টার্টআপ, ফাউন্ডার, কো-ফাউন্ডার, ইনভেস্টর, ফান্ডিং, পিচ, পিচ ডেক, ইকুইটি, মার্কেটিং,
   ব্র্যান্ড, কাস্টমার, ডেলিভারি, কুরিয়ার, রিটার্ন, রিফান্ড, ক্যাশ, বুস্ট, পেজ, ইনবক্স,
   অ্যাপ, ওয়েবসাইট, সফটওয়্যার, এমভিপি, ভ্যাট, টিআইএন, বিআইএন, বিটুবি, বিটুসি, সিওডি,
   এজেন্সি, মার্জিন, স্কেল, টিম, ডেমো, পাইলট, মিটিং, টার্গেট, বাজেট।
2. **Explain a term the first time a beginner meets it:**
   "টার্ম শিট (term sheet) মানে বিনিয়োগের মূল শর্তগুলোর খসড়া।" Explain once, then use freely.
3. **Latin script is reserved for:** metric/document acronyms that are written that way in real
   life (MRR, CAC, LTV, SaaS, e-TIN, RJSC, NBR, PO), form/portal names, and non-Bangla brand
   names. Bangladeshi brands use their Bangla marks: বিকাশ, নগদ, রকেট, উপায়, পাঠাও, দারাজ।
4. **Never leave an ordinary English word untransliterated mid-sentence.**
   ❌ "আপনার business model-এ এই বিষয়টির প্রভাব কী?" ✅ "আপনার বিজনেস মডেলে এর প্রভাব কী?"
   Full Banglish sentences in Latin script are equally banned – this is a Bangla site.
5. **English noun + Bangla verb is native grammar** – ফোকাস করুন, ট্র্যাক করুন, স্কেল করা,
   লঞ্চ করা – but if a common Bangla verb exists, prefer it (শুরু করুন, not স্টার্ট করুন).
6. **ফাউন্ডার vs প্রতিষ্ঠাতা:** default to ফাউন্ডার/কো-ফাউন্ডার in guides (it is what the
   audience says); প্রতিষ্ঠাতা is fine in case-study/legal/formal sentences. Never flip-flop
   within a page. উদ্যোক্তা is excellent Bangla – use it freely for "entrepreneur".

### 3.5 Bangladeshi Bangla, not Kolkata Bangla, not Hindi

- পানি (never জল), গোসল, মোবাইল ব্যাংকিং, ব্যাংক (never ব্যাঙ্ক)।
- Watch for MT contamination: stray Devanagari vowel signs (the audit found "লॉজিস্টিকস"),
  Hindi word order, or West-Bengal vocabulary. If a sentence came from a translator tool,
  rewrite it from scratch.

---

## 4. Grammar, spelling, punctuation, numbers

### 4.1 Classifiers: let টা breathe

The site currently forces the formal টি everywhere (গাইডটি, সমস্যাটি, পাতাটি). In explanatory
prose, natural writing leans on **টা**: ব্যাপারটা, কাজটা, প্রশ্নটা, হিসাবটা। Rule of thumb:

- Body prose, examples, questions to the reader → টা is the default and welcome.
- Headings, table cells, counting (৩টি ধাপ), legal/compliance sentences → টি is fine.
- Never mix mechanically; read the sentence aloud and take the one your mouth chose.

### 4.2 Spelling: Bangla Academy প্রমিত বানান

- Non-tatsama words take হ্রস্ব ই/উ: সরকারি, কোম্পানি, বাড়ি, দেশি, বিদেশি, ইংরেজি, শ্রেণি, পাখি।
- অ্যা for the English /æ/ sound: অ্যাপ, অ্যাকাউন্ট, ম্যানেজার, ক্যাশ, ব্যাংক।
- Consistent transliterations across the site: রেজিস্ট্রেশন, লাইসেন্স, ইনভয়েস, অ্যাকাউন্ট্যান্ট,
  ক্যাটাগরি, প্ল্যাটফর্ম, ক্যাম্পেইন। When in doubt, follow Prothom Alo's spelling.
- ও-কার for unambiguity where প্রমিত allows: করবো/করব – pick **করব, হলো, বলা হলো** style
  (Prothom Alo convention) and stay consistent.

### 4.3 Punctuation

- Sentences end with দাঁড়ি (।), questions with ?, both are Bangla.
- **No semicolons in Bangla prose.** A semicolon almost always marks an English compound
  sentence – split it into two sentences.
- **The em dash (—) is banned in all content, both locales** – titles, prose, frontmatter
  descriptions, table cells. `lint:bangla` flags it as a hard (✖) finding. Where a dash is
  genuinely needed, use a spaced en dash (" – "), at most one per paragraph – and prefer a
  comma, a colon, or two sentences over any dash. Never a bare hyphen as a dash.
- Don't import English comma habits (comma after every fronted phrase, Oxford lists).
  Bangla commas mark breath and clause breaks, not grammar rules.
- Quotation marks "…" for speech and titles are fine; single quotes rarely.

### 4.4 Numbers, money, dates

- Bengali numerals in Bangla prose: ৫০০ টাকা, ধাপ ৩, ২০২৬ সাল। (% symbol allowed in tables;
  in prose prefer "১৫ শতাংশ" or "ভ্যাট ১৫%" where compact.)
- Money in টাকা uses লাখ/কোটি – ৫ লাখ টাকা, ২ কোটি টাকা। Never মিলিয়ন for BDT.
  Foreign currency may use মিলিয়ন/বিলিয়ন as the news does: "১০ মিলিয়ন ডলার"।
- Year-stamp every fee/number: "২০২৬ সালের হিসাবে ফি ৩,০০০ টাকা।" (existing rule, unchanged)
- Dates in prose: "৮ জুলাই ২০২৬" বা "২০২৬ সালের জুলাই মাসে"।

---

## 5. Bangladesh texture – write from inside the country

Generic sentences localize nothing. Ground every page in the reader's actual world:

- **Name real things:** বিকাশ/নগদ, ফেসবুক পেজ, মেসেঞ্জার ইনবক্স, হোয়াটসঅ্যাপ, দারাজ,
  পাঠাও/স্টেডফাস্ট/রেডএক্স কুরিয়ার, সিটি করপোরেশন, ইউনিয়ন পরিষদ, আরজেএসসি, এনবিআর।
- **Use the pain vocabulary founders actually use:** ঝামেলা, ভোগান্তি, হয়রানি, দৌড়াদৌড়ি,
  ঘোরাঘুরি, টাকা আটকে যাওয়া, খাতা-কলমে হিসাব, হাতে-কলমে, মুখে মুখে প্রচার (word of mouth)।
- **Bangladeshi examples:** names (রাহিম, সুমাইয়া, তানভীর), cities beyond Dhaka (চট্টগ্রাম,
  খুলনা, সিলেট, রাজশাহী, বগুড়া), real business types (কাপড়ের পেজ, হোমমেড ফুড, কোচিং সেন্টার,
  এগ্রো ফার্ম), real seasons (রোজা-ঈদের সিজন, বৈশাখ, শীতের মেলা, পরীক্ষার মৌসুম)।
- **Respect the constraint reality** – COD-first buyers, Facebook-first selling, family
  pressure, low trust – without cynicism, and never normalize ঘুষ/speed money (existing rule).

---

## 6. Page-type notes

- **Guides:** সারকথা block in fully spoken register – it is the most-read paragraph on the
  page. Tables may be terse (fragments fine in cells). Checklists start with a verb:
  "লিখেছি", "ঠিক করেছি" (past-done form reads as a real checklist).
- **Case studies:** slightly more journalistic, still চলিত। Attribute naturally:
  "Future Startup-কে দেওয়া সাক্ষাৎকারে ইলিয়াস বলেন…", never "তিনি উদ্ধৃত হয়েছেন যে…"।
- **UI strings / nav labels:** short, verb-first, warm ("পড়ুন", "ভুল জানান", "লেখা বাকি")।
- **English mirrors:** natural English, no Bangla left behind; do not translate Bangla
  sentence-by-sentence either – same think-in-the-language rule applies.

---

## 7. Pre-publish checklist (run on every Bangla page)

- [ ] জোরে পড়েছি – কোথাও হোঁচট খাইনি, শ্বাস আটকায়নি
- [ ] কোনো বাক্য ইংরেজিতে হুবহু ফেরত-অনুবাদ করলে নিখুঁত ইংরেজি হয় না (ইংরেজি ছায়া নেই)
- [ ] যদি…তাহলে / যখন…তখন-এর জায়গায় যেখানে সম্ভব -লে / -ার সময়
- [ ] সেমিকোলন নেই; ২০ শব্দের বেশি লম্বা বাক্য ভেঙেছি
- [ ] এম-ড্যাশ (—) নেই, দরকারে স্পেসসহ এন-ড্যাশ ( – ), অনুচ্ছেদে বড়জোর একটা
- [ ] এবং / এটি / গুরুত্বপূর্ণ / "-ভাবে" – প্রতিটির ব্যবহার হাতে গোনা
- [ ] "X হলো Y" আর "শুধু X নয়, Y-ও" – পাতাজুড়ে একবার-দুইবারের বেশি নয়
- [ ] ইংরেজি টার্ম নীতিমতো: বাংলা হরফে, প্রথমবারে ব্যাখ্যা, ব্র্যান্ড নাম ঠিক
- [ ] মাঝবাক্যে ল্যাটিন হরফে সাধারণ ইংরেজি শব্দ নেই
- [ ] বাংলা সংখ্যা, টাকা লাখ/কোটিতে, ফি-তে সাল-স্ট্যাম্প
- [ ] উদাহরণ, নাম, জায়গা, সিজন – সব বাংলাদেশি
- [ ] অন্তত একটা সরাসরি প্রশ্ন বা "ধরুন…" দৃশ্য আছে (গাইড হলে)
- [ ] প্রতিটি বাক্যে কর্তা-বিধেয় আছে – ভার্বহীন বিজ্ঞাপনী খণ্ডবাক্য শুধু হেডিং/কার্ডে (§2.12)
- [ ] সাইট নিজের কথা বললে "আমরা" আছে, নিজের দাবি নরম (চেষ্টা করি), পাঠক বাক্যে হাজির (§2.13)
- [ ] বানানো কোলোকেশন নেই – ফোন-টেস্টে আটকায় এমন শব্দজোড় বদলেছি (§2.14)
- [ ] সারকথার প্রথম বাক্য পাশের পাতাগুলোর ছাঁচে ফেলা নয় (§2.11)

Mechanical sweep for reviewers and agents – run `npm run lint:bangla`
(`scripts/bangla-lint.mjs`), which flags: banned calques (§3.1), officialese (§3.2),
em dashes anywhere in the file (hard ✖, §4.3), semicolons in Bangla text, Latin-script
English words mid-sentence, Devanagari characters, এবং/এটি/গুরুত্বপূর্ণ/-ভাবে density,
English digits in Bangla prose, known coined collocations (§2.14), and the "মানে শুধু"
mold when it repeats within a page (§2.11). It also scans the Bangla strings in
`app/components/WikiLanding.jsx` and `app/nav.config.js` – the homepage copy lives outside
`app/(contents)/` and used to escape every sweep, which is exactly where the 2026-07-11
findings hid. The linter is advisory – it catches the mechanical tells; the read-aloud test
catches the rest.

---

## 8. A worked example (from this site's own audit)

**Before (real, 2026-07 audit):**

> সঠিক পেমেন্ট ব্যবস্থা বেছে নেওয়া শুধু টেকনিক্যাল কাজ নয়; এটি গ্রাহকের আস্থা, নগদ টাকা,
> হিসাব এবং ডেলিভারি ঝুঁকির সঙ্গে জড়িত।

Every word is Bangla; the skeleton is English ("Choosing the right payment system is not just
a technical task; it is tied to…"). Semicolon, এটি, এবং-list – all imported.

**After:**

> পেমেন্ট কীভাবে নেবেন, এটা শুধু টেকনিক্যাল সিদ্ধান্ত না। গ্রাহক আপনাকে কতটা ভরসা করবে,
> হাতে ক্যাশ কখন আসবে, হিসাব মিলবে কি না – অনেক কিছু নির্ভর করছে এর ওপর।

Same information. But this one was *thought in Bangla* – the reader hears a person, not a
translator.

A second worked pair – the 2026-07-11 homepage feedback that reads like translated *ad copy*
rather than translated prose – is annotated inside §2.12 and §2.13. Between the two examples:
the first failure sounds like a ministry, the second like a billboard. Both get rewritten the
same way – say it out loud to a friend, then write down what you said.
