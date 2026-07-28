# অবদান রাখুন · Contributing

দেশি স্টার্টআপে অবদান রাখতে কোড বা GitHub জানা লাগে না। সাইটের
[অবদান পাতায়](https://deshistartup.com/contribute) বাংলা ধাপগুলো আছে।

## শুরু করার ৩টি পথ

1. **ভুল জানান:** পাতার **ভুল জানান** লিংকে কী ভুল লিখুন। সূত্র জানা থাকলে দিন।
2. **ছোট সংশোধন করুন:** পাতার **সম্পাদনা** বোতাম চাপুন, Google দিয়ে সাইন ইন করুন,
   লেখা ঠিক করে **রিভিউতে পাঠান** চাপুন। পুল রিকোয়েস্ট নিজে থেকেই তৈরি হবে।
3. **পূর্ণ গাইড লিখুন:** কোনো **লেখা বাকি** পাতা বেছে নিন। একই বিষয়ে দুজন যেন কাজ না
   করেন, আগে সংশ্লিষ্ট ইস্যুতে “আমি লিখছি” লিখুন।

GitHub ব্যবহার করতে চাইলে পাতার নিচের **GitHub-এ সম্পাদনা** লিংকও ব্যবহার করতে পারেন।

## পূর্ণ গাইডের ন্যূনতম মান

- সরকারি বা মূল সূত্র ধরে রিসার্চ করুন। অনুমানকে তথ্য হিসেবে লিখবেন না।
- বাংলায় ভেবে সহজ বাংলায় লিখুন। লেখা শেষ করে জোরে পড়ুন।
- পাঠক যেন বুঝতে পারেন: কার দরকার, কী করবেন, কী লাগবে, খরচ ও সময় কত।
- আইন, ফি, সীমা ও নিয়মের দাবির পাশে সূত্র দিন। বদলাতে পারে এমন সংখ্যার সঙ্গে সাল দিন।
- `<StubNotice ... />` শুধু পূর্ণ গাইড শেষ হলে সরান।
- বাংলা পাতাই মূল। ইংরেজি মিরর দিলে ভালো; না পারলেও বাংলা অবদান জমা দিন।

কাজের ছাঁচ:

```text
# শিরোনাম

> **সারকথা:** ৩–৪ লাইনে মূল উত্তর।

## কার কখন দরকার
## ধাপে ধাপে কী করবেন
## খরচ ও সময়
## সাধারণ ভুল
## চেকলিস্ট
## প্রাসঙ্গিক সূত্র
```

ভাষার উদাহরণ ও শেষ চেকের জন্য [STYLE.md](./STYLE.md), আর গবেষণা ও শেখানোর মানের জন্য
[EDITORIAL.md](./EDITORIAL.md) দেখুন। [/start-here](https://deshistartup.com/start-here)
একটি ভালো নমুনা।

## রিভিউ

রিভিউয়ার তথ্য, সূত্র, স্পষ্টতা, সম্ভাব্য ক্ষতি এবং কপিরাইট দেখেন। আইন, কর, রেজিস্ট্রেশন,
শ্রম, পেমেন্ট ও ফান্ডিংয়ের লেখা প্রয়োজনমতো বিশেষজ্ঞের কাছে যায়। প্রথম খসড়া নিখুঁত হতে
হবে না; সঠিক তথ্য ও ভালো সূত্র ভাষার চেয়ে বেশি জরুরি।

## ডেভেলপারদের জন্য

```bash
npm install
npm run dev
npm run lint:bangla
npm run build
```

কোডের মানচিত্র ও অপরিবর্তনীয় নিয়ম [AGENTS.md](./AGENTS.md)-এ আছে। `app/generated/` ও
SEO আউটপুট বিল্ডে তৈরি হয়; হাতে বদলাবেন না।

অবদান পাঠালে কনটেন্টের জন্য [CC BY-SA 4.0](./LICENSE-content.md) এবং কোডের জন্য
[MIT](./LICENSE) লাইসেন্সে প্রকাশে সম্মতি দিচ্ছেন। অন্যের লেখা কপি করবেন না।

---

# Contributing

You do not need to know GitHub or install anything to contribute. The
[contribute page](https://deshistartup.com/en/contribute) has the full browser-based flow.

## Three ways to start

1. **Report a problem:** use **Report a mistake** on the page and describe what is wrong.
2. **Make a small fix:** press **Edit**, sign in with Google, make the change, then press
   **Send for review**. The site creates the pull request.
3. **Write a guide:** choose a **to be written** page and claim its issue before starting.

For a complete guide, research from primary sources, explain who needs the answer and what to do,
cite every legal or regulatory claim, date changeable numbers, and remove `<StubNotice ... />`
only when the guide is genuinely complete. Bengali is the source edition; an English mirror is
welcome but optional.

Use [STYLE.md](./STYLE.md) for natural Bangla and [EDITORIAL.md](./EDITORIAL.md) for research,
teaching and source standards. Review focuses on accuracy, evidence, clarity, harm and copyright.
Imperfect prose is welcome; reviewers can help polish it.

Developers can run `npm install`, `npm run dev`, `npm run lint:bangla`, and `npm run build`.
Architecture and repository rules live in [AGENTS.md](./AGENTS.md).

By contributing, you agree to publish content under [CC BY-SA 4.0](./LICENSE-content.md) and
code under [MIT](./LICENSE). Do not submit text you do not have the right to share.
