# Bangla naturalness audit – billboard-Bangla sweep (2026-07-11)

**Trigger:** reader feedback (Shamir, 2026-07-11) caught two unnatural sentences in the homepage
hero – Bangla that reads like translated English *ad copy* (verbless mic-drop fragments, the site
narrating itself with a coined verb, no আমরা, bald claims). This is the mirror-image failure of
the 2026-07-08 audit (which caught translated *officialese*), and it came from over-applying that
first audit's "short sentences" rule.

**Standard:** the rules extracted from this feedback are binding in STYLE.md §2.12 (ad
fragments), §2.13 (আমরা-voice for self-description), §2.14 (coined collocations / phone test),
plus amendments to §0, §2.3, §2.9, §2.10, §2.11 and the §7 checklist. `lint:bangla` also
scans `app/components/WikiLanding.jsx` and `app/nav.config.js` – the homepage strings lived
outside `app/(contents)/` and had escaped every sweep, which is exactly where the worst copy hid.

**Scope:** all 68 written Bangla surfaces (67 pages + homepage component) read in full or
sampled. Verdict: **guide bodies largely healthy** – the disease concentrated in the
*promotional register* (hero copy, সারকথা blurbs, self-description pages).

Both passes below are done; the watch-list at the end is what a future editor should keep an
ear on.

## Pass 1 – reader-flagged surfaces (2026-07-11, commit 19d75ab)

| Where | What |
|---|---|
| `WikiLanding.jsx` bn `lead` | Reader's own rewrite applied (spelling normalised: ব্যবহারিক, দেবে): সাজায় → তুলে ধরে; the verbless "অনুপ্রেরণার গল্প নয়, করার মতো কাজ।" completed with অর্থাৎ + subject + verb + reader |
| `WikiLanding.jsx` bn `lead2` | Reader's rewrite applied: two amputated sentences joined (…কপি না করে বরং…), আমরা introduced, claim softened to চেষ্টা করি |
| `WikiLanding.jsx` bn `notice` | Same defect two lines below (subject-less stub "আইনি বা কর পরামর্শ নয়।") – joined into flowing sentences. Not part of the reader's explicit fix – veto if unwanted |
| 5 journey সারকথা closers | "এই পথ … সাজায় / সাজিয়ে দেয়" → "এই পথ আপনাকে … পর্যন্ত নিয়ে যাবে" (hire-first-employee, apply-to-an-accelerator, accept-digital-payments, launch-a-saas; register-a-private-limited-company got "…ধরে ধরে দেখাবে") |
| `scripts/bangla-lint.mjs` | New soft checks: coined collocations (§2.14), "মানে শুধু" >1×/page (§2.11); scans WikiLanding.jsx + nav.config.js |

## Pass 2 – backlog execution (2026-07-11, same day)

### About page: passives → আমরা-voice (`(bn)/about/page.mdx`)

- সারকথা: "অবদানকারীরা গাইড লেখেন… সরকারি উৎসে মেলানো হয়" → "গাইডগুলো লিখি ও হালনাগাদ রাখি
  আমরা – কমিউনিটির অবদানকারীরা। … সরকারি উৎসে মিলিয়ে নেওয়ার চেষ্টা করি।"
- "কারা লেখেন" section: "…অবদানকারীরা লেখেন, ভুল ধরেন এবং সূত্র যোগ করেন। … দেখানো হয়" →
  "আমরা – ফাউন্ডার, শিক্ষার্থী, পেশাজীবী, বিষয় জানা মানুষ – মিলে লিখি, ভুল ধরি, সূত্র যোগ
  করি। … রক্ষণাবেক্ষণকারী হিসেবে থাকে **দেশি স্টার্টআপের অবদানকারীরা**।"
- Sourcing section: "…তারিখ দেওয়া হয়। গুরুত্বপূর্ণ দাবির সূত্র … রাখা হয়। … লেখা হয় না।" →
  "…তারিখ দিই। বড় দাবির সূত্র রাখি লেখার কাছেই। আর … অনুমানকে সত্যের মতো করে লিখি না।"
  (also retires a গুরুত্বপূর্ণ)
- Publishing section: "…ঝুঁকি দেখা হয়" → "দেখে নিই"; "…আলাদা করে দেখানো হয়" → "দেখাই"
- Mission line: "এক জায়গায় সাজানোই লক্ষ্য" → "এক জায়গায় গুছিয়ে রাখাই লক্ষ্য" (গোছানো is the
  native collocation for this)

### "মানে শুধু X নয়" dedupe – six openers recast, each with a *different* device

| Page | Before → After (device) |
|---|---|
| `customers` | "গ্রাহক খোঁজা মানে শুধু বিজ্ঞাপন চালানো না।" → "গ্রাহক পাওয়ার কাজ বিজ্ঞাপন চালানোর অনেক আগে শুরু হয়।" (reframe-timeline; avoids echoing the page's own "বুস্ট দিলেই বিক্রি হয় না") |
| `founder-life` | "উদ্যোক্তা হওয়া মানে শুধু 'মালিক' হওয়া না।" → "ব্যবসার 'মালিক' হলে বুঝি শুধু হুকুম চালাতে হয়?" (rhetorical question) |
| `phase-four` | "ধাপ ৪ মানে শুধু দ্রুত বড় হওয়া না। মানে এমন প্রতিষ্ঠান…" → "ধাপ ৪-এ কাজ একটাই: এমন প্রতিষ্ঠান… শুধু দ্রুত বড় হওয়া এই ধাপের লক্ষ্য না।" (positive-first; kills both মানে-s, clears the linter flag) |
| `journeys/start-an-online-business` | "অনলাইন ব্যবসা মানে শুধু একটি ফেসবুক পেজ নয় –" → "একটা ফেসবুক পেজ দিয়ে শুরুটা হয়, কিন্তু ব্যবসাটা দাঁড়ায় … মিলে।" (concession; also retires an abstract "সাজাতে হয়") |
| `journeys/accept-digital-payments` | "…মানে শুধু একটা গেটওয়ে বসানো নয় –" → "অনেকে ভাবেন একটা গেটওয়ে বসালেই পেমেন্ট নেওয়ার কাজ শেষ। বাস্তবে…" (misconception opener) |
| `journeys/register-a-private-limited-company` | "…মানে শুধু RJSC-তে নাম তোলা নয় –" → "RJSC-তে নাম তোলা কোম্পানি খোলার একটা ধাপ মাত্র। এর আগে-পরে আছে…" (reframe-as-one-step) |

**Deliberately kept** (the correction is the page's core insight, and three across the site is
rationed): `payments` ("পেমেন্ট মানে শুধু কার্ড না"), `registration` ("নিবন্ধন মানে শুধু RJSC-তে
কোম্পানি খোলা না"), `start-here`'s softer variant ("ব্যবসা শুরু মানে প্রথম দিনেই কোম্পানি খুলে
ফেলা না"), `idea-validation`'s definitional pair (wrong-definition → right-definition is the
move there), plus mid-body uses that earn their spot (`phase-four` L72 "ব্র্যান্ড মানে শুধু লোগো
না", `journeys/apply-to-an-accelerator` "ভালো আবেদন মানে শুধু ফর্ম পূরণ নয়").

### One-off translationese survivals

| Page | Before → After |
|---|---|
| `journeys` index | "এই পথগুলো ঠিক সেই কাজটা করে:" (English cleft) → "এই পথগুলো বানানোই হয়েছে সেই প্রশ্নের জন্য: প্রতিটি পথ … ভাগ করে, আর প্রতিটি ধাপে সাইটের সবচেয়ে প্রাসঙ্গিক গাইডটা ধরিয়ে দেয়।" |
| `idea-validation` সারকথা | "একটি সাধারণ ও খরুচে ভুল" (adjective-pair calque) → "খুব চেনা ভুল – আর এই ভুলের দাম বেশ চড়া" |
| `contribute` | dangling fronted list → "হোক সেটা লাইসেন্স করার অভিজ্ঞতা, …, কিংবা নেহাত একটা ভুল বানান – আপনি যা জানেন, সেটাই কারও না কারও কাজে লাগবে।" |
| `journeys/hire-first-employee` সারকথা | choppy joint → "'কর্মী', 'ফ্রিল্যান্সার' বা 'ইন্টার্ন' – নাম যেটাই দিন, সম্পর্কটা বিচার হবে আসল কাজের ধরন আর শ্রম আইনের নিয়মে।" |

## Watch-list (reviewed, intentionally unchanged)

- `WikiLanding.jsx` bn `bandBody`: five short sentences in a row – but each is complete and the
  anaphora ("নিয়ম বদলায়, ফি বদলায়…") is native rhetoric, not ad-fragment. Left as is.
- `WikiLanding.jsx` en strings: "this site…" as narrator is natural *English*; en mirrors were
  not sentence-matched to the bn recasts (meaning parity holds, which is the mirror rule).
- Case studies (`pathao`) and phase hubs: healthy on this axis.

## Natural patterns worth reusing (found during the sweep)

- Journey closer: "এই পথ আপনাকে [শুরু] থেকে [শেষ] পর্যন্ত নিয়ে যাবে।"
- Site-as-subject done right: "এই গাইড আপনাকে পেমেন্ট অপশন মুখস্থ করাবে না। … ধরিয়ে দেবে।"
- Playful self-description: "এই সাইট উপন্যাস না যে প্রথম পাতা থেকে পড়তে হবে।",
  "সাইটটাকে ফার্মেসির তাক ভাবুন।" (founder-path-chooser)
- Zero-copula equations (legit – don't "fix" into fragment-panic): "ফান্ডিং জ্বালানি, ইঞ্জিন না।"
