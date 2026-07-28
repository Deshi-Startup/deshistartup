<!-- ছোট browser edit হলে শুধু কী বদলেছে লিখলেই হবে। বাকিটা reviewer ও CI দেখবে।
For a small browser edit, describe the change; reviewers and CI will handle the rest. -->

## কী বদলেছে · What changed

<!-- এক-দুই লাইনে। ইস্যু বন্ধ করার জন্য লিখুন: `Closes #নম্বর` -->

## বড় কনটেন্ট বদলের চেক · For substantial content changes

- [ ] তথ্য ও আইন/ফি/নিয়মের দাবিতে সূত্র আছে; বদলাতে পারে এমন সংখ্যায় সাল আছে
- [ ] বাংলা জোরে পড়ে দেখেছি এবং STYLE.md / EDITORIAL.md-এর শেষ checklist মিলিয়েছি
- [ ] `<StubNotice />` লাইনটি **শুধু পূর্ণ গাইড হলে** সরিয়েছি

## লোকাল চেক · Local checks (optional)

- [ ] `npm run lint:bangla` সবুজ · passes
- [ ] `npm run build` সবুজ · passes
