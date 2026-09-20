import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import {
  collectGitDates,
  ensureFullGitHistory,
} from "./git-content-dates.mjs";
import { datesForPage, PAGE_DATA_PATHS } from './page-data-inputs.mjs';

function git(root, args, env = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function commit(root, message, timestamp) {
  git(root, ["add", "."]);
  git(root, ["commit", "-m", message], {
    GIT_AUTHOR_DATE: timestamp,
    GIT_COMMITTER_DATE: timestamp,
  });
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "deshi-git-dates-"));
  git(root, ["init", "--initial-branch=main"]);
  git(root, ["config", "user.name", "Deshi Test"]);
  git(root, ["config", "user.email", "test@example.com"]);

  const oldDir = path.join(root, "app", "(contents)", "en", "old-route");
  mkdirSync(oldDir, { recursive: true });
  writeFileSync(path.join(oldDir, "page.mdx"), "# Original\n\nBody\n");
  commit(root, "Publish guide", "2026-07-04T04:28:22+06:00");

  const newDir = path.join(root, "app", "(contents)", "en", "new-route");
  mkdirSync(path.dirname(newDir), { recursive: true });
  renameSync(oldDir, newDir);
  commit(root, "Move guide", "2026-07-11T18:31:42+02:00");

  writeFileSync(path.join(newDir, "page.mdx"), "# Updated\n\nBody\n");
  commit(root, "Move and update guide", "2026-08-15T00:07:35+02:00");

  return root;
}

test("collectGitDates preserves full publication and modification timestamps through a rename", () => {
  const root = fixture();
  try {
    const repoPath = "app/(contents)/en/new-route/page.mdx";
    const dates = collectGitDates(root);
    assert.equal(dates.published.get(repoPath), "2026-07-04");
    assert.equal(
      dates.publishedAt.get(repoPath),
      "2026-07-04T04:28:22+06:00",
    );
    assert.equal(dates.modified.get(repoPath), "2026-08-15");
    assert.equal(
      dates.modifiedAt.get(repoPath),
      "2026-08-15T00:07:35+02:00",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("collectGitDates rejects shallow history and ensureFullGitHistory repairs it", () => {
  const source = fixture();
  const parent = mkdtempSync(path.join(os.tmpdir(), "deshi-shallow-clone-"));
  const clone = path.join(parent, "repo");
  try {
    git(parent, [
      "clone",
      "--depth",
      "1",
      pathToFileURL(source).href,
      clone,
    ]);
    assert.throws(
      () => collectGitDates(clone),
      /SEO dates require complete Git history/,
    );
    const repaired = ensureFullGitHistory(clone);
    assert.equal(repaired.fetched, true);
    assert.equal(repaired.shallow, false);
    assert.equal(
      collectGitDates(clone).published.get(
        "app/(contents)/en/new-route/page.mdx",
      ),
      "2026-07-04",
    );
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(parent, { recursive: true, force: true });
  }
});

test('rendered data updates modification dates in both locales without changing publication or verification', () => {
  const root = fixture();
  try {
    const en = 'app/(contents)/en/maps/page.mdx';
    const bn = 'app/(contents)/(bn)/maps/page.mdx';
    for (const file of [en, bn, 'data/maps/urban.json', 'data/maps/census.json']) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), '{}');
    }
    commit(root, 'Publish Maps', '2026-08-20T10:00:00+06:00');
    writeFileSync(path.join(root, 'data/maps/urban.json'), '{"updated":true}');
    commit(root, 'Update urban data', '2026-08-22T02:00:00+06:00');
    writeFileSync(path.join(root, 'data/maps/census.json'), '{"updated":true}');
    // Later instant despite the earlier calendar date in this timezone.
    commit(root, 'Update census data', '2026-08-21T23:00:00+02:00');
    writeFileSync(path.join(root, 'README.md'), 'Unrelated update');
    commit(root, 'Update docs', '2026-08-30T10:00:00+06:00');
    const dates = collectGitDates(root, PAGE_DATA_PATHS);
    for (const repoPath of [en, bn]) {
      assert.deepEqual(datesForPage(dates, { repoPath, slug: 'maps', verified: '2026-08-19' }), {
        date: '2026-08-21', modifiedAt: '2026-08-21T23:00:00+02:00',
        published: '2026-08-20', publishedAt: '2026-08-20T10:00:00+06:00'
      });
    }
    assert.equal(datesForPage(dates, { repoPath: 'app/(contents)/en/new-route/page.mdx', slug: 'new-route' }).date, '2026-08-15');
    const empty = { modifiedAt: new Map(), published: new Map(), publishedAt: new Map() };
    assert.deepEqual(datesForPage(empty, { repoPath: en, slug: 'maps', verified: '2026-08-19' }), {
      date: '2026-08-19', modifiedAt: null, published: null, publishedAt: null
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ecosystem reading dates follow the public release without dating forms or unrelated guides', () => {
  const snapshot = 'data/ecosystem/public.json';
  assert.ok(PAGE_DATA_PATHS.includes(snapshot));
  const dates = {
    modifiedAt: new Map([[snapshot, '2026-09-20T10:00:00Z']]),
    published: new Map(), publishedAt: new Map()
  };
  for (const slug of ['startup-ideas', 'startup-ideas/harvest-cooling', 'companies', 'companies/pathao']) {
    for (const locale of ['en', '(bn)']) {
      const result = datesForPage(dates, { repoPath: `app/(contents)/${locale}/${slug}/page.mdx`, slug });
      assert.equal(result.modifiedAt, '2026-09-20T10:00:00Z', slug);
      assert.equal(result.publishedAt, null);
    }
  }
  for (const slug of ['startup-ideas/add', 'startup-ideas/add-company', 'startup-ideas/review', 'metrics/unit-economics']) {
    assert.equal(datesForPage(dates, { repoPath: `app/(contents)/en/${slug}/page.mdx`, slug }).modifiedAt, null);
  }
});
