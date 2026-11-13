import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

function buildServer(): McpServer {
  const server = new McpServer({ name: "nightjar-mcp", version: "0.1.0" });

  server.tool("ping", "Health check — returns pong, optionally echoing a message.",
    { message: z.string().optional().describe("optional text to echo back") },
    async ({ message }) => ({ content: [{ type: "text", text: message ? `pong: ${message}` : "pong" }] }));

  server.tool("now", "Return the current server time in ISO 8601.", {},
    async () => ({ content: [{ type: "text", text: new Date().toISOString() }] }));

  server.tool("http_get", "Fetch a URL and return its response text (capped at 10k chars).",
    { url: z.string().url().describe("the URL to fetch") },
    async ({ url }) => {
      const r = await fetch(url);
      const t = (await r.text()).slice(0, 10000);
      return { content: [{ type: "text", text: `HTTP ${r.status}\n\n${t}` }] };
    });

  server.tool("uuid", "Generate a random v4 UUID.", {},
    async () => ({ content: [{ type: "text", text: randomUUID() }] }));

  return server;
}

const app = express();
app.use(express.json());

app.all("/mcp", async (req: Request, res: Response) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request error:", err);
    if (!res.headersSent) res.status(500).json({ error: "internal error" });
  }
});

app.get("/", (_req, res) => { res.type("text/plain").send("nightjar-mcp is up. MCP endpoint: POST /mcp"); });

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => { console.log(`nightjar-mcp listening on http://localhost:${PORT}/mcp`); });
