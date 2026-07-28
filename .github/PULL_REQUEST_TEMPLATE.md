<!-- ব্রাউজার থেকে ছোট সংশোধন পাঠালে শুধু কী বদলেছে লিখলেই হবে। বাকিটা রিভিউয়ার ও CI দেখবে।
For a small browser edit, describe what changed; reviewers and CI will handle the rest. -->

## কী বদলেছে · What changed

<!-- এক-দুই লাইনে কী বদলেছে এবং কেন লিখুন। ইস্যু বন্ধ করার জন্য লিখুন: `Closes #নম্বর` -->

## বড় লেখা বদলালে · For substantial content changes

- [ ] তথ্য এবং আইন, ফি বা নিয়মের দাবির কাছে সূত্র দিয়েছি। বদলাতে পারে এমন সংখ্যার সঙ্গে সাল বা যাচাইয়ের তারিখ আছে
- [ ] বাংলা জোরে পড়েছি এবং `STYLE.md` ও `EDITORIAL.md`-এর শেষ চেকলিস্ট মিলিয়েছি
- [ ] `<StubNotice />` **শুধু পূর্ণ গাইড শেষ হলে** সরিয়েছি

## নিজের কম্পিউটারে চালানো চেক · Local checks (optional)

- [ ] `npm run lint:bangla` সবুজ · passes
- [ ] `npm run build` সবুজ · passes
