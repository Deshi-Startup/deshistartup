#!/usr/bin/env node
/**
 * Builds navigation manifests from the content tree so navigation,
 * section hubs, stub badges, and "last updated" dates never need
 * hand-maintenance. Contributors only add/edit page.mdx files.
 *
 * Outputs:
 *   app/generated/manifest.bn.json  – full locale tree for build/reporting
 *   app/generated/manifest.en.json
 *   app/generated/content-index.json – compact tree used by rendered hub UI
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

// A directory page is a shell around data/directory/*.json. With no rows it is
// as unwritten as a StubNotice page, so it must not be counted as written,
// indexed, or listed in the sitemap and llms.txt. Flips back on its own as soon
// as entries land, so no page edit is needed when the data arrives.
function rendersEmptyDirectory(source) {
  const match = source.match(/<DirectoryList[^>]*\bcategory=["']([^"']+)["']/);
  if (!match) return false;
  const dataPath = path.join(root, "data", "directory", `${match[1]}.json`);
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8")).length === 0;
  } catch {
    // Missing or unparseable data renders nothing either way.
    return true;
  }
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
const localeManifests = {};
const seoPages = [];

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue;
  const relPages = walkPages(locale.dir, locale.dir);

  const pages = relPages.map((rel) => {
    const filePath = path.join(locale.dir, rel === "" ? "" : rel, "page.mdx");
    const source = fs.readFileSync(filePath, "utf8");
    const fm = parseFrontmatter(source);
    const title = fm.title || firstHeading(source) || rel;
    const isStub =
      source.includes("<StubNotice") || rendersEmptyDirectory(source);
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
      repoPath,
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
  localeManifests[locale.key] = manifest;

  fs.writeFileSync(
    path.join(generatedDir, `manifest.${locale.key}.json`),
    JSON.stringify(manifest, null, 1),
  );
  console.log(
    `manifest.${locale.key}.json: ${pages.length} pages (${manifest.counts.written} written, ${manifest.counts.stubs} stubs)`,
  );
}

// Route allowlist for the inline contribution editor. Source paths and locale
// are derived only after a route passes this generated allowlist.
// Landing pages ("/" and "/en") are excluded — they are hubs, not articles.
{
  const contributable = [];
  for (const locale of LOCALES) {
    for (const page of llmsPages[locale.key] || []) {
      if (page.route === "/" || page.route === "/en") continue;
      contributable.push(page.route);
    }
  }
  contributable.sort();
  fs.writeFileSync(
    path.join(generatedDir, "contributable.json"),
    JSON.stringify(contributable, null, 1),
  );
  console.log(
    `contributable.json: ${contributable.length} editable routes`,
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

// Compact, presentation-specific tree for the rendered hubs. The full manifests
// remain useful build artifacts, but importing them into server components made
// every title, repeated stub description, verification date and full title part
// of the Worker. Tuples keep this runtime index small while named tuple types in
// the consuming components preserve readability.
{
  const groupsConfig = JSON.parse(
    fs.readFileSync(path.join(root, "app", "nav-groups.json"), "utf8"),
  );
  const contentIndex = {};
  const compactPage = (page) =>
    page
      ? [
          page.route,
          page.title,
          page.stub ? 1 : 0,
          page.stub ? null : page.description || null,
        ]
      : null;

  for (const locale of LOCALES) {
    const manifest = localeManifests[locale.key];
    if (!manifest) continue;
    const sections = {};

    for (const [slug, section] of Object.entries(manifest.sections)) {
      const byChildSlug = new Map(
        section.children.map((page) => [
          page.slug.split("/").slice(1).join("/"),
          page,
        ]),
      );
      const configuredGroups = groupsConfig[slug] || [];
      const groupedSlugs = new Set(
        configuredGroups.flatMap((group) => group.slugs),
      );
      const groups = configuredGroups
        .map((group) => [
          group[locale.key],
          group.slugs
            .map((childSlug) => byChildSlug.get(childSlug))
            .filter(Boolean)
            .map(compactPage),
        ])
        .filter((group) => group[1].length > 0);
      const leftovers = section.children.filter(
        (page) =>
          !groupedSlugs.has(page.slug.split("/").slice(1).join("/")),
      );
      if (leftovers.length > 0) {
        groups.push([
          locale.key === "en" ? "More guides" : "আরও গাইড",
          leftovers.map(compactPage),
        ]);
      }

      sections[slug] = [
        section.title,
        section.total,
        section.written,
        compactPage(section.index),
        groups,
      ];
    }

    const recent = Object.values(manifest.sections)
      .flatMap((section) => [section.index, ...section.children])
      .filter((page) => page && !page.stub && page.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((page) => [page.route, page.title, page.date]);

    contentIndex[locale.key] = {
      counts: [manifest.counts.written, manifest.counts.stubs],
      recent,
      sections,
    };
  }

  fs.writeFileSync(
    path.join(generatedDir, "content-index.json"),
    JSON.stringify(contentIndex, null, 1),
  );
  console.log("content-index.json written");
}

// Tiny client-safe map (section slug -> title) for breadcrumbs.
const lite = {};
for (const locale of LOCALES) {
  const manifest = localeManifests[locale.key];
  if (!manifest) continue;
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
