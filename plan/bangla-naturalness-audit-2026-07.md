# Bangla naturalness audit – billboard-Bangla sweep (2026-07-11)

**Trigger:** reader feedback (Shamir, 2026-07-11) caught two unnatural sentences in the homepage
hero – Bangla that reads like translated English *ad copy* (verbless mic-drop fragments, the site
narrating itself with a coined verb, no আমরা, bald claims). This is the mirror-image failure of
the 2026-07-08 audit (which caught translated *officialese*), and it came from over-applying that
first audit's "short sentences" rule.

**Standard:** the rules extracted from this feedback are now binding in STYLE.md §2.12 (ad
fragments), §2.13 (আমরা-voice for self-description), §2.14 (coined collocations / phone test),
plus amendments to §0, §2.3, §2.9, §2.10, §2.11 and the §7 checklist. `lint:bangla` now also
scans `app/components/WikiLanding.jsx` and `app/nav.config.js` – the homepage strings lived
outside `app/(contents)/` and had escaped every sweep, which is exactly where the worst copy hid.

**Scope of this audit:** all 68 written Bangla surfaces (67 pages + homepage component) were
read in full or sampled; every hub, the about/contribute pair, the journeys, and representative
guides were read fully. Verdict: **guide bodies are largely healthy** – the disease concentrates
in the *promotional register* (hero copy, সারকথা blurbs, self-description pages), i.e. wherever
the writing was "copy" rather than teaching prose.

## Fixed in this pass (2026-07-11)

| Where | What |
|---|---|
| `app/components/WikiLanding.jsx` bn `lead` | Reader's own rewrite applied (spelling normalised: ব্যবহারিক, দেবে): সাজায় → তুলে ধরে; the verbless "অনুপ্রেরণার গল্প নয়, করার মতো কাজ।" completed with অর্থাৎ + subject + verb + reader |
| `app/components/WikiLanding.jsx` bn `lead2` | Reader's rewrite applied: two amputated sentences joined (…কপি না করে বরং…), আমরা introduced, claim softened to চেষ্টা করি |
| `app/components/WikiLanding.jsx` bn `notice` | Same defect two lines below the flagged ones (subject-less stub "আইনি বা কর পরামর্শ নয়।") – joined into flowing sentences. **Not part of the reader's explicit fix – veto if unwanted** |
| 5 journey সারকথা closers | "এই পথ … সাজায় / সাজিয়ে দেয়" → the sibling pages' natural closer "এই পথ আপনাকে … পর্যন্ত নিয়ে যাবে" (hire-first-employee, apply-to-an-accelerator, accept-digital-payments, launch-a-saas; register-a-private-limited-company got "…ধরে ধরে দেখাবে") |
| `scripts/bangla-lint.mjs` | New soft checks: coined collocations (§2.14), "মানে শুধু" >1×/page (§2.11); scans WikiLanding.jsx + nav.config.js |

## Remaining catalog – the fix-pass backlog

Ordered by priority. Each needs an editor's ear, not a mechanical swap – suggested directions
only. Run per STYLE.md §7 after each fix.

### 1. About page: impersonal passives in self-description (`(bn)/about/page.mdx`)

The page describes *our own* editorial practice in the passive – §2.6's disease wearing
self-description clothes (STYLE.md §2.13 pt 5). The headings say আমরা ("আমরা কী বানাচ্ছি",
"…কীভাবে বাছাই করি") but the body reverts:

- L8 (সারকথা): "আইন, কর, ফি বা নিয়মের তথ্য সরকারি উৎসে মেলানো হয়।" → আমরা … মেলানোর চেষ্টা করি
- L18: "…রক্ষণাবেক্ষণকারী হিসেবে দেখানো হয়।"
- L31: "…সাল বা যাচাইয়ের তারিখ দেওয়া হয়। গুরুত্বপূর্ণ দাবির সূত্র লেখার কাছেই রাখা হয়। … অনুমানকে সত্য হিসেবে লেখা হয় না।"
- L35: "…সম্ভাব্য ক্ষতির ঝুঁকি দেখা হয়।"

Direction: rewrite the editorial-policy sections in আমরা-voice ("আমরা সাল দিই", "আমরা সূত্র
লেখার কাছেই রাখি", "নিশ্চিত না হলে আমরা লিখি না")। This is a register decision for the whole
page – do it as one pass, not sentence-by-sentence patches.

### 2. The "X মানে শুধু Y নয়/না" mold – ১৪ uses, 8+ as the সারকথা opener

Each instance is fine alone; back-to-back pages sound machine-written. Instances opening a
সারকথা (worst offenders):

- `customers` – "গ্রাহক খোঁজা মানে শুধু বিজ্ঞাপন চালানো না।"
- `payments` – "বাংলাদেশে পেমেন্ট মানে শুধু কার্ড না।"
- `registration` – "ব্যবসা নিবন্ধন মানে শুধু RJSC-তে কোম্পানি খোলা না।"
- `founder-life` – "উদ্যোক্তা হওয়া মানে শুধু 'মালিক' হওয়া না।"
- `phase-four` – "ধাপ ৪ মানে শুধু দ্রুত বড় হওয়া না।"
- `journeys/start-an-online-business`, `journeys/accept-digital-payments`,
  `journeys/register-a-private-limited-company` – same skeleton.
- Same-family variants: `idea-validation` ("আইডিয়া যাচাই মানে মানুষকে জিজ্ঞেস করা না…"),
  `start-here` ("ব্যবসা শুরু মানে প্রথম দিনেই কোম্পানি খুলে ফেলা না।")।

Direction: keep the 2–3 where the "not just X" correction genuinely is the page's core insight
(payments and registration earn it); recast the rest with varied openers – a "ধরুন…" scene, a
direct question, the reader's situation, a number. One sweep, all pages in one sitting, so the
variety is real across the site.

### 3. One-off translationese survivals

- `journeys/page.mdx` L10: "এই পথগুলো ঠিক সেই কাজটা করে:" – English cleft ("that's exactly what
  these paths do"). Direction: name the action directly – e.g. "প্রতিটি পথ একটি লক্ষ্যকে কয়েকটি
  ধাপে ভেঙে ধাপে ধাপে সাইটের ঠিক গাইডটা দেখিয়ে দেয়।"
- `idea-validation` L8 (সারকথা): "…একটি সাধারণ ও খরুচে ভুল।" – "a common and costly mistake"
  adjective-pair. Direction: "…খুব চেনা ভুল – আর এই ভুলের দামও চড়া।"
- `contribute` L10: "লাইসেন্স করার অভিজ্ঞতা, কোনো ব্যাংকের সাম্প্রতিক চাহিদা বা একটি ভুল বানান,
  আপনি যা জানেন তা আরেকজনের কাজে লাগতে পারে।" – fronted English "Whether it's X, Y or Z…" list
  left dangling. Direction: "হোক সেটা লাইসেন্স করার অভিজ্ঞতা, কোনো ব্যাংকের হালনাগাদ চাহিদা,
  কিংবা নেহাত একটা ভুল বানান – আপনি যা জানেন, সেটাই আরেকজনের কাজে লাগবে।"
- `journeys/hire-first-employee` L8 (সারকথা): "'কর্মী', 'ফ্রিল্যান্সার' বা 'ইন্টার্ন' শুধু
  সুবিধামতো দেওয়া নাম নয়। আসল কাজের সম্পর্ক ও শ্রম আইনের নিয়মও দেখতে হয়।" – choppy joint
  between the two sentences. Direction: join – "…নাম নয় – নাম যা-ই দিন, সম্পর্কটা বিচার হবে আসল
  কাজ আর শ্রম আইনের নিয়ম দিয়ে।"

### 4. Low priority / watch-list

- `WikiLanding.jsx` bn `bandBody`: five staccato sentences in a row ("নিয়ম বদলায়, ফি বদলায়…") –
  each grammatical, rhythm slightly drum-machine (§2.10). Optional smoothing.
- `WikiLanding.jsx` en `lead` ("…organizes plain answers…"): English tolerates the inanimate
  narrator; mirror meaning still matches the fixed Bangla. No change needed (§2.13 note).
- Case studies (`pathao`) and phase hubs: healthy on this axis; a few গুরুত্বপূর্ণ/এটি counters
  the existing linter already tracks.

## Non-negatives worth keeping (found during the sweep)

Natural patterns already in the corpus – reuse these instead of inventing:

- Journey closer: "এই পথ আপনাকে [শুরু] থেকে [শেষ] পর্যন্ত নিয়ে যাবে।"
- Site-as-subject done right: "এই গাইড আপনাকে পেমেন্ট অপশন মুখস্থ করাবে না। … ধরিয়ে দেবে।"
- Playful self-description: "এই সাইট উপন্যাস না যে প্রথম পাতা থেকে পড়তে হবে।" (founder-path-chooser),
  "সাইটটাকে ফার্মেসির তাক ভাবুন।"
- Zero-copula equations (legit, don't "fix" into fragments-panic): "ফান্ডিং জ্বালানি, ইঞ্জিন না।"
