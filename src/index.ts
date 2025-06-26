#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, ensureGitRepo } from "./server.js";

async function main() {
  // Ensure we are in a git repo before starting
  if (!ensureGitRepo()) {
    console.error("Error: MCP server must be started within a git repository.");
    process.exit(1);
  }
  const server: McpServer = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitShow MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});