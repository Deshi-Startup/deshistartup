import React from "react";
import contentIndex from "../generated/content-index.json";

type RecentPage = [route: string, title: string, date: string];
interface ContentIndexLocale {
  counts: [written: number, stubs: number];
  recent: RecentPage[];
}

const typedContentIndex = contentIndex as unknown as Record<
  "bn" | "en",
  ContentIndexLocale
>;

const bengaliDigits = (value: number | string) =>
  String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

function localHref(href: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!href.startsWith("/")) return href;
  if (!basePath) return href;
  return href === "/" ? basePath || "/" : `${basePath}${href}`;
}

interface TranslationStrings {
  kicker: string;
  title: string;
  subtitle: string;
  pill: string;
  lead: React.ReactNode;
  lead2: string;
  start: [string, string][];
  noticeLabel: string;
  notice: string;
  infoboxTitle: string;
  infoboxName: string;
  infoboxTagline: string;
  infobox: (written: number, stubs: number) => [string, string][];
  stageTitle: string;
  stageSub: string;
  stages: [string, string, string, string][];
  topicTitle: string;
  topicSub: string;
  topics: [string, string, string][];
  faqTitle: string;
  faqSub: string;
  faq: [string, string][];
  govTitle: string;
  govSub: string;
  gov: [string, string, string][];
  bandTitle: string;
  bandBody: string;
  bandStats: (written: number, stubs: number) => [string, string][];
  bandCta: string;
  contribute: string;
  recentTitle: string;
}

const bn: TranslationStrings = {
  kicker: "বাংলাদেশে স্টার্টআপ গড়ার উন্মুক্ত গাইড",
  title: "দেশি স্টার্টআপ",
  subtitle:
    "আইডিয়া থেকে প্রথম কাস্টমার, ট্রেড লাইসেন্স থেকে পেমেন্ট, ফান্ডিং থেকে স্কেল। জানুন ধাপে ধাপে, বাংলায়।",
  pill: "বাংলা",
  lead: (
    <>
      মাথায় একটা স্টার্টআপ আইডিয়া আছে, কিন্তু বুঝতে পারছেন না আগে কাস্টমার
      খুঁজবেন, প্রোডাক্ট বানাবেন, ট্রেড লাইসেন্স করবেন, নাকি কোম্পানি খুলবেন?
      “এখন আমি কী করব?” বা "এখন আমার কী করা উচিত?"– এই প্রশ্নের উত্তরের খোঁজেই
      দেশি স্টার্টআপের জন্ম।
    </>
  ),
  lead2:
    "বাংলাদেশের বাস্তবতা অন্যান্য দেশের চেয়ে আলাদা। কাস্টমারের ভরসা পেতে সময় লাগে, ক্যাশ অন ডেলিভারি এখনো জরুরি, আজও ফেসবুক পেজ বা ইনবক্স অধিকাংশ অনলাইন উদ্যোক্তাদের সেলস জেনারেশনের প্রধান মাধ্যম। ব্যবসায়িক-সামাজিক-অর্থনৈতিক অবস্থা সম্পর্কে যথাযথ জ্ঞান না থাকা উদ্যোক্তাকে যেমন ক্ষতিগ্রস্ত করে, তেমনিভাবে দীর্ঘমেয়াদে স্টার্টআপ ইকোসিস্টেমের বিকাশও বাধাগ্রস্ত হয়। তাই দেশি স্টার্টআপ উঠতি উদ্যোক্তাদের জন্য বাংলাদেশের প্রেক্ষাপটে ব্যবসায়িক বাস্তবতাকে তুলে ধরতে সচেষ্ট।",
  start: [
    ["শুরুটা হোক এখান থেকে", "/start-here"],
    ["সাজানো রোডম্যাপগুলো দেখুন", "/roadmap"],
  ],
  noticeLabel: "জেনে রাখুন",
  notice:
    "ভ্যাট, ট্যাক্স, আইন, ব্যাংক বা লাইসেন্সিং সম্পর্কিত তথ্যগুলো শুধুই আপনাকে ধারণা দেবার জন্য। এগুলো কোনো অবস্থাতেই আইনি বা করসংক্রান্ত পরামর্শ নয়। সময়ের সাথে ফি, আইনি কাঠামো বা প্রক্রিয়ায় পরিবর্তন স্বাভাবিক, তাই দয়া করে সিদ্ধান্ত গ্রহণের পূর্বে অফিশিয়াল সোর্সে নিশ্চিত হয়ে একজন বিজনেস বা আইনি পরামর্শদাতার পরামর্শ গ্রহণ করুন।",
  infoboxTitle: "এক নজরে",
  infoboxName: "দেশি স্টার্টআপ",
  infoboxTagline: "বাংলাদেশে স্টার্টআপ গড়ার উন্মুক্ত গাইড",
  infobox: (written, stubs) => [
    [
      "যাদের জন্য",
      "উঠতি উদ্যোক্তা, শিক্ষার্থী, নারী উদ্যোক্তা, স্টার্টআপ টিম, প্রবাসী উদ্যোক্তা",
    ],
    [
      "যা পাবেন",
      "আইডিয়া যাচাই, রেজিস্ট্রেশন, পেমেন্ট, বিক্রি, নিয়োগ, ফান্ডিং ও সংশ্লিষ্ট জ্ঞান",
    ],
    ["ভাষা", "প্রয়োজনীয় ব্যাখ্যাসহ প্রচলিত বাংলা"],
    ["মূল্য", "সম্পূর্ণ ফ্রি ও ওপেনসোর্স"],
    [
      "গাইড",
      `${bengaliDigits(written)}টি লেখা হয়েছে · ${bengaliDigits(stubs)}টি লেখার অপেক্ষায়`,
    ],
  ],
  stageTitle: "যেখান থেকে শুরু করতে চান, বেছে নিন",
  stageSub:
    "আপনার লক্ষ্য ও বর্তমান অবস্থান বুঝে রোডম্যাপ ধরে আগান, অথবা ওপরের সার্চ বক্সে সার্চ করুন।",
  stages: [
    [
      "লক্ষ্য জানি, কীভাবে আগাবো?",
      "প্রথমেই কোন কাজগুলো গুরুত্বপূর্ণ, সে সম্পর্কে ধারণা নিন।",
      "জার্নিটা জেনে নিন",
      "/journeys",
    ],
    [
      "আমার আইডিয়া আছে",
      "বিল্ড করবার আগে সমস্যার প্রকৃত চিত্র সম্পর্কে জানুন।",
      "আইডিয়া যাচাই করুন",
      "/validation",
    ],
    [
      "স্টার্টআপ চালু করতে চাই",
      "ট্ট্রেড লাইসেন্স, কোম্পানি, TIN, ভ্যাট, ব্যাংকিং প্রসেস - ধাপে ধাপে জানুন।",
      "প্রসেসগুলো জেনে নিন",
      "/legal-roadmap",
    ],
    [
      "আমার কাস্টমার দরকার",
      "ফেসবুক, ম্যাসেঞ্জার, হোয়াটসঅ্যাপ, রেফারাল – প্রথম ১০০ কাস্টমার অর্জনের পথ।",
      "আরো জানুন",
      "/customers",
    ],
  ],
  topicTitle: "টপিক ধরে খুঁজুন",
  topicSub:
    "যে কাজটা এখন করতে চাইছেন, সেই বিষয়ের গাইডে ঢুকে পড়ুন। প্রতিটি বিভাগের পেজে সেই বিষয়ের সব গাইডের তালিকা আছে।",
  topics: [
    [
      "প্রবলেম ফাইন্ডিং ও মার্কেট রিসার্চ",
      "সমস্যা খোঁজা · মার্কেট আন্ডারস্ট্যান্ডিং · ডেটার সোর্স · কম্পিটিটরস্‌",
      "/ideas",
    ],
    [
      "আইডিয়া ভ্যালিডেশন",
      "কাস্টমারের সঙ্গে আলাপ · চাহিদার পরীক্ষা · MVP",
      "/validation",
    ],
    [
      "আইন, কর ও রেজিস্ট্রেশন",
      "ট্রেড লাইসেন্স · কোম্পানি · RJSC · e-TIN · ভ্যাট/BIN",
      "/legal-roadmap",
    ],
    [
      "পেমেন্ট ও অপারেশন",
      "বিকাশ/নগদ · গেটওয়ে · ক্যাশ অন ডেলিভারি · কুরিয়ার · রিফান্ড",
      "/payments",
    ],
    [
      "কাস্টমার ও সেলস",
      "ফেসবুক কমার্স · মেসেঞ্জার/হোয়াটসঅ্যাপ · B2B বিক্রি · প্রথম ১০০ কাস্টমার",
      "/customers",
    ],
    [
      "টিম ও উদ্যোক্তার জীবন",
      "কো-ফাউন্ডার · প্রথম নিয়োগ · পারিবারিক চাপ · বার্নআউট",
      "/founder-life",
    ],
    [
      "ফান্ডিং ও স্কেলিং",
      "গ্র্যান্ট · অ্যাঞ্জেল · ভিসি · পিচ ডেক · সরকারি সুবিধা",
      "/funding",
    ],
    [
      "টেমপ্লেট ও টুলস",
      "চেকলিস্ট · স্ক্রিপ্ট · ক্যালকুলেটর · ট্র্যাকার",
      "/tools",
    ],
    [
      "ডিরেক্টরি",
      "ইনভেস্টর · অ্যাক্সেলারেটর · প্রোগ্রাম · ইকোসিস্টেম",
      "/directory",
    ],
    ["সব বিষয়", "রেজিস্ট্রেশন থেকে বিষয়ভিত্তিক গাইডলাইন – এক পেজে", "/guides"],
  ],
  faqTitle: "সচরাচর জিজ্ঞাসা",
  faqSub:
    "কিছু খুবই কমন প্রশ্ন ও উত্তর, যা প্রাথমিক সিদ্ধান্ত নিতে কাজে লাগবে।",
  faq: [
    [
      "শুরুতেই কি কোম্পানি খুলতে হবে?",
      "না, সবসময় নয়। আগে আইডিয়া ভ্যালিডেশন দরকার, কাস্টমার যাচাই, পেমেন্ট এবং অপারেশনগুলো সম্পর্কে জেনে নেওয়া জরুরি। বিস্তারিত জানুন আইনি রোডম্যাপ গাইডে।",
    ],
    [
      "শুধু ফেসবুক পেজ দিয়ে শুরু করা কি ভুল?",
      "না। বাংলাদেশে অনেক ব্যবসা ফেসবুক পেজ বা ইনবক্স থেকেই শুরু হয়। তবে অর্ডার, পেমেন্ট, ডেলিভারি ও রিফান্ডের হিসাব গুছিয়ে না রাখলে পরে সমস্যা হতে পারে।",
    ],
    [
      "ফান্ডিং ছাড়া স্টার্টআপ করা যায়?",
      "অধিকাংশ সময়ই সম্ভব। তবে পুরোদমে ফান্ড-সিকিং (Fund Seeking)-এর আগে ছোট ছোট পরীক্ষা, পেইড কাস্টমার আর রিপিট অর্ডারের ইকোসিস্টেম তৈরি করে নিন। এতে আলোচনার টেবিলে এগিয়ে থাকবেন।",
    ],
    [
      "আইন/কর না বুঝলে কী করব?",
      "ভয়ে থেমে যাবেন না। প্রাধান্য নিশ্চিত করতে শিখুন। কোন কাজটি জরুরি, কোন কাজটি প্রয়োজনীয় সেটা আগে বুঝুন। যেকোনো সিদ্ধান্ত নেবার পূর্বে সরকারি সোর্স ও পেশাদার পরামর্শ গ্রহণ করুন।",
    ],
    [
      "এই সাইট কি সত্যিই ফ্রি?",
      "হ্যাঁ, সম্পূর্ণ ফ্রি ও ওপেনসোর্স কনটেন্ট। পুরো সাইটের লেখা GitHub-এ উন্মুক্ত।",
    ],
    [
      "এই লেখাগুলো কারা লেখে?",
      "দেশি স্টার্টআপ কন্ট্রিবিউটরগণ লিখে থাকেন। প্রতিটি পেজের “এডিট” অপশন থেকে যে কেউ ভুল ঠিক করতে বা নতুন লেখা যোগ করতে পারেন। রিভিউয়াররা যাচাই করে পাবলিশ করেন।",
    ],
  ],
  govTitle: "দরকারি সরকারি লিংক",
  govSub:
    "রেজিস্ট্রেশন, কর, ভ্যাট বা ব্যাংকিং নিয়ে কাজ করার সময় সরকারি পোর্টাল দেখে সিদ্ধান্ত নিন।",
  gov: [
    [
      "RJSC",
      "কোম্পানি, পার্টনারশিপ ব্যবসা বা সোসাইটি রেজিস্ট্রেশন",
      "https://roc.gov.bd",
    ],
    [
      "NBR e-TIN",
      "ব্যক্তি বা প্রতিষ্ঠানের টিআইএন সংক্রান্ত কাজ",
      "https://secure.incometax.gov.bd",
    ],
    [
      "ভ্যাট অনলাইন",
      "BIN/ভ্যাট রেজিস্ট্রেশন ও ভ্যাট রিটার্ন",
      "https://vat.gov.bd",
    ],
    [
      "BIDA OSS",
      "বিনিয়োগ, অনুমোদন ও সরকারি সেবার আবেদন",
      "https://bidaquickserv.org/",
    ],
    [
      "বাংলাদেশ ব্যাংক",
      "ব্যাংকিং, পেমেন্ট ও বৈদেশিক মুদ্রার নিয়ম",
      "https://www.bb.org.bd",
    ],
  ],
  bandTitle: "দেশি স্টার্টআপে কন্ট্রিবিউট করুন",
  bandBody:
    "ভুল সংশোধনে সাহায্য করুন, নতুন গাইড লিখুন, কন্ট্রিবিউটর টিমে যোগ দিন অথবা নিজের কাজের অভিজ্ঞতা ও রিসোর্স শেয়ার করুন।",
  bandStats: (written, stubs) => [
    [bengaliDigits(written), "গাইড লেখা হয়েছে"],
    [bengaliDigits(stubs), "বিষয় লেখার অপেক্ষায়"],
  ],
  bandCta: "কন্ট্রিবিউট করুন",
  contribute: "/contribute",
  recentTitle: "সম্প্রতি আপডেট হয়েছে",
};

const en: TranslationStrings = {
  kicker: "The Bangladeshi startup manual",
  title: "Deshi Startup",
  subtitle:
    "Step-by-step guidance in plain language – from idea to first customer, trade license to payments, funding to scale.",
  pill: "English",
  lead: (
    <>
      You have a startup idea, but can&apos;t tell what comes first – finding
      customers, building the product, getting a trade license, or opening a
      company? <strong>Deshi Startup</strong> organizes plain answers to that
      “what do I do now?” question – actionable work, not motivational stories.
    </>
  ),
  lead2:
    "Bangladesh works differently: customer trust takes time, cash on delivery still matters, Facebook/Messenger are major sales channels, and government paperwork needs care. So this site doesn't copy foreign advice; it explains how things actually work in Bangladesh.",
  start: [
    ["Start here", "/en/start-here"],
    ["Guided paths", "/en/journeys"],
  ],
  noticeLabel: "Please note",
  notice:
    "Articles about law, tax, VAT, banking or licensing help you decide, but they are not legal or tax advice. Fees, forms and processes change; confirm with official sources and, where needed, a chartered accountant or lawyer before acting.",
  infoboxTitle: "At a glance",
  infoboxName: "Deshi Startup",
  infoboxTagline: "The Bangladeshi startup manual",
  infobox: (written, stubs) => [
    [
      "For",
      "New and women founders, student founders, startup teams, diaspora founders",
    ],
    [
      "Covers",
      "Idea validation, registration, payments, sales, hiring, funding",
    ],
    ["Language", "Simple Bangla; English terms explained"],
    ["Price", "Completely free; open source"],
    ["Guides", `${written} written · ${stubs} waiting for writers`],
  ],
  stageTitle: "Where are you right now?",
  stageSub:
    "Nobody starts from the same place. Some are at the idea stage, some already run a Facebook page, some are stuck on registration. Pick the card that matches your situation, or type your question in the search above.",
  stages: [
    [
      "I'm completely new",
      "See the whole journey first – what comes first, what can wait.",
      "Start here",
      "/en/start-here",
    ],
    [
      "I have an idea",
      "Before building, check people truly feel the problem and will pay.",
      "Validate your idea",
      "/en/validation",
    ],
    [
      "I want to launch",
      "Trade license, company, TIN, VAT, bank – which paper when, step by step.",
      "See the legal path",
      "/en/legal-roadmap",
    ],
    [
      "I need customers",
      "Facebook, Messenger, WhatsApp, referrals – real paths to your first 100 customers.",
      "Start selling",
      "/en/customers",
    ],
    [
      "I know the goal",
      "Pick the job you are trying to do and follow the guides in order.",
      "See guided paths",
      "/en/journeys",
    ],
  ],
  topicTitle: "Browse by topic",
  topicSub:
    "Jump into the guide for the job you're doing right now. Every section page lists all of its guides.",
  topics: [
    [
      "Ideas & market",
      "Finding problems · market research · data sources · competitors",
      "/en/ideas",
    ],
    [
      "Idea validation",
      "Customer interviews · demand tests · MVPs",
      "/en/validation",
    ],
    [
      "Legal, tax & registration",
      "Trade license · company · RJSC · e-TIN · VAT/BIN",
      "/en/legal-roadmap",
    ],
    [
      "Payments & operations",
      "bKash/Nagad · gateways · cash on delivery · couriers · refunds",
      "/en/payments",
    ],
    [
      "Customers & sales",
      "Facebook commerce · Messenger/WhatsApp · B2B sales · first 100 customers",
      "/en/customers",
    ],
    [
      "Team & founder life",
      "Co-founders · first hires · family pressure · burnout",
      "/en/founder-life",
    ],
    [
      "Funding & scale",
      "Grants · angels · VC · pitch decks · government support",
      "/en/funding",
    ],
    [
      "Templates & tools",
      "Checklists · scripts · calculators · trackers",
      "/en/tools",
    ],
    [
      "Directory",
      "Investors · accelerators · programs · ecosystem",
      "/en/directory",
    ],
    [
      "All topics",
      "Every topic hub on one page – registration to sector playbooks",
      "/en/guides",
    ],
  ],
  faqTitle: "Common beginner questions",
  faqSub:
    "Everything feels urgent at the start, but not everything happens on day one – these answers help with the first decisions.",
  faq: [
    [
      "Do I need a company from day one?",
      "Not always. Often it matters more to validate demand, set up a simple way to take payments, and keep basic records first. Details in the legal roadmap.",
    ],
    [
      "Is starting with just a Facebook page wrong?",
      "No. Many Bangladeshi businesses start on Facebook/Messenger. But keep orders, payments, delivery and refunds organized from the start.",
    ],
    [
      "Can I build a startup without funding?",
      "Very often, yes. Gather proof first – small tests, paying customers, repeat orders – and funding conversations get much easier.",
    ],
    [
      "What if I don't understand law/tax?",
      "Don't freeze. First understand what's needed now versus later. For big decisions, combine official sources with professional advice.",
    ],
    [
      "Is this site really free?",
      "Yes – completely free and open source. No courses for sale, no login. All the writing is open on GitHub.",
    ],
    [
      "Who writes these guides?",
      "The community – founders, students, professionals. Anyone can improve any page via its “Edit” link; reviewers check every change.",
    ],
  ],
  govTitle: "Essential government links",
  govSub:
    "When working on registration, tax, VAT or banking, make the final call from the official portals. You'll come back to these often.",
  gov: [
    [
      "RJSC",
      "Company, partnership and society registration",
      "https://roc.gov.bd",
    ],
    [
      "NBR e-TIN",
      "Personal and company TIN services",
      "https://secure.incometax.gov.bd",
    ],
    [
      "VAT Online",
      "BIN/VAT registration and VAT returns",
      "https://vat.gov.bd",
    ],
    [
      "BIDA OSS",
      "Investment approvals and government services",
      "https://bidaquickserv.org/",
    ],
    [
      "Bangladesh Bank",
      "Banking, payments and foreign exchange rules",
      "https://www.bb.org.bd",
    ],
  ],
  bandTitle: "Contribute to the guide",
  bandBody:
    "Fix a mistake, write a guide, join the contributor team, or share relevant work and resources. Contribute once or work with us regularly.",
  bandStats: (written, stubs) => [
    [String(written), "guides written"],
    [String(stubs), "topics waiting for a writer"],
  ],
  bandCta: "Contribute",
  contribute: "/en/contribute",
  recentTitle: "Recently updated",
};

interface WikiLandingProps {
  locale?: "bn" | "en";
}

export default function WikiLanding({ locale = "bn" }: WikiLandingProps) {
  const isEn = locale === "en";
  const t = isEn ? en : bn;
  const {
    counts: [written, stubs],
    recent,
  } = typedContentIndex[locale];

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(isEn ? "en-GB" : "bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  return (
    <div className="wiki-landing">
      <section className="wiki-hero" aria-labelledby="wiki-title">
        <div className="wiki-hero__main">
          <div className="wiki-title-row">
            <div>
              <p className="wiki-kicker">{t.kicker}</p>
              <h1 id="wiki-title">{t.title}</h1>
              <p className="wiki-subtitle">{t.subtitle}</p>
            </div>
            <span className="wiki-language-pill">{t.pill}</span>
          </div>

          <p className="wiki-lead">{t.lead}</p>
          <p>{t.lead2}</p>

          <div className="wiki-start">
            {t.start.map(([label, href], index) => (
              <a
                className={index === 0 ? "is-primary" : undefined}
                href={localHref(href)}
                key={href}
              >
                {label}
              </a>
            ))}
          </div>

          <aside className="wiki-notice" role="note">
            <strong>{t.noticeLabel}</strong>
            <p>{t.notice}</p>
          </aside>
        </div>

        <aside
          className="wiki-infobox"
          aria-label={isEn ? "Deshi Startup infobox" : "দেশি স্টার্টআপ তথ্যছক"}
        >
          <p className="wiki-infobox-title">{t.infoboxTitle}</p>
          <img
            src={localHref("/deshi-mark.webp")}
            alt=""
            aria-hidden="true"
            width="112"
            height="112"
          />
          <strong>{t.infoboxName}</strong>
          <p>{t.infoboxTagline}</p>
          <dl>
            {t.infobox(written, stubs).map(([dt, dd]) => (
              <div key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section id="learning-paths" className="wiki-section">
        <h2>{t.stageTitle}</h2>
        <p>{t.stageSub}</p>
        <div className="wiki-path-grid">
          {t.stages.map(([title, body, cta, href]) => (
            <a className="wiki-path-card" href={localHref(href)} key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
              <span className="wiki-path-card__go">{cta}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="guide-scope" className="wiki-section">
        <h2>{t.topicTitle}</h2>
        <p>{t.topicSub}</p>
        <div className="wiki-scope-grid">
          {t.topics.map(([title, body, href]) => (
            <a className="wiki-scope-card" href={localHref(href)} key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="beginner-questions" className="wiki-section">
        <h2>{t.faqTitle}</h2>
        <p>{t.faqSub}</p>
        <div className="home-faq">
          {t.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wiki-section">
        <h2>{t.govTitle}</h2>
        <p>{t.govSub}</p>
        <div className="wiki-source-list">
          {t.gov.map(([label, body, href]) => (
            <article key={href}>
              <h3>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contribute" className="wiki-section">
        <h2>{t.bandTitle}</h2>
        <div className="contrib-section">
          <p>{t.bandBody}</p>
          <div className="contrib-stats">
            {t.bandStats(written, stubs).map(([value, label]) => (
              <span key={label}>
                <b>{value}</b>
                {label}
              </span>
            ))}
          </div>
          <div className="contrib-row">
            <a href={localHref(t.contribute)}>{t.bandCta}</a>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="wiki-section" aria-labelledby="recent-title">
          <h2 id="recent-title">{t.recentTitle}</h2>
          <ul className="recent-list">
            {recent.map(([route, title, date]) => (
              <li key={route}>
                <a href={localHref(route)}>{title}</a>
                <time dateTime={date}>{formatDate(date)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
