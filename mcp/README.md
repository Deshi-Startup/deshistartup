# Deshi Startup MCP server

This read-only stdio server exposes the authored content under `app/(contents)/` to MCP clients.
It scans the Bengali and English source trees when it starts, so no separate content database or
hand-maintained index is required.

## Capabilities

- `list_sections` — section names and completed/stub counts
- `list_guides` — paginated guide metadata
- `search_guides` — full-text search across metadata and MDX content
- `get_guide` — one guide with metadata, citations, and MDX components intact
- `deshistartup://catalog/guides` — JSON catalog resource
- `deshistartup://guide/...` — one Markdown resource per completed guide

Stubs are hidden by default. Pass `include_stubs: true` to the list or search tool when planned
topics are relevant.

## Install and run

From the repository root:

```bash
npm --prefix mcp install
npm run mcp
```

The process communicates over stdio, so it waits silently for an MCP client. Its startup message
is written to stderr and does not interfere with the protocol stream.

## Client configuration

Point an MCP host at the server using an absolute path:

```json
{
  "mcpServers": {
    "deshistartup": {
      "command": "node",
      "args": [
        "/absolute/path/to/deshistartup/mcp/server.mjs"
      ]
    }
  }
}
```

The exact outer configuration key varies by MCP host. No environment variables or credentials are
needed because the server reads only the local repository.

## Verify

```bash
npm run test:mcp
npx @modelcontextprotocol/inspector node mcp/server.mjs
```

The Inspector command is optional and downloads the MCP Inspector if it is not already available.
