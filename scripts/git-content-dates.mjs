import { execFileSync } from "node:child_process";

const CONTENT_PATH = "app/(contents)";

function runGit(root, args, options = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

export function gitRepositoryState(root) {
  try {
    const insideWorkTree = runGit(root, [
      "rev-parse",
      "--is-inside-work-tree",
    ]).trim();
    if (insideWorkTree !== "true") return { available: false, shallow: false };
    return {
      available: true,
      shallow:
        runGit(root, ["rev-parse", "--is-shallow-repository"]).trim() ===
        "true",
    };
  } catch {
    return { available: false, shallow: false };
  }
}

export function ensureFullGitHistory(root) {
  const initial = gitRepositoryState(root);
  if (!initial.available || !initial.shallow) {
    return { ...initial, fetched: false };
  }

  try {
    execFileSync("git", ["fetch", "--unshallow", "--tags"], {
      cwd: root,
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error(
      "SEO dates require complete Git history. This checkout is shallow and `git fetch --unshallow --tags` failed.",
      { cause: error },
    );
  }

  const refreshed = gitRepositoryState(root);
  if (refreshed.shallow) {
    throw new Error(
      "SEO dates require complete Git history, but this checkout is still shallow after fetching.",
    );
  }
  return { ...refreshed, fetched: true };
}

// One git pass: newest and oldest commit timestamp per content file. Rename
// detection walks history through URL migrations so a moved guide retains its
// original publication and modification timestamps.
export function collectGitDates(root, dataPaths = []) {
  const modified = new Map();
  const published = new Map();
  const modifiedAt = new Map();
  const publishedAt = new Map();
  const alias = new Map(); // historical path -> current path
  const resolve = (file) => {
    let current = file;
    while (alias.has(current)) current = alias.get(current);
    return current;
  };

  const repository = gitRepositoryState(root);
  if (!repository.available) {
    return { modified, published, modifiedAt, publishedAt };
  }
  if (repository.shallow) {
    throw new Error(
      "SEO dates require complete Git history. Run `npm run history:ensure` before generating manifests.",
    );
  }

  const log = runGit(root, [
    "log",
    "--format=C%cI",
    "--name-status",
    "-M",
    "--",
    CONTENT_PATH,
    ...dataPaths,
  ]);
  let currentTimestamp = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("C")) {
      currentTimestamp = line.slice(1).trim();
      continue;
    }
    if (!line.trim() || !currentTimestamp) continue;
    const parts = line.split("\t");
    const status = parts[0];
    let file = null;
    if (status.startsWith("R") && parts.length >= 3) {
      // Log runs newest -> oldest: map the pre-rename path onto the file's
      // current (already-resolved) path for all older commits.
      const canonical = resolve(parts[2].trim());
      alias.set(parts[1].trim(), canonical);
      file = canonical;
    } else if (parts.length >= 2) {
      file = resolve(parts[1].trim());
    }
    if (!file) continue;
    const currentDate = currentTimestamp.slice(0, 10);
    if (!modified.has(file)) {
      modified.set(file, currentDate);
      modifiedAt.set(file, currentTimestamp);
    }
    published.set(file, currentDate);
    publishedAt.set(file, currentTimestamp);
  }

  return { modified, published, modifiedAt, publishedAt };
}
