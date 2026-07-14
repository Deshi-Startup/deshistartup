# অবদান রাখার নিয়ম · Contributing

**বাংলা প্রথম, নিচে ইংরেজি।**

দেশি স্টার্টআপ সবাই মিলে লেখা একটি উন্মুক্ত জ্ঞানভাণ্ডার। ভুল ধরিয়ে দেওয়া থেকে পূর্ণ গাইড লেখা
পর্যন্ত – যেটুকু পারেন, সেটুকুই কাজে লাগবে। শুরু করতে সাইটের
[কীভাবে অবদান রাখবেন](https://deshistartup.com/contribute) পাতাটি পড়ুন। সেখানে ৩টি পথ
ধাপে ধাপে দেখানো আছে। এই ফাইলে একই কথা আরও খুঁটিনাটিসহ দেওয়া আছে।

## ৩টি পথ

1. **ভুল বা পুরোনো তথ্য জানান (২ মিনিট)** – যেকোনো পাতার **"ভুল জানান"** লিংক, বা
   [ইস্যু ফর্ম](https://github.com/Deshi-Startup/deshistartup/issues/new?template=report-mistake.yml)।
   কী ভুল আর সঠিকটা কী (জানলে সূত্রসহ) – এটুকুই যথেষ্ট।
2. **ছোট সংশোধন নিজেই করুন (৫–১০ মিনিট)** – পাতার **"সম্পাদনা"** লিংকে ক্লিক করলে ফাইলটা
   GitHub-এ খুলবে। ঠিক করে **"Propose changes"** চাপুন। ফর্ক-ব্রাঞ্চের ঝামেলা
   GitHub নিজেই সামলাবে। কিছু ইনস্টল করতে হবে না।
3. **একটি "লেখা বাকি" বিষয়ে পূর্ণ গাইড লিখুন** – নিচের নিয়মগুলো দেখুন।

## নতুন গাইড লেখার নিয়ম

1. **বিষয় বেছে নিন:** ["নতুন গাইড" ইস্যুগুলো](https://github.com/Deshi-Startup/deshistartup/issues?q=is%3Aissue+is%3Aopen+label%3A%22নতুন+গাইড%22)
   থেকে, বা [কনটেন্ট ব্যাকলগ](./plan/content-backlog.csv) থেকে যেকোনো "লেখা বাকি"
   বিষয়। কোনটা আগে দরকার, ব্যাকলগেই লেখা আছে। ইস্যুতে **"আমি লিখছি"** মন্তব্য করুন, যাতে
   দুজন একই বিষয়ে কাজ না করেন।
2. **অনুমান নয়, রিসার্চ:** সরকারি পোর্টাল, আইনের মূল লেখা আর
   [সোর্স রেজিস্ট্রি](./plan/sources.csv) ধরে লিখুন। যেটা নিশ্চিত নন, সেটা বাদ দিন। লিখতেই
   হলে "যাচাই প্রয়োজন" বলে দিন।
3. **কাঠামো:** স্টাব পাতার শুরুর `<StubNotice ... />` লাইনটি **শুধু পূর্ণ গাইড শেষ হলে** মুছবেন –
   ওই এক লাইন মুছলেই পাতাটা সব জায়গায় (মেনু, ব্যাজ, সার্চ) "লেখা শেষ" হয়ে যায়। গাইডের ছাঁচ:

   ```text
   # শিরোনাম

   > **সারকথা:** ৩–৪ লাইনে পুরো বিষয়ের নির্যাস।

   ## কার কখন দরকার
   ## ধাপে ধাপে কী করবেন
   ## খরচ ও সময় (সাল উল্লেখ করুন)
   ## সাধারণ ভুল
   ## প্রাসঙ্গিক সূত্র (সরকারি লিংক আগে)
   ```

4. **ভাষা ও শেখানোর মান:** [STYLE.md](./STYLE.md) (বাংলায় ভেবে বাংলায় লিখুন – অনুবাদ নয়) আর
   [EDITORIAL.md](./EDITORIAL.md) (প্রতিটি কঠিন ধারণা: নাম → সহজ সংজ্ঞা → দেশি উদাহরণ → টাকার
   হিসাব → আপনার জন্য এর মানে কী)। কেমন লেখা চাই, তা দেখতে
   [/start-here](https://deshistartup.com/start-here) পাতাটি পড়ুন।
5. **বাংলা আগে, ইংরেজি পরে:** বাংলা পাতাই মূল (`app/(contents)/(bn)/<slug>/page.mdx`)। পারলে
   একই PR-এ ইংরেজি মিরর দিন (`app/(contents)/en/<slug>/page.mdx`, একই স্লাগ)। না পারলে শুধু
   বাংলা দিলেও চলবে – মিররটা মেইনটেইনাররা করে নেবেন।
6. **PR খুলুন।** ভাষা নিখুঁত না হলেও জমা দিন – রিভিউতে আমরা গুছিয়ে দেব। আসল কথা: তথ্য ঠিক
   আছে কি না, আর সূত্র আছে কি না।

## রিভিউ কীভাবে হয়

- **প্রথম জবাব ৪৮ ঘণ্টার মধ্যে** – এটাই আমাদের কথা।
- স্বয়ংক্রিয় চেক (লিন্টার + বিল্ড) PR-এ নিজে থেকেই চলে। ওয়েব থেকে সম্পাদনা করলে এগুলো নিয়ে
  ভাবতে হবে না – ফল দেখে আমরা জানিয়ে দেব।
- আইন, কর, রেজিস্ট্রেশন, ফান্ডিং – এই পাতাগুলো মেইনটেইনারের রিভিউ ছাড়া মার্জ হয় না। জটিল
  হলে আমরা আইনজীবী বা সিএ-কে দেখাই।
- রিভিউতে কিছু বদলাতে বললে সেটা লেখা নিয়ে, আপনাকে নিয়ে নয়। প্রশ্ন থাকলে ইস্যুতে বা
  [Discussions](https://github.com/Deshi-Startup/deshistartup/discussions)-এ জিজ্ঞেস করুন।

## ডেভেলপারদের জন্য (ঐচ্ছিক)

কনটেন্ট লিখতে এসব লাগে না। সাইটের কোড/কম্পোনেন্টে কাজ করলে:

```bash
npm install
npm run dev          # লোকাল সার্ভার
npm run lint:bangla  # বাংলা লেখার যান্ত্রিক চেক
npm run build        # স্ট্যাটিক বিল্ড (manifest নিজে থেকেই রিজেনারেট হয়)
```

আর্কিটেকচার, রাউটিং, স্টাব-ব্যবস্থা, নেভিগেশন কনভেনশন – সব [AGENTS.md](./AGENTS.md)-এ।
`app/generated/*` কখনো হাতে বদলাবেন না (বিল্ড আর্টিফ্যাক্ট)।

## লাইসেন্স

PR জমা দেওয়া মানেই আপনি রাজি: কনটেন্ট অবদান [কনটেন্ট লাইসেন্স](./LICENSE-content.md), কোড অবদান
[MIT](./LICENSE) লাইসেন্সে প্রকাশিত হবে। অন্যের লেখা কপি করে দেবেন না – ধারণা নিজের ভাষায়
শেখান, সূত্র দিন (বিস্তারিত [EDITORIAL.md](./EDITORIAL.md)-এ)।

---

# Contributing (English)

Deshi Startup is an open knowledge base written together. Everything from reporting a typo to
writing a full guide is welcome. The easiest introduction is the site's
[contribute page](https://deshistartup.com/en/contribute); this file is its GitHub version with
extra detail.

## Three paths

1. **Report wrong or outdated info (2 min)** – the **"Report a mistake"** link on any page, or the
   [issue form](https://github.com/Deshi-Startup/deshistartup/issues/new?template=report-mistake.yml).
   Say what's wrong and, if you know it, the correct info with a source.
2. **Make a small fix yourself (5–10 min)** – click **"Edit"** on any page; GitHub opens the file
   in your browser. Fix it and hit **"Propose changes"** – GitHub handles the fork and branch.
   Nothing to install.
3. **Write a stub into a full guide** – see below.

## Writing a guide

1. **Pick a topic** from the [open issues](https://github.com/Deshi-Startup/deshistartup/issues)
   or [plan/content-backlog.csv](./plan/content-backlog.csv) (priorities are marked). Comment
   **"I'm writing this"** on the issue so two people don't duplicate work.
2. **Research properly:** official portals, the underlying law, and the tiered sources in
   [plan/sources.csv](./plan/sources.csv). Never guess; mark unverified claims as needing
   verification, or leave them out.
3. **Structure:** delete the stub's `<StubNotice ... />` line **only when the guide is complete** –
   that single line is what flips the page to "written" everywhere. Use the guide skeleton shown
   in the Bangla section above (সারকথা summary → who needs it → step by step → cost & time,
   year-stamped → common mistakes → sources, official links first).
4. **Quality bars:** [STYLE.md](./STYLE.md) (think in Bangla, never translate from English) and
   [EDITORIAL.md](./EDITORIAL.md) (every hard concept: name → plain definition → local example →
   worked taka math → so-what). [/start-here](https://deshistartup.com/start-here) is the exemplar.
5. **Bengali first, English mirror second:** the Bengali page is the source of truth
   (`app/(contents)/(bn)/<slug>/page.mdx`). An English mirror in the same PR
   (`app/(contents)/en/<slug>/page.mdx`, same slug) is welcome but optional – maintainers will
   mirror it if you can't.
6. **Open the PR.** Imperfect language is fine; review polishes it. What matters is factual
   accuracy and sources.

## How review works

- **First response within 48 hours** – that's our promise.
- Automated checks (Bangla linter + build) run on every PR. If you edited from the browser,
  don't worry about them – we'll read the results and tell you what, if anything, to change.
- Legal, tax, registration, and funding pages never merge without maintainer review; complex
  cases get professional (lawyer/CA) review.
- Change requests are about the page, never about you. Ask anything in the issue or in
  [Discussions](https://github.com/Deshi-Startup/deshistartup/discussions).

## For developers (optional)

Not needed for content. If you work on the site's code:

```bash
npm install
npm run dev          # local dev server
npm run lint:bangla  # mechanical Bangla style check
npm run build        # static build (manifest regenerates automatically)
```

Architecture, routing, the stub system, and navigation conventions live in
[AGENTS.md](./AGENTS.md). Never hand-edit `app/generated/*` (build artifacts).

## Licensing of contributions

By submitting a PR you agree that content contributions are licensed under
[CC BY-SA 4.0](./LICENSE-content.md) and code contributions under [MIT](./LICENSE). Never paste in
copyrighted text – teach the ideas in your own words and cite the source (EDITORIAL.md §8).
