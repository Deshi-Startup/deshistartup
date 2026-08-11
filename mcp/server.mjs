#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { createContentCatalog, formatGuideForTool } from "./content.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const localeSchema = z
  .enum(["bn", "en", "both"])
  .default("both")
  .describe("Bengali (bn), English (en), or both locales");

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

function jsonResult(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}

export function registerCatalog(server, catalog) {
  server.registerResource(
    "guide-catalog",
    "deshistartup://catalog/guides",
    {
      title: "Deshi Startup guide catalog",
      description:
        "Metadata for every completed Bengali and English guide in the local repository",
      mimeType: "application/json",
    },
    async (uri) => {
      const result = catalog.listGuides({
        includeStubs: false,
        limit: catalog.guides.length,
      });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result.items),
          },
        ],
      };
    },
  );

  for (const guide of catalog.guides.filter((entry) => !entry.stub)) {
    const resourceName = [
      "guide",
      guide.locale,
      guide.slug || "home",
    ].join(":");
    server.registerResource(
      resourceName,
      guide.resourceUri,
      {
        title: guide.fullTitle,
        description: guide.description,
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: guide.content,
          },
        ],
      }),
    );
  }

  server.registerTool(
    "list_sections",
    {
      title: "List Deshi Startup sections",
      description:
        "List content sections and their completed-guide and stub counts by locale.",
      inputSchema: z.object({ locale: localeSchema }),
      annotations: readOnlyAnnotations,
    },
    async ({ locale }) => jsonResult(catalog.listSections({ locale })),
  );

  server.registerTool(
    "list_guides",
    {
      title: "List Deshi Startup guides",
      description:
        "Browse guide metadata by locale or section. Stubs are excluded unless explicitly requested.",
      inputSchema: z.object({
        locale: localeSchema,
        section: z
          .string()
          .min(1)
          .optional()
          .describe("Optional top-level route segment, such as registration"),
        include_stubs: z
          .boolean()
          .default(false)
          .describe("Include planned pages that are not complete guides"),
        offset: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(200).default(50),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ locale, section, include_stubs, offset, limit }) =>
      jsonResult(
        catalog.listGuides({
          locale,
          section,
          includeStubs: include_stubs,
          offset,
          limit,
        }),
      ),
  );

  server.registerTool(
    "search_guides",
    {
      title: "Search Deshi Startup guides",
      description:
        "Full-text search across guide titles, descriptions, routes, and authored MDX content. Stubs are excluded by default.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Words or phrase to search for"),
        locale: localeSchema,
        section: z
          .string()
          .min(1)
          .optional()
          .describe("Optional top-level route segment"),
        include_stubs: z.boolean().default(false),
        offset: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(50).default(10),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ query, locale, section, include_stubs, offset, limit }) =>
      jsonResult(
        catalog.searchGuides({
          query,
          locale,
          section,
          includeStubs: include_stubs,
          offset,
          limit,
        }),
      ),
  );

  server.registerTool(
    "get_guide",
    {
      title: "Read a Deshi Startup guide",
      description:
        "Read one authored guide by root-relative route, deshistartup.com URL, or deshistartup:// resource URI. Returns metadata and the MDX body with citations intact.",
      inputSchema: z.object({
        path: z
          .string()
          .min(1)
          .describe(
            "For example /registration/private-limited or /en/registration/private-limited",
          ),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ path: requestedPath }) => {
      const guide = catalog.getGuide(requestedPath);
      if (!guide) {
        return {
          content: [
            {
              type: "text",
              text: `No authored Deshi Startup page matches ${requestedPath}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: formatGuideForTool(guide) }],
      };
    },
  );

  return server;
}

export async function createDeshiStartupServer(root = projectRoot) {
  const catalog = await createContentCatalog(root);
  const server = new McpServer({
    name: "deshi-startup-content",
    version: "1.0.0",
  });
  return registerCatalog(server, catalog);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const catalog = await createContentCatalog(projectRoot);
  const handle = serveStdio(() => {
    const server = new McpServer({
      name: "deshi-startup-content",
      version: "1.0.0",
    });
    return registerCatalog(server, catalog);
  });

  process.on("SIGINT", () => {
    void handle.close();
  });

  console.error("Deshi Startup MCP server running on stdio");
}
