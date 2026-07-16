# Bangla Style Guide – বাংলা লেখার নিয়ম

**Status: binding for every Bengali page, UI string, and description on this site.**
It guards against the two ways Bangla can betray an English original: translated English *prose*
(§2.1–2.9) and translated English *ad copy* – punchy but hollow (§2.12–2.14). Correct-but-foreign
is a failure either way. This guide exists so neither happens.

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
   failure by writing ever-punchier fragments produces the second – that is the over-correction
   trap. The target is neither register. It is a person, speaking in complete sentences.

**Anchor persona:** an experienced founder explaining things to a younger founder over tea –
expert, direct, warm, zero pretension. Not a government notice (প্রজ্ঞাপন), not a textbook,
not a news-agency wire, not WhatsApp slang.

**Register:** প্রমিত চলিত বাংলা with the "আপনি" form – the register of a good
10 Minute School blog post, a Prothom Alo explainer, or a thoughtful founder's Facebook post.

---

## 0.1 How to use this guide – read it in this order

This file is mostly a list of things *not* to do (§2, §3.1–3.3). That list is a **checklist for a
finished draft – not a way to compose one.** If you write while dodging tells, you produce careful,
hyper-corrected prose, and careful prose is exactly what sounds translated. That is the trap the whole
site keeps falling into: the linter goes green, the Bangla still smells of English.

So compose in the opposite order:

1. **Soak in the target first** – §1 (the gold standard) and §3.6–§3.10 (the native repertoire:
   particles, openers, native verbs, idioms). Write *from* these – imitate the exemplars, reach for the
   phrases. Fluency comes from copying good Bangla, not from avoiding bad Bangla.
2. **Then draft**, out loud, in Bangla (§1 workflow).
3. **Only then** run the §2/§3 prohibitions and the §7 checklist over the draft to catch what slipped.

The two gates, in order of authority: **`/bangla-review`** (a native reader – the real test) >
**read-aloud** (§1, §7) > **`npm run lint:bangla`** (the mechanical floor; passing it proves nothing
about fluency – the whole 454-page corpus passed it while still reading translated).

---

## 1. Write from Bangla – the gold standard, then the workflow

Before any rule, the target. These are real paragraphs from this site's best page (the unit economics
guide). Do not study them for rules – study them for *texture*. This is what "thought in Bangla" sounds
like, and matching this feel is the whole job.

**Gold standard 1 – a guide opening (teaches, and sounds spoken):**

> ধরুন, রাহিম চট্টগ্রামে বসে ফেসবুক পেজে কাপড় বেচেন। ৮০০ টাকায় কেনা একটা জামা ১,২০০ টাকায় বিক্রি হলো।
> লাভ ৪০০ টাকা, তাই তো? … মাস শেষে অথচ ব্যাংকে কিছু জমে না, বরং কমে। অঙ্কটা কোথায় ফাঁকি দিল?

Why it lands: **তাই তো?** pulls the reader in mid-thought; **অঙ্কটা কোথায় ফাঁকি দিল?** is a question a
person asks out loud, not a heading; **বরং** turns the sentence the Bangla way; the rhythm goes
short–long–short. Nothing here reverse-translates into one clean English sentence – the mark of Bangla
that was thought, not converted.

**Gold standard 2 – a claim rewritten from its English skeleton (STYLE §8):**

> পেমেন্ট কীভাবে নেবেন, এটা শুধু টেকনিক্যাল সিদ্ধান্ত না। গ্রাহক আপনাকে কতটা ভরসা করবে, হাতে ক্যাশ কখন
> আসবে, হিসাব মিলবে কি না – অনেক কিছু নির্ভর করছে এর ওপর।

Why it lands: the topic is **fronted** ("পেমেন্ট কীভাবে নেবেন,") and the verb trails – English order is
gone. It leans on native phrases (**ভরসা করা, হিসাব মেলা, হাতে ক্যাশ আসা**), not calques (আস্থা,
নগদ প্রবাহ). Try to reverse-translate it 1:1 into English – you can't. That failure is the goal.

When a sentence is fighting you, stop editing it and ask: *how would I say this to রাহিম over tea?*
Say that sentence out loud, write down what you said, clean it up. That is the method – the rules below
only tell you what went wrong when you skipped it.

### 1.1 The workflow

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

## 3.6 The native repertoire – reach *for* these

§2 and §3.1–3.3 tell you what to avoid. This is the opposite: the bank of native material you compose
*from*. When a sentence reads flat-but-correct, the fix is almost always to reach into this repertoire,
not to scrub another tell. Soak in these before drafting (§0.1).

### 3.6 Discourse particles – the fastest route to a spoken voice

These little words carry no information; they carry *voice*. Translationese has none of them. A person
drops two or three into a paragraph without thinking, and their absence is exactly why correct Bangla
can still read like a manual.

| শব্দ | কী করে | উদাহরণ |
|---|---|---|
| তো | ধরে-নেওয়া বা মৃদু বৈপরীত্য নরম করে | দাম তো বাড়বেই, এতে নতুন কিছু নেই। |
| আসলে | আসল কথায় ফেরায় ("actually") | আসলে সমস্যাটা দামে না, ভরসায়। |
| বরং | ভালো পথে মোড় ঘোরায় | ধার করবেন না, বরং আগে বিক্রি বাড়ান। |
| মানে | খুলে বলে ("so / meaning") | মানে, হাতে থাকল মোটে ১৬০ টাকা। |
| নাকি | দাবিকে সত্যিকারের প্রশ্নে বদলায় | গ্রাহক সত্যিই কিনবে, নাকি শুধু বলছে? |
| দেখুন / খেয়াল করুন | মনোযোগ টানে | দেখুন, হিসাবটা আসলে সোজা। |
| তাই তো? / না? | পাঠকের সায় টানে | লাভ ৪০০ টাকা, তাই তো? |
| বটে | এক পয়েন্ট মেনে নেয় | কথাটা কঠিন বটে, তবু সত্যি। |
| কিনা | ভেতরে দুশ্চিন্তা গুঁজে দেয় | পোষাচ্ছে কিনা, সেটাই আসল প্রশ্ন। |
| এমনকি | বাজি বাড়ায় | এমনকি একটা ফেরত অর্ডারও পুরো মুনাফা খেয়ে ফেলে। |

Register: these belong in body prose, questions, and the সারকথা – never in headings or table cells.
Two per paragraph is plenty. A page where *every* sentence has a তো has tipped into chat (§2.10), which
is its own tell. Season, don't drown.

### 3.7 Openers – beyond ধরুন

The ধরুন-opener is native and welcome, but when every section starts with ধরুন the reader hears a
template. Keep ধরুন for its real job – flagging a *hypothetical* (EDITORIAL §3's honesty rule) – and
rotate these for ordinary framing:

- **ব্যাপারটা এমন,** … (before an explanation)
- **কথা হলো,** … (getting to the point)
- **একটু ভাবুন তো,** … (inviting the reader to reason)
- **খেয়াল করুন,** … (pointing at a detail)
- **সমস্যাটা এখানেই।** (naming the crux)
- **মজার ব্যাপার কী জানেন?** … (setting up a surprise)
- **হিসাবটা কষে দেখুন,** … (before an arithmetic walk-through)
- **শুরুতেই একটা কথা,** … (an upfront caveat)

Rule: ধরুন / মনে করুন / ধরা যাক always announce "this is imagined, not a fact." Never spend that signal
on generic framing – if you open with ধরুন, a hypothetical example must actually follow.

### 3.8 Consequence-pivots – retire "আপনার জন্য এর মানে"

EDITORIAL §5 rightly asks you to turn every rule into "so what does this mean for me?" The *move* is
essential. The *frozen phrase* "আপনার জন্য এর মানে…" is not – it is a loan-translation of "what this
means for you," and repeated on every page it becomes a tic (the linter now flags it past once). Keep
the move, rotate the words:

- **তাহলে দাঁড়াল,** …
- **এবার আসল কথায় আসি।** …
- **এতে আপনার লাভ-লোকসান কোথায়?** …
- **সোজা কথায়,** …
- **মোদ্দা কথা,** …
- **এর ফল হাতে-নাতে:** …
- **মানে, বাস্তবে কী দাঁড়ায়?** …
- **তাহলে এখন কী?** …

### 3.9 Native commerce vocabulary – the Bangla-first bank

This is where "Bangla-first" bites hardest. Founders have their *own* words for these things; using the
abstract calque instead is what makes a page sound foreign. Prefer the native phrase whenever both exist.

| ❌ পাণ্ডিত্যের/অনুবাদের শব্দ | ✅ ফাউন্ডারের মুখের শব্দ |
|---|---|
| নগদ প্রবাহে সমস্যা | টাকা আটকে যাওয়া |
| হিসাব সমন্বয় করা | হিসাব মেলানো |
| বকেয়া জমা হওয়া | বাকি পড়া |
| ক্ষতি স্বীকার করা | লস গোনা / গচ্চা দেওয়া |
| মূলধন বিনিয়োগ করা | পুঁজি খাটানো |
| নিজস্ব তহবিল | গাঁটের পয়সা |
| দক্ষতা অর্জন করা | হাত পাকানো |
| প্রক্রিয়াগত ঝামেলা | দৌড়াদৌড়ি / দৌড়ঝাঁপ |
| মৌখিক প্রচার | মুখে মুখে প্রচার |
| মুনাফা কমে যাওয়া | লাভের গুড় কমে যাওয়া |

Bangla also *verbs* English nouns and shortens things naturally – use the forms founders actually say,
kept light for the explainer register: বুস্ট দেওয়া, ইনবক্সে নক করা, পেজ চালানো, অর্ডার কনফার্ম করা,
ক্যাশে/বাকিতে বেচা, সিওডি-তে পাঠানো। (The very short slang forms – ফেবু, নক দে – read as chat; keep
the guide to ফেসবুক, বুস্ট, ইনবক্স and save the shortest forms for quoted speech.)

People and places have native words too: শরিক (business partner), মহাজন (wholesaler-financier),
আড়ত (wholesale depot), ফড়িয়া (middleman-trader), দালাল (broker – carries a negative edge, use knowingly).

### 3.10 The idiom shelf – whole, never coined, never half

One right idiom does a paragraph's work and tells the reader you are one of them. But idioms are the
most dangerous tool here, because AI writing *coins* them (§2.14): every word Bangla, the combination
invented, and a native ear trips on the spot. Three iron rules:

1. **Never coin one.** If people don't already say it, it isn't an idiom – it's a mistake in idiom's
   clothing.
2. **Use the whole thing.** "ধরে ধরে ব্যাখ্যা করা" is real; "সেটা ধরে ব্যাখ্যা করে" is its broken half.
   Recall the full idiom or drop it.
3. **One per section, and only when it fits the point exactly.** An idiom as decoration is worse than none.

A safe, business-relevant shelf (meaning → where it fits):

| প্রবাদ / বাগধারা | মানে → কোথায় খাটে |
|---|---|
| লাভের গুড় পিঁপড়ায় খায় | লুকোনো খরচ মুনাফা খেয়ে ফেলে → ইউনিট ইকোনমিক্স, সিওডি, ফি |
| যত গর্জে তত বর্ষে না | হাঁকডাক বেশি, কাজ কম → ভ্যানিটি মেট্রিক, হাইপ |
| ঝোপ বুঝে কোপ মারা | সঠিক সময়ে হাত দেওয়া → টাইমিং, দাম, ফান্ডিং |
| বেশি লোভে তাঁতি নষ্ট | লোভে কারিগর ডোবে → বেহিসেবি স্কেল, বেশি ডিসকাউন্ট |
| নুন আনতে পান্তা ফুরায় | হাতে জমা নেই → পাতলা ক্যাশ, রানওয়ে নেই |
| আগে দর্শনধারী, পরে গুণবিচারী | আগে চোখে পড়া, পরে গুণ → ব্র্যান্ডিং, প্যাকেজিং, পিচ |
| অল্প বিদ্যা ভয়ংকরী | আধা জ্ঞান বিপজ্জনক → আধা-যাচাই, কপি-করা পরামর্শ |

When in doubt, skip the idiom and say it plainly. A clean plain sentence always beats a wrong idiom.

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
- [ ] অন্তত কয়েকটা কথ্য কণা (তো/আসলে/বরং/মানে/নাকি) আর একটা নেটিভ ক্রিয়া-বাগধারা আছে (§3.6, §3.9)
- [ ] "আপনার জন্য এর মানে" ছাঁচ নয় – পরিণতি-বাক্য রোটেট করেছি (§3.8)
- [ ] বাক্যের দৈর্ঘ্য বৈচিত্র্যময় – একটানা লম্বা (অনুবাদ) বা একটানা খাটো (বিজ্ঞাপন) নয় (§2.10)
- [ ] **`/bangla-review` চালিয়েছি** – নেটিভ-রিডারের চোখে ইংরেজি-গন্ধ থাকা বাক্য নেই

The gate, in order: **`/bangla-review`** (a native reader, in Claude Code – catches architecture-level
translationese regex can't see; `.claude/commands/bangla-review.md`) > **read-aloud** (§1, §7) >
**`npm run lint:bangla`**. Passing the linter is necessary, never sufficient – the whole 454-page
corpus passed it while still reading translated.

Mechanical sweep for reviewers and agents – run `npm run lint:bangla`
(`scripts/bangla-lint.mjs`), which flags: banned calques (§3.1), officialese incl. রয়েছে/সংশ্লিষ্ট/
প্রেক্ষিতে (§3.2), formal suffixes -সমূহ / -ীকরণ (§4.1, §2.5), em dashes anywhere in the file
(hard ✖, §4.3), semicolons in Bangla text, Latin-script English words mid-sentence, Devanagari
characters, এবং/এটি/গুরুত্বপূর্ণ/-ভাবে/আপনার density, English digits in Bangla prose, known coined
collocations (§2.14), self-description tics (চেষ্টা করি, "আপনার জন্য এর মানে" mold, §2.13/§3.8),
sentence-rhythm (over-long or drum-machine-uniform sentences, §2.10), and the "মানে শুধু" mold when it
repeats within a page (§2.11). It also scans the Bangla strings in `app/components/WikiLanding.jsx` and
`app/nav.config.js`. The linter is the mechanical floor only; `/bangla-review` and the read-aloud test
catch the architecture-level translationese it never can.

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
