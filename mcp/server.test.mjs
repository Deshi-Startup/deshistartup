import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const serverPath = path.join(projectRoot, "mcp", "server.mjs");

function startClient() {
  const child = spawn(process.execPath, [serverPath], {
    cwd: projectRoot,
    stdio: ["pipe", "pipe", "pipe"],
  });
  const pending = new Map();
  let buffer = "";

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      const deferred = pending.get(message.id);
      if (deferred) {
        pending.delete(message.id);
        deferred.resolve(message);
      }
    }
  });

  function send(message) {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  function request(id, method, params = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, 5_000);
      timeout.unref();
      pending.set(id, {
        resolve(message) {
          clearTimeout(timeout);
          resolve(message);
        },
      });
      send({ jsonrpc: "2.0", id, method, params });
    });
  }

  return { child, request, send };
}

test("serves tools and guide resources over MCP stdio", async (context) => {
  const client = startClient();
  context.after(() => {
    client.child.kill("SIGINT");
  });

  const initialized = await client.request(1, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "deshistartup-test", version: "1.0.0" },
  });
  assert.equal(initialized.result.serverInfo.name, "deshi-startup-content");
  client.send({
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  });

  const tools = await client.request(2, "tools/list");
  assert.deepEqual(
    tools.result.tools.map((tool) => tool.name),
    ["list_sections", "list_guides", "search_guides", "get_guide"],
  );

  const search = await client.request(3, "tools/call", {
    name: "search_guides",
    arguments: { query: "private limited", locale: "en", limit: 2 },
  });
  const searchResult = JSON.parse(search.result.content[0].text);
  assert.ok(searchResult.total > 0);
  assert.ok(searchResult.items.some((guide) => !guide.stub));

  const resource = await client.request(4, "resources/read", {
    uri: "deshistartup://guide/en/start-here",
  });
  assert.equal(resource.result.contents[0].mimeType, "text/markdown");
  assert.match(resource.result.contents[0].text, /^#\s+/);
});
