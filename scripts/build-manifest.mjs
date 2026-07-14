#!/usr/bin/env node
/**
 * Builds navigation manifests from the content tree so navigation,
 * section hubs, stub badges, and "last updated" dates never need
 * hand-maintenance. Contributors only add/edit page.mdx files.
 *
 * Outputs:
 *   app/generated/manifest.bn.json  – full tree for server components (hubs)
 *   app/generated/manifest.en.json
 *   public/page-dates.json          – route -> last git commit date (client meta bar)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_LICENSE_URL,
  INDEXNOW_KEY,
  REPOSITORY_URL,
  SITE_URL,
  canonicalUrl,
} from "../app/seo.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "app", "(contents)");

const LOCALES = [
  { key: "bn", dir: path.join(contentRoot, "(bn)"), routePrefix: "" },
  { key: "en", dir: path.join(contentRoot, "en"), routePrefix: "/en" },
];

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      let value = kv[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      data[kv[1]] = value;
    }
  }
  return data;
}

function firstHeading(source) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

// One git pass: newest and oldest commit date per content file. Rename detection
// (--name-status -M) walks history through moves such as the July 2026 URL
// migration, so a moved guide keeps its original published/updated dates.
function collectGitDates() {
  const modified = new Map();
  const published = new Map();
  const alias = new Map(); // historical path -> current path
  const resolve = (file) => {
    let current = file;
    while (alias.has(current)) current = alias.get(current);
    return current;
  };
  try {
    const log = execSync(
      "git log --format='C%cs' --name-status -M -- 'app/(contents)'",
      {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    let current = null;
    for (const line of log.split("\n")) {
      if (line.startsWith("C")) {
        current = line.slice(1).trim();
        continue;
      }
      if (!line.trim() || !current) continue;
      const parts = line.split("\t");
      const status = parts[0];
      let file = null;
      if (status.startsWith("R") && parts.length >= 3) {
        // Log runs newest → oldest: map the pre-rename path onto the file's
        // current (already-resolved) path for all older commits.
        const canonical = resolve(parts[2].trim());
        alias.set(parts[1].trim(), canonical);
        file = canonical;
      } else if (parts.length >= 2) {
        file = resolve(parts[1].trim());
      }
      if (!file) continue;
      if (!modified.has(file)) modified.set(file, current);
      published.set(file, current);
    }
  } catch {
    // No git available (fresh tarball) – dates stay empty, UI hides them.
  }
  return { modified, published };
}

function walkPages(dir, baseDir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...walkPages(full, baseDir));
    } else if (entry.name === "page.mdx") {
      pages.push(path.relative(baseDir, dir).split(path.sep).join("/"));
    }
  }
  return pages;
}

const gitDates = collectGitDates();
const generatedDir = path.join(root, "app", "generated");
fs.mkdirSync(generatedDir, { recursive: true });

const allDates = {};
const allPublished = {};
const allVerified = {};
const llmsPages = {};
const localeCounts = {};
const seoPages = [];

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue;
  const relPages = walkPages(locale.dir, locale.dir);

  const pages = relPages.map((rel) => {
    const filePath = path.join(locale.dir, rel === "" ? "" : rel, "page.mdx");
    const source = fs.readFileSync(filePath, "utf8");
    const fm = parseFrontmatter(source);
    const title = fm.title || firstHeading(source) || rel;
    const isStub = source.includes("<StubNotice");
    const route =
      rel === "" ? locale.routePrefix || "/" : `${locale.routePrefix}/${rel}`;
    const repoPath = path.relative(root, filePath).split(path.sep).join("/");
    const date = gitDates.modified.get(repoPath) || null;
    const published = gitDates.published.get(repoPath) || null;
    if (date) allDates[route] = date;
    if (published) allPublished[route] = published;
    const verified = fm.verified || null;
    if (verified) allVerified[route] = verified;
    return {
      route,
      slug: rel,
      locale: locale.key,
      title: title.split("–")[0].split("|")[0].trim(),
      fullTitle: title,
      description: fm.description || "",
      stub: isStub,
      date,
      published,
      verified,
    };
  });
  llmsPages[locale.key] = pages;
  seoPages.push(...pages);

  // Build a tree: sections are the first-level directories.
  const sections = {};
  for (const page of pages) {
    if (page.slug === "") continue;
    const [head, ...rest] = page.slug.split("/");
    const navPage = {
      route: page.route,
      slug: page.slug,
      title: page.title,
      fullTitle: page.fullTitle,
      description: page.description,
      stub: page.stub,
      date: page.date,
      verified: page.verified,
    };
    if (!sections[head])
      sections[head] = { slug: head, index: null, children: [] };
    if (rest.length === 0) sections[head].index = navPage;
    else sections[head].children.push(navPage);
  }
  for (const section of Object.values(sections)) {
    section.children.sort((a, b) => {
      if (a.stub !== b.stub) return a.stub ? 1 : -1;
      return a.title.localeCompare(b.title, locale.key === "bn" ? "bn" : "en");
    });
    section.title = section.index ? section.index.title : section.slug;
    section.total = section.children.length;
    section.written = section.children.filter((c) => !c.stub).length;
  }

  const manifest = {
    locale: locale.key,
    generatedAt: null, // deliberately unset: avoids churn in git diffs
    counts: {
      pages: pages.length,
      written: pages.filter((p) => !p.stub).length,
      stubs: pages.filter((p) => p.stub).length,
    },
    sections,
  };
  localeCounts[locale.key] = manifest.counts;

  fs.writeFileSync(
    path.join(generatedDir, `manifest.${locale.key}.json`),
    JSON.stringify(manifest, null, 1),
  );
  console.log(
    `manifest.${locale.key}.json: ${pages.length} pages (${manifest.counts.written} written, ${manifest.counts.stubs} stubs)`,
  );
}

// URL -> repo path map for the inline contribution editor. Lets the
// /api/content endpoint resolve a public URL to its source MDX file.
// Landing pages ("/" and "/en") are excluded — they are hubs, not articles.
{
  const contributable = {};
  for (const locale of LOCALES) {
    for (const page of llmsPages[locale.key] || []) {
      if (page.route === "/" || page.route === "/en") continue;
      contributable[page.route] = {
        repoPath: page.repoPath,
        title: page.fullTitle || page.title,
        locale: locale.key,
        stub: !!page.stub,
      };
    }
  }
  fs.writeFileSync(
    path.join(generatedDir, "contributable.json"),
    JSON.stringify(contributable, null, 1),
  );
  console.log(
    `contributable.json: ${Object.keys(contributable).length} editable routes`,
  );
}

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public", "page-dates.json"),
  JSON.stringify(allDates),
);
console.log(`page-dates.json: ${Object.keys(allDates).length} routes`);

fs.writeFileSync(
  path.join(root, "public", "page-published.json"),
  JSON.stringify(allPublished),
);
console.log(`page-published.json: ${Object.keys(allPublished).length} routes`);

fs.writeFileSync(
  path.join(root, "public", "page-verified.json"),
  JSON.stringify(allVerified),
);
console.log(`page-verified.json: ${Object.keys(allVerified).length} routes`);

fs.writeFileSync(
  path.join(generatedDir, "seo-pages.json"),
  JSON.stringify(seoPages, null, 1),
);
console.log(`seo-pages.json: ${seoPages.length} routes`);

// llms.txt – an experimental, legible map for AI assistants. Canonical URLs always
// use the custom domain, regardless of a deployment mirror's basePath.
{
  const abs = canonicalUrl;
  const oneLine = (value) => value.replace(/\s+/g, " ").trim();

  const lines = [];
  lines.push("# Deshi Startup");
  lines.push("");
  lines.push(
    "> Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating " +
      "manual for founders building startups in Bangladesh. Some startup basics also help small " +
      "businesses, but the focus is scalable new ventures. Bengali is the source of truth; English " +
      "mirrors it at /en/...",
  );
  lines.push("");
  lines.push(`Base URL: ${SITE_URL}`);
  lines.push(`Canonical sitemap: ${canonicalUrl("/sitemap.xml")}`);
  lines.push(`Content license: ${CONTENT_LICENSE_URL}`);
  lines.push(`Source repository: ${REPOSITORY_URL}`);
  lines.push("");
  lines.push(
    "Use the Bengali page as the source of truth when the two language versions differ. " +
      "Legal, tax, fee and regulatory claims should be checked against each page’s cited official sources and verification date.",
  );

  const localeSections = [
    { key: "bn", heading: "## বাংলা (Bengali)" },
    { key: "en", heading: "## English" },
  ];

  let totalStubs = 0;
  for (const { key, heading } of localeSections) {
    const pages = (llmsPages[key] || []).filter((p) => !p.stub);
    totalStubs += localeCounts[key]?.stubs || 0;
    lines.push("");
    lines.push(heading);
    for (const page of pages) {
      const desc = page.description ? oneLine(page.description) : "";
      lines.push(
        `- [${oneLine(page.title)}](${abs(page.route)})${desc ? `: ${desc}` : ""}`,
      );
    }
  }

  lines.push("");
  lines.push("---");
  lines.push(
    `${totalStubs} additional topics are planned but not yet written (stubs) across both languages. ` +
      `See ${abs("/contribute")} to help write one.`,
  );

  fs.writeFileSync(
    path.join(root, "public", "llms.txt"),
    lines.join("\n") + "\n",
  );
  console.log(
    `llms.txt: ${(llmsPages.bn?.filter((p) => !p.stub).length || 0) + (llmsPages.en?.filter((p) => !p.stub).length || 0)} written pages listed`,
  );
}

// XML sitemap – written, canonical pages only. Thin contribution stubs are intentionally
// excluded and receive noindex in the postbuild SEO pass.
{
  const escapeXml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const written = seoPages
    .filter((page) => !page.stub)
    .sort((a, b) => a.route.localeCompare(b.route));
  const writtenByKey = new Map(
    written.map((page) => [`${page.locale}:${page.slug}`, page]),
  );
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const page of written) {
    const bnPage = writtenByKey.get(`bn:${page.slug}`);
    const enPage = writtenByKey.get(`en:${page.slug}`);
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(canonicalUrl(page.route))}</loc>`);
    if (page.date) lines.push(`    <lastmod>${escapeXml(page.date)}</lastmod>`);
    if (bnPage && enPage) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="bn-BD" href="${escapeXml(canonicalUrl(bnPage.route))}" />`,
      );
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="en-BD" href="${escapeXml(canonicalUrl(enPage.route))}" />`,
      );
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(canonicalUrl(bnPage.route))}" />`,
      );
    }
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  fs.writeFileSync(
    path.join(root, "public", "sitemap.xml"),
    lines.join("\n") + "\n",
  );
  console.log(`sitemap.xml: ${written.length} canonical URLs`);
}

// Crawl policy. Search and user-facing AI retrieval are explicitly allowed. Training
// crawlers remain separate: the live Cloudflare zone currently reserves that use, and
// blocking them does not block the corresponding search/answer crawlers.
{
  const discoveryAgents = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "Claude-SearchBot",
    "Claude-User",
    "bingbot",
  ];
  const trainingAgents = [
    "Amazonbot",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "ClaudeBot",
    "Google-Extended",
    "GPTBot",
    "meta-externalagent",
  ];
  const lines = [
    "# Deshi Startup permits search indexing and user-facing AI answer retrieval.",
    "# Model-training access is a separate policy and is not required for search discovery.",
    "User-agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference",
    "Allow: /",
    "",
  ];
  for (const agent of discoveryAgents) {
    lines.push(`User-agent: ${agent}`, "Allow: /", "");
  }
  for (const agent of trainingAgents) {
    lines.push(`User-agent: ${agent}`, "Disallow: /", "");
  }
  lines.push(`Sitemap: ${canonicalUrl("/sitemap.xml")}`);
  fs.writeFileSync(
    path.join(root, "public", "robots.txt"),
    lines.join("\n") + "\n",
  );
  console.log(
    `robots.txt: ${discoveryAgents.length} discovery and ${trainingAgents.length} training policies plus wildcard`,
  );
}

// IndexNow verifies site ownership through this public key file. Submission remains a
// deliberate post-deploy action (`npm run seo:indexnow`), never part of the build.
fs.writeFileSync(
  path.join(root, "public", `${INDEXNOW_KEY}.txt`),
  `${INDEXNOW_KEY}\n`,
);

// Tiny client-safe map (section slug -> title) for breadcrumbs.
const lite = {};
for (const locale of LOCALES) {
  const manifestPath = path.join(generatedDir, `manifest.${locale.key}.json`);
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  lite[locale.key] = Object.fromEntries(
    Object.values(manifest.sections).map((s) => [s.slug, s.title]),
  );
  lite[`${locale.key}Counts`] = manifest.counts;
}
fs.writeFileSync(
  path.join(generatedDir, "sections-lite.json"),
  JSON.stringify(lite, null, 1),
);
console.log("sections-lite.json written");

// Shields.io endpoint JSON for the README progress badges (bn digits + latin mirror).
// Consumed via https://img.shields.io/endpoint?url=<raw.githubusercontent URL to these files>.
{
  const counts = localeCounts.bn || { written: 0, pages: 0 };
  const toBn = (value) => String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const pct = counts.pages ? counts.written / counts.pages : 0;
  const color =
    pct >= 0.85
      ? "brightgreen"
      : pct >= 0.6
        ? "green"
        : pct >= 0.3
          ? "yellowgreen"
          : pct >= 0.1
            ? "orange"
            : "red";
  const badge = (label, message) =>
    JSON.stringify({
      schemaVersion: 1,
      label,
      message,
      color,
      cacheSeconds: 3600,
    }) + "\n";
  fs.writeFileSync(
    path.join(root, "public", "progress.json"),
    badge("লেখা শেষ", `${toBn(counts.written)}/${toBn(counts.pages)} পাতা`),
  );
  fs.writeFileSync(
    path.join(root, "public", "progress.en.json"),
    badge("pages written", `${counts.written}/${counts.pages}`),
  );
  console.log(
    `progress badges: ${counts.written}/${counts.pages} bn pages written`,
  );
}
