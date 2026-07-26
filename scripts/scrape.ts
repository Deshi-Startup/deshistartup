import fs from 'fs/promises';
import path from 'path';
import { Agent as HttpsAgent } from 'https';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import robotsParser from 'robots-parser';

const SOURCES_FILE = './knowledge-bank/sources.json';
const OUTPUT_DIR = './knowledge-bank';
const LOG_FILE = './knowledge-bank/scrape-log.json';
const DELAY_MS = Number(process.env.SCRAPE_DELAY_MS || 1000);
const MAX_DEPTH = Number(process.env.SCRAPE_MAX_DEPTH || 2);
const REQUEST_TIMEOUT_MS = Number(process.env.SCRAPE_TIMEOUT_MS || 25000);
const MAX_VISITS_PER_SOURCE = Number(process.env.SCRAPE_MAX_VISITS || 28);
const ALLOW_INSECURE_TLS = process.env.SCRAPE_ALLOW_INSECURE_TLS !== 'false';
const SOURCE_LIMIT = Number(process.env.SCRAPE_SOURCE_LIMIT || 0);
const ONLY_PATTERN = process.env.SCRAPE_ONLY ? new RegExp(process.env.SCRAPE_ONLY, 'i') : null;
const POLISH_CONTENT = process.env.SCRAPE_POLISH === 'true';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);
const POLISH_INPUT_LIMIT = Number(process.env.SCRAPE_POLISH_INPUT_LIMIT || 18000);
const USER_AGENT = 'Mozilla/5.0 (compatible; DeshiStartupBot/2.0; +https://deshistartup.com)';

const PAGE_LIMITS = {
  1: Number(process.env.SCRAPE_TIER_1_LIMIT || 14),
  2: Number(process.env.SCRAPE_TIER_2_LIMIT || 10),
  3: Number(process.env.SCRAPE_TIER_3_LIMIT || 8),
  4: Number(process.env.SCRAPE_TIER_4_LIMIT || 6),
  reference: Number(process.env.SCRAPE_REFERENCE_LIMIT || 8)
};

const insecureHttpsAgent = new HttpsAgent({ rejectUnauthorized: false });

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
});

turndownService.remove(['script', 'style', 'svg', 'iframe', 'noscript', 'form', 'img', 'picture', 'source']);

const stopwords = new Set([
  'and', 'for', 'the', 'with', 'from', 'use', 'source', 'resources', 'guidance',
  'pages', 'current', 'context', 'information', 'official', 'highest', 'high',
  'medium', 'track', 'needed', 'useful', 'relevant'
]);

const blocklistPatterns = [
  /\/(login|signin|signup|register|admin|dashboard|account|cart|checkout)(\/|$|\?)/i,
  /\/cdn-cgi\//i,
  /\/(officers?|office-heads?|annual-reports?|innovation-corners?|info-officers)(\/|$|\?)/i,
  /\/(tag|tags|author|category|wp-admin|wp-login|privacy-policy|terms|terms-of-service|refund-policy)(\/|$|\?)/i,
  /\/(people|team|portfolio|legal|contact|about-us?)\/?$/i,
  /\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|rar|doc|docx|xls|xlsx|xlsb|ppt|pptx)$/i,
  /^mailto:/i,
  /^tel:/i,
  /^javascript:/i
];

const priorityTerms = [
  'startup', 'start-up', 'entrepreneur', 'business', 'company', 'registration',
  'register', 'license', 'licence', 'trade', 'tax', 'vat', 'tin', 'bin', 'return',
  'compliance', 'investment', 'investor', 'fund', 'grant', 'accelerator', 'incubation',
  'policy', 'guideline', 'regulation', 'payment', 'foreign', 'export', 'import',
  'sme', 'fees', 'forms', 'application', 'one-stop', 'oss', 'faq'
];

const boilerplateSelectors = [
  'script', 'style', 'svg', 'iframe', 'noscript', 'form', 'nav', 'footer', 'header',
  'img', 'picture', 'source',
  '.nav', '.navbar', '.navigation', '.menu', '.footer', '.header', '.sidebar',
  '.breadcrumb', '.breadcrumbs', '.share', '.social', '.cookie', '.popup', '.modal',
  '.advertisement', '.ads', '.related-posts', '.comments', '#comments'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const urlObj = new URL(url);

  try {
    const agent = ALLOW_INSECURE_TLS && urlObj.protocol === 'https:' ? insecureHttpsAgent : undefined;

    return await fetch(url, {
      ...options,
      agent: options.agent === undefined ? agent : options.agent,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 90);

  return slug || 'index';
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  const urlObj = new URL(url);
  urlObj.hash = '';

  for (const key of [...urlObj.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|mc_|ref$|share$)/i.test(key)) {
      urlObj.searchParams.delete(key);
    }
  }

  if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
    urlObj.pathname = urlObj.pathname.slice(0, -1);
  }

  return urlObj.href;
}

function isSameDomain(baseUrl, targetUrl) {
  return getDomain(baseUrl) === getDomain(targetUrl);
}

function tokenize(text = '') {
  return Array.from(new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopwords.has(term))
  ));
}

function getFocusTerms(source) {
  return tokenize(`${source.source} ${source.category} ${source.research_focus} ${source.notes}`);
}

function shouldBlock(url) {
  return blocklistPatterns.some(pattern => pattern.test(url));
}

function scoreUrl(url, source, anchorText = '') {
  const urlObj = new URL(url);
  const haystack = `${urlObj.pathname} ${urlObj.search} ${anchorText}`.toLowerCase();
  const focusTerms = getFocusTerms(source);
  let score = 0;

  for (const term of focusTerms) {
    if (haystack.includes(term)) score += 4;
  }

  for (const term of priorityTerms) {
    if (haystack.includes(term)) score += 2;
  }

  if (url === normalizeUrl(source.url)) score += 12;
  if (urlObj.pathname === '/' || urlObj.pathname === '') score += 2;
  if (urlObj.pathname.split('/').filter(Boolean).length > 3) score -= 4;
  if (urlObj.searchParams.size > 3) score -= 3;

  return score;
}

async function loadRobotsTxt(url) {
  const urlObj = new URL(url);
  const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;

  try {
    const response = await fetchWithTimeout(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT }
    }, 10000);

    if (response.ok) {
      return robotsParser(robotsUrl, await response.text());
    }
  } catch {
    console.log('  Could not load robots.txt');
  }

  return null;
}

async function getRobotsForUrl(url, robotsCache) {
  const origin = new URL(url).origin;

  if (!robotsCache.has(origin)) {
    robotsCache.set(origin, await loadRobotsTxt(url));
  }

  return robotsCache.get(origin);
}

async function fetchPage(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    throw new Error(`Not HTML: ${contentType || 'missing content-type'}`);
  }

  return {
    html: await response.text(),
    finalUrl: normalizeUrl(response.url || url)
  };
}

function extractLinks(html, baseUrl, source) {
  const $ = cheerio.load(html);
  const links = new Map();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href || shouldBlock(href)) return;

    try {
      const url = normalizeUrl(new URL(href, baseUrl).href);
      if (!isSameDomain(baseUrl, url) || shouldBlock(url)) return;

      const anchorText = $(element).text().replace(/\s+/g, ' ').trim();
      const current = links.get(url);
      const score = scoreUrl(url, source, anchorText);

      if (!current || score > current.score) {
        links.set(url, { url, score });
      }
    } catch {
      // Ignore malformed links.
    }
  });

  return [...links.values()]
    .filter(link => link.score >= 2)
    .sort((a, b) => b.score - a.score)
    .map(link => link.url);
}

function pickContentRoot($) {
  const candidates = [
    'main',
    'article',
    '[role="main"]',
    '.entry-content',
    '.post-content',
    '.page-content',
    '.content',
    '.main-content',
    '#content',
    '#main',
    'body'
  ];

  let best = $('body').first();
  let bestLength = best.text().replace(/\s+/g, ' ').trim().length;

  for (const selector of candidates) {
    $(selector).each((_, element) => {
      const candidate = $(element);
      const length = candidate.text().replace(/\s+/g, ' ').trim().length;
      if (length > bestLength) {
        best = candidate;
        bestLength = length;
      }
    });
  }

  return best;
}

function removeLinkHeavyBlocks($) {
  $('aside, nav, section, div, ul').each((_, element) => {
    const block = $(element);
    const links = block.find('a[href]').length;
    if (links < 8) return;

    const textLength = block.text().replace(/\s+/g, ' ').trim().length;
    const paragraphCount = block.find('p').length;

    if (paragraphCount < 3 || textLength / links < 80) {
      block.remove();
    }
  });
}

function htmlToMarkdown(html, url) {
  const $ = cheerio.load(html);
  $(boilerplateSelectors.join(',')).remove();
  removeLinkHeavyBlocks($);
  $('a').each((_, element) => {
    const link = $(element);
    if (link.text().replace(/\s+/g, '').length === 0) {
      link.remove();
    }
  });

  const title = (
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text() ||
    $('title').text() ||
    'Untitled'
  ).replace(/\s+/g, ' ').trim();

  const root = pickContentRoot($);
  root.find(boilerplateSelectors.join(',')).remove();
  removeLinkHeavyBlocks($);

  const markdown = turndownService
    .turndown(root.html() || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, markdown };
}

function contentQuality(markdown, source, pageScore) {
  const text = markdown.replace(/[#>*_`[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean);
  const focusTerms = getFocusTerms(source);
  const lower = text.toLowerCase();
  const matchedTerms = focusTerms.filter(term => lower.includes(term));
  const priorityMatches = priorityTerms.filter(term => lower.includes(term));
  const requiresBangladesh = /bangladesh|bd\b/i.test(`${source.source} ${source.research_focus}`);
  const hasBangladesh = /\bbangladesh\b|\bbd\b/i.test(text);

  return {
    words: words.length,
    matched_terms: matchedTerms.slice(0, 20),
    priority_matches: priorityMatches.slice(0, 20),
    usable: words.length >= 120 &&
      pageScore >= 2 &&
      (!requiresBangladesh || hasBangladesh) &&
      (matchedTerms.length >= 2 || priorityMatches.length >= 3)
  };
}

function quoteYaml(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function generateFrontmatter(source, url, title, quality, polished) {
  return `---\nsource: "${quoteYaml(source.source)}"\ntier: ${JSON.stringify(source.tier)}\ncategory: "${quoteYaml(source.category)}"\nurl: "${quoteYaml(url)}"\ntitle: "${quoteYaml(title)}"\nword_count: ${quality.words}\nmatched_terms: ${JSON.stringify(quality.matched_terms)}\npolished_by: ${polished ? JSON.stringify(OLLAMA_MODEL) : 'null'}\nscraped_at: "${new Date().toISOString()}"\n---\n\n`;
}

async function polishMarkdown(source, url, title, markdown) {
  if (!POLISH_CONTENT) return { markdown, polished: false };

  const prompt = `You are cleaning scraped website text for a Bangladesh startup knowledge bank.

Source: ${source.source}
Category: ${source.category}
Research focus: ${source.research_focus}
URL: ${url}
Page title: ${title}

Task:
- Rewrite the scraped markdown into concise, factual Markdown notes.
- Keep only information useful for founders, startup operators, investors, or business registration/compliance research.
- Preserve concrete facts, numbers, rules, fees, dates, eligibility, process steps, program names, and official service names.
- Remove navigation, repeated image alt text, slogans, cookie/form messages, unrelated marketing fluff, and duplicate sections.
- Do not invent facts. If the scraped text is thin or irrelevant, return exactly: INSUFFICIENT_RELEVANT_CONTENT
- Start with a short H1 or H2 matching the page topic, then use bullets/tables where helpful.
- Do not include frontmatter.

Scraped markdown:
${markdown.slice(0, POLISH_INPUT_LIMIT)}`;

  const response = await fetchWithTimeout(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 900
      }
    }),
    agent: false
  }, OLLAMA_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const polished = String(data.response || '').trim();

  if (
    !polished ||
    polished === 'INSUFFICIENT_RELEVANT_CONTENT' ||
    polished.split(/\s+/).length < 80
  ) {
    return { markdown, polished: false, rejected: true };
  }

  return { markdown: polished, polished: true };
}

async function savePage(source, url, title, markdown, outputDir, quality, usedFilenames, polished) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const baseName = pathParts.length === 0 ? 'index' : slugify(pathParts[pathParts.length - 1].split('.')[0]);
  let filename = `${baseName}.md`;
  let counter = 2;

  while (usedFilenames.has(filename)) {
    filename = `${baseName}-${counter}.md`;
    counter++;
  }

  usedFilenames.add(filename);

  const filepath = path.join(outputDir, filename);
  await fs.writeFile(
    filepath,
    generateFrontmatter(source, url, title, quality, polished) + markdown + '\n',
    'utf-8'
  );

  return filepath;
}

function getPageLimit(source) {
  return PAGE_LIMITS[source.tier] || PAGE_LIMITS.reference;
}

async function crawlSource(source, log) {
  const baseUrl = normalizeUrl(source.url);
  const domain = getDomain(baseUrl);

  if (!domain) {
    log.push({ source: source.source, status: 'skipped', reason: 'Invalid URL' });
    return;
  }

  const tierFolder = source.tier === 'reference' ? 'reference' : `tier-${source.tier}`;
  const outputDir = path.join(OUTPUT_DIR, tierFolder, domain);
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const metaContent = {
    source: source.source,
    category: source.category,
    tier: source.tier,
    trust_priority: source.trust_priority,
    research_focus: source.research_focus,
    base_url: source.url,
    notes: source.notes,
    page_limit: getPageLimit(source),
    max_visits: MAX_VISITS_PER_SOURCE,
    scraped_at: new Date().toISOString()
  };
  await fs.writeFile(path.join(outputDir, '_meta.json'), JSON.stringify(metaContent, null, 2), 'utf-8');

  console.log(`\n[${source.tier}] Scraping: ${source.source} (${domain})`);

  const robotsCache = new Map();
  const visited = new Set();
  const queued = new Set([baseUrl]);
  const queue = [{ url: baseUrl, depth: 0, score: scoreUrl(baseUrl, source) }];
  const errors = [];
  const skipped = [];
  const saved = [];
  const usedFilenames = new Set();
  const pageLimit = getPageLimit(source);

  while (queue.length > 0 && saved.length < pageLimit && visited.size < MAX_VISITS_PER_SOURCE) {
    queue.sort((a, b) => b.score - a.score || a.depth - b.depth);
    const { url, depth, score } = queue.shift();

    if (visited.has(url)) continue;
    visited.add(url);

    const robots = await getRobotsForUrl(url, robotsCache);
    if (robots && !robots.isAllowed(url, USER_AGENT)) {
      skipped.push({ url, reason: 'robots.txt' });
      continue;
    }

    try {
      await sleep(DELAY_MS);
      console.log(`  [${saved.length + 1}/${pageLimit}] Fetching: ${url}`);

      const { html, finalUrl } = await fetchPage(url);
      const { title, markdown } = htmlToMarkdown(html, finalUrl);
      const quality = contentQuality(markdown, source, score);

      if (!quality.usable) {
        skipped.push({ url: finalUrl, reason: 'low-quality-content', words: quality.words, score });
      } else {
        let content = markdown;
        let polished = false;

        try {
          const result = await polishMarkdown(source, finalUrl, title, markdown);
          content = result.markdown;
          polished = result.polished;
        } catch (error) {
          console.error(`  Polish skipped: ${error.message}`);
        }

        const filepath = await savePage(source, finalUrl, title, content, outputDir, quality, usedFilenames, polished);
        saved.push({ url: finalUrl, title, words: quality.words, polished, file: path.relative(OUTPUT_DIR, filepath) });
      }

      if (depth < MAX_DEPTH) {
        for (const link of extractLinks(html, finalUrl, source)) {
          if (!visited.has(link) && !queued.has(link)) {
            queued.add(link);
            queue.push({ url: link, depth: depth + 1, score: scoreUrl(link, source) });
          }
        }
      }
    } catch (error) {
      console.error(`  Error: ${url} - ${error.message}`);
      errors.push({ url, error: error.message });
    }
  }

  log.push({
    source: source.source,
    domain,
    tier: source.tier,
    status: saved.length > 0 ? 'completed' : 'empty',
    pages_scraped: saved.length,
    pages_visited: visited.size,
    visit_limit_reached: queue.length > 0 && saved.length < pageLimit,
    saved,
    skipped: skipped.slice(0, 30),
    errors: errors.length > 0 ? errors : undefined
  });

  console.log(`  Done: ${saved.length} useful pages saved (${visited.size} visited)`);
}

async function main() {
  console.log('Starting focused scraper...\n');

  const sources = JSON.parse(await fs.readFile(SOURCES_FILE, 'utf-8'));
  const log = [];
  let sourcesWithUrls = sources.filter(source => source.url && source.url.trim() !== '');
  const sourcesWithoutUrls = sources.filter(source => !source.url || source.url.trim() === '');

  if (ONLY_PATTERN) {
    sourcesWithUrls = sourcesWithUrls.filter(source =>
      ONLY_PATTERN.test(source.source) ||
      ONLY_PATTERN.test(source.url) ||
      ONLY_PATTERN.test(source.category)
    );
  }

  if (SOURCE_LIMIT > 0) {
    sourcesWithUrls = sourcesWithUrls.slice(0, SOURCE_LIMIT);
  }

  console.log(`Found ${sourcesWithUrls.length} sources with URLs`);
  console.log(`Skipping ${sourcesWithoutUrls.length} sources without URLs\n`);

  for (const source of sourcesWithoutUrls) {
    log.push({
      source: source.source,
      tier: source.tier,
      status: 'skipped',
      reason: 'No URL provided'
    });
  }

  for (const source of sourcesWithUrls) {
    try {
      await crawlSource(source, log);
    } catch (error) {
      console.error(`Fatal error for ${source.source}: ${error.message}`);
      log.push({
        source: source.source,
        tier: source.tier,
        status: 'failed',
        error: error.message
      });
    }
  }

  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');

  const completed = log.filter(entry => entry.status === 'completed').length;
  const empty = log.filter(entry => entry.status === 'empty').length;
  const skipped = log.filter(entry => entry.status === 'skipped').length;
  const failed = log.filter(entry => entry.status === 'failed').length;
  const pages = log.reduce((sum, entry) => sum + (entry.pages_scraped || 0), 0);

  console.log('\n\n=== Scraping Complete ===');
  console.log(`Log saved to: ${LOG_FILE}`);
  console.log(`Completed sources: ${completed}`);
  console.log(`Empty sources: ${empty}`);
  console.log(`Skipped sources: ${skipped}`);
  console.log(`Failed sources: ${failed}`);
  console.log(`Useful pages saved: ${pages}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
