import { execSync } from "node:child_process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import { exec } from "node:child_process";

export function ensureGitRepo(): boolean {
  try {
    const root = execSync("git rev-parse --show-toplevel").toString().trim();
    process.chdir(root);
    console.error("📁 MCP server running in directory:", process.cwd());
    return true;
  } catch (err) {
    console.error("❌ Not in a Git repo or can't resolve root:", err);
    return false;
  }
}

// ...existing code for createServer()...

const REGISTERED_TOOLS: string[] = [];

function getGitRoot(): string | null {
  try {
    const root = execSync("git rev-parse --show-toplevel").toString().trim();
    return root;
  } catch (err) {
    console.warn("❌ Not in a Git repo or can't resolve root:", err);
    return null;
  }
}

const gitRoot = getGitRoot();
if (gitRoot) {
  process.chdir(gitRoot);
}
console.error("📁 MCP server running in directory:", process.cwd());

export function createServer(): McpServer {
  const server = new McpServer({
    name: "GitShow MCP Server",
    version: "0.1.0",
  });

  server.tool(
    "git_show",
    "Run `git show <commit>` in the workspace and return the diff & metadata.",
    {
      commit: z
        .string()
        .default("HEAD")
        .describe("The commit hash or reference (defaults to HEAD)"),
      cwd: z.string().describe("The working directory to run the command in."),
    } as ZodRawShape,
    async ({ commit = "HEAD", cwd }) => {
      const execOptions = { cwd: cwd || process.cwd() };
      const output = await new Promise<string>((resolve, reject) => {
        exec(`git show ${commit}`, execOptions, (err, stdout, stderr) => {
          if (err) return reject(stderr || err.message);
          resolve(stdout);
        });
      });
      REGISTERED_TOOLS.push("git_show");

      return {
        content: [
          {
            type: "text" as const,
            text: output,
          },
        ],
      };
    },
  );

  return server;
}
