# নিরাপত্তা · Security

> **সারকথা (বাংলা):** সাইটে নিরাপত্তার কোনো দুর্বলতা পেলে সেটি প্রকাশ্য ইস্যুতে
> লিখবেন না। GitHub-এর
> [গোপন রিপোর্ট ফর্মে](https://github.com/Deshi-Startup/deshistartup/security/advisories/new)
> জানান, অথবা মেইল করুন **security@deshistartup.com** ঠিকানায়। ৭২ ঘণ্টার মধ্যে
> উত্তর দেওয়ার চেষ্টা করি, আর সমাধান হয়ে গেলে চাইলে আপনার নাম কৃতজ্ঞতার সঙ্গে
> লিখে দিই। লেখায় ভুল তথ্য থাকলে সেটি নিরাপত্তার বিষয় নয়, সেটির জন্য পেজের
> **ফিডব্যাক দিন** অপশনটিই ঠিক জায়গা।
>
> নিচের ইংরেজি অংশটিই আনুষ্ঠানিক নীতি।

## Reporting a vulnerability

**Do not open a public issue for a security problem.** Use one of these instead:

- [Private vulnerability report](https://github.com/Deshi-Startup/deshistartup/security/advisories/new)
  on GitHub (preferred — it keeps the discussion and the fix in one place), or
- email **security@deshistartup.com**.

Please include: what you found, the URL or file involved, the steps to reproduce
it, and what an attacker could do with it. A proof of concept helps, but a clear
description is enough to get started.

**What to expect**

- **First response:** within 72 hours.
- **Assessment and plan:** within 7 days.
- **A fix for a confirmed issue:** as fast as the severity warrants. Critical
  issues take priority over everything else in the project.
- **Credit:** your name or handle in the published advisory, unless you would
  rather stay anonymous.

This is a volunteer-run open-source project, so there is no bug bounty. We do
read every report.

## What is in scope

- The site at **deshistartup.com** and its Cloudflare Worker (`worker/`).
- The contribution flow: sign-in, the editor, the image upload path, and the
  GitHub App that opens pull requests on a reader's behalf.
- This repository's build and CI configuration.
- Leaked credentials — an API key, a private key, or a token committed to the
  repository or exposed by the deployed site.

Typical things worth reporting: authentication or authorization bypass in the
contribution flow, stored or reflected XSS, injection into generated pages,
server-side request forgery, a path that lets someone write to the repository
without review, rate-limit bypass on the upload or contribution endpoints, and
exposure of reviewer email addresses or App credentials.

## What is out of scope

- Wrong, outdated, or incomplete **content** in a guide. That is an editorial
  issue: use the **ফিডব্যাক দিন** option on the page, or open a normal issue.
- Reports that are only the output of an automated scanner, with no working
  attack behind them.
- Missing hardening headers, missing SPF/DMARC, TLS configuration preferences,
  or similar findings with no demonstrated impact.
- Denial of service through sheer volume of traffic, and any testing that
  degrades the site for readers.
- Social engineering of maintainers or contributors, and physical attacks.
- Vulnerabilities in third-party services we merely link to.

## Testing rules

Test only against your own account and your own content. Do not access, modify,
or delete anyone else's data; do not run automated scanners against production;
do not pivot beyond the minimum needed to prove a finding. If you accidentally
reach data that is not yours, stop and tell us in the report. Research that
follows these rules is welcome, and we will not pursue action against it.

## Supported versions

The site is continuously deployed from the `main` branch, and only the currently
deployed version is supported. There are no maintained older releases.
