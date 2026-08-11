import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://deshistartup.com";

const LOCALES = [
  { key: "bn", directory: "(bn)", routePrefix: "" },
  { key: "en", directory: "en", routePrefix: "/en" },
];

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?/);
  const data = {};

  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const keyValue = line.match(/^(\w+):\s*(.*)$/);
      if (!keyValue) continue;

      let value = keyValue[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      data[keyValue[1]] = value;
    }
  }

  return { data, body: match ? source.slice(match[0].length) : source };
}

function firstHeading(source) {
  return source.match(/^#\s+(.+)$/m)?.[1].trim() ?? null;
}

async function walkPages(directory) {
  const pages = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await walkPages(absolutePath)));
    } else if (entry.isFile() && entry.name === "page.mdx") {
      pages.push(absolutePath);
    }
  }

  return pages;
}

async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function normalizeSearchValue(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resourceUriForRoute(route) {
  return `deshistartup://guide${route === "/" ? "/" : route}`;
}

function publicGuide(guide) {
  return {
    route: guide.route,
    locale: guide.locale,
    section: guide.section,
    title: guide.title,
    fullTitle: guide.fullTitle,
    description: guide.description,
    stub: guide.stub,
    updated: guide.updated,
    published: guide.published,
    verified: guide.verified,
    siteUrl: guide.siteUrl,
    resourceUri: guide.resourceUri,
  };
}

function matchesFilters(guide, { locale, section, includeStubs }) {
  return (
    (locale === "both" || guide.locale === locale) &&
    (!section || guide.section === section) &&
    (includeStubs || !guide.stub)
  );
}

function paginate(items, offset, limit) {
  return {
    total: items.length,
    offset,
    limit,
    items: items.slice(offset, offset + limit).map(publicGuide),
  };
}

export function normalizeGuideRoute(input) {
  let route = String(input ?? "").trim();
  if (!route) return null;

  if (route.startsWith("deshistartup://guide")) {
    try {
      route = new URL(route).pathname;
    } catch {
      return null;
    }
  } else if (/^https?:\/\//i.test(route)) {
    try {
      const url = new URL(route);
      if (!["deshistartup.com", "www.deshistartup.com"].includes(url.hostname)) {
        return null;
      }
      route = url.pathname;
    } catch {
      return null;
    }
  }

  if (!route.startsWith("/")) route = `/${route}`;
  route = route.split(/[?#]/, 1)[0];
  if (route.length > 1) route = route.replace(/\/+$/, "");

  try {
    route = decodeURIComponent(route);
  } catch {
    return null;
  }

  return /^\/(?:en(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?){0,2}|(?:[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)?|)$/.test(
    route,
  )
    ? route
    : null;
}

export async function createContentCatalog(projectRoot) {
  const contentRoot = path.join(projectRoot, "app", "(contents)");
  const [updatedDates, publishedDates] = await Promise.all([
    readJsonIfPresent(path.join(projectRoot, "public", "page-dates.json")),
    readJsonIfPresent(path.join(projectRoot, "public", "page-published.json")),
  ]);
  const guides = [];

  for (const locale of LOCALES) {
    const localeRoot = path.join(contentRoot, locale.directory);
    const files = await walkPages(localeRoot);

    for (const filePath of files) {
      const source = await fs.readFile(filePath, "utf8");
      const { data: frontmatter, body } = parseFrontmatter(source);
      const relativeDirectory = path
        .relative(localeRoot, path.dirname(filePath))
        .split(path.sep)
        .join("/");
      const route =
        relativeDirectory === ""
          ? locale.routePrefix || "/"
          : `${locale.routePrefix}/${relativeDirectory}`;
      const fullTitle =
        frontmatter.title ||
        firstHeading(body) ||
        relativeDirectory ||
        locale.key;
      const section = relativeDirectory.split("/")[0] || null;
      const content = body.trim();
      const title = fullTitle.split("–")[0].split("|")[0].trim();
      const description = frontmatter.description || "";
      const searchable = normalizeSearchValue(
        [title, fullTitle, description, route, content].join("\n"),
      );

      guides.push({
        route,
        locale: locale.key,
        slug: relativeDirectory,
        section,
        title,
        fullTitle,
        description,
        stub: source.includes("<StubNotice"),
        updated: updatedDates[route] || null,
        published: publishedDates[route] || null,
        verified: frontmatter.verified || null,
        siteUrl: new URL(route, SITE_URL).href,
        resourceUri: resourceUriForRoute(route),
        sourcePath: path.relative(projectRoot, filePath).split(path.sep).join("/"),
        content,
        searchable,
        normalizedTitle: normalizeSearchValue(fullTitle),
        normalizedDescription: normalizeSearchValue(description),
        normalizedRoute: normalizeSearchValue(route),
      });
    }
  }

  guides.sort((left, right) => {
    if (left.locale !== right.locale) return left.locale === "bn" ? -1 : 1;
    return left.route.localeCompare(right.route, "en");
  });

  const guidesByRoute = new Map(guides.map((guide) => [guide.route, guide]));

  return {
    guides,

    getGuide(input) {
      const route = normalizeGuideRoute(input);
      return route ? guidesByRoute.get(route) ?? null : null;
    },

    listGuides({
      locale = "both",
      section,
      includeStubs = false,
      offset = 0,
      limit = 50,
    } = {}) {
      const matches = guides.filter((guide) =>
        matchesFilters(guide, { locale, section, includeStubs }),
      );
      return paginate(matches, offset, limit);
    },

    listSections({ locale = "both" } = {}) {
      const sections = new Map();

      for (const guide of guides) {
        if (!guide.section || (locale !== "both" && guide.locale !== locale)) {
          continue;
        }
        const key = `${guide.locale}:${guide.section}`;
        const current = sections.get(key) ?? {
          locale: guide.locale,
          section: guide.section,
          title: guide.section,
          written: 0,
          stubs: 0,
        };
        if (guide.slug === guide.section) current.title = guide.title;
        if (guide.stub) current.stubs += 1;
        else current.written += 1;
        sections.set(key, current);
      }

      return [...sections.values()].sort((left, right) => {
        if (left.locale !== right.locale) return left.locale === "bn" ? -1 : 1;
        return left.section.localeCompare(right.section, "en");
      });
    },

    searchGuides({
      query,
      locale = "both",
      section,
      includeStubs = false,
      offset = 0,
      limit = 10,
    }) {
      const normalizedQuery = normalizeSearchValue(query);
      if (!normalizedQuery) return paginate([], offset, limit);

      const terms = normalizedQuery.split(" ");
      const matches = guides
        .filter((guide) =>
          matchesFilters(guide, { locale, section, includeStubs }),
        )
        .filter((guide) => terms.every((term) => guide.searchable.includes(term)))
        .map((guide) => {
          let score = 0;
          if (guide.normalizedTitle === normalizedQuery) score += 200;
          if (guide.normalizedTitle.includes(normalizedQuery)) score += 100;
          if (guide.normalizedDescription.includes(normalizedQuery)) score += 50;
          if (guide.normalizedRoute.includes(normalizedQuery)) score += 40;
          if (guide.searchable.includes(normalizedQuery)) score += 20;

          for (const term of terms) {
            if (guide.normalizedTitle.includes(term)) score += 10;
            if (guide.normalizedDescription.includes(term)) score += 5;
            if (guide.normalizedRoute.includes(term)) score += 3;
          }
          return { guide, score };
        })
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.guide.title.localeCompare(right.guide.title, "en"),
        )
        .map(({ guide }) => guide);

      return paginate(matches, offset, limit);
    },
  };
}

export function formatGuideForTool(guide) {
  const metadata = {
    ...publicGuide(guide),
    sourcePath: guide.sourcePath,
  };

  return `${JSON.stringify(metadata, null, 2)}\n\n---\n\n${guide.content}`;
}
