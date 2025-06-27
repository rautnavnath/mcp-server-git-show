#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, ensureGitRepo } from "./server.js";

async function main() {
  const args = process.argv.slice(2);
  let initialCwd: string | undefined;
  for (const arg of args) {
    if (arg.startsWith("cwd=")) {
      initialCwd = arg.substring(4);
      break;
    }
  }

  if (initialCwd) {
    try {
      process.chdir(initialCwd);
      console.error(`Changed working directory to: ${initialCwd}`);
    } catch (error) {
      console.error(`Error changing directory to ${initialCwd}:`, error);
      process.exit(1);
    }
  }

  // Ensure we are in a git repo before starting
  console.error(`Attempting to ensure Git repo in: ${process.cwd()}`);
  if (!ensureGitRepo()) {
    console.error("Error: MCP server must be started within a git repository. Exiting.");
    process.exit(1);
  }
  console.error("Successfully ensured Git repo.");
  const server: McpServer = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitShow MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});