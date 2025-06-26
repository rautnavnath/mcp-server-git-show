// src/streamableHttps.ts
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

const app = express();
app.use(express.json());

const server: McpServer = createServer();
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

async function setup() {
  await server.connect(transport);
}

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP HTTP error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.all("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

const PORT = process.env.PORT || 3088;
setup()
  .then(() => {
    app.listen(PORT, (err?: any) => {
      if (err) {
        console.error("Failed to start HTTP server:", err);
        process.exit(1);
      }
      console.log(`GitShow MCP Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize MCP server:", err);
    process.exit(1);
  });
