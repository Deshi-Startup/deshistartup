import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createContentCatalog,
  normalizeGuideRoute,
} from "./content.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const catalog = await createContentCatalog(projectRoot);

test("indexes authored pages from both locale trees", () => {
  assert.ok(catalog.guides.length > 800);
  assert.ok(catalog.getGuide("/start-here"));
  assert.ok(catalog.getGuide("/en/start-here"));
});

test("normalizes local routes, site URLs, and MCP resource URIs", () => {
  assert.equal(
    normalizeGuideRoute("https://deshistartup.com/en/start-here?ref=test"),
    "/en/start-here",
  );
  assert.equal(
    normalizeGuideRoute("deshistartup://guide/registration/private-limited"),
    "/registration/private-limited",
  );
  assert.equal(normalizeGuideRoute("../../package.json"), null);
  assert.equal(normalizeGuideRoute("https://example.com/start-here"), null);
});

test("excludes stubs by default and can include them explicitly", () => {
  const defaultResult = catalog.listGuides({ locale: "bn", limit: 1000 });
  const withStubs = catalog.listGuides({
    locale: "bn",
    includeStubs: true,
    limit: 1000,
  });

  assert.ok(defaultResult.items.every((guide) => !guide.stub));
  assert.ok(withStubs.items.some((guide) => guide.stub));
  assert.ok(withStubs.total > defaultResult.total);
});

test("full-text search returns guide metadata and resource URIs", () => {
  const result = catalog.searchGuides({
    query: "private limited",
    locale: "en",
    limit: 10,
  });

  assert.ok(result.total > 0);
  assert.ok(result.items.some((guide) => guide.route.includes("private-limited")));
  assert.ok(
    result.items.every((guide) =>
      guide.resourceUri.startsWith("deshistartup://guide"),
    ),
  );
});

test("section listing reports both completed guides and stubs", () => {
  const sections = catalog.listSections({ locale: "en" });
  const registration = sections.find(
    (section) => section.section === "registration",
  );

  assert.ok(registration);
  assert.ok(registration.written > 0);
  assert.ok(registration.stubs > 0);
});
