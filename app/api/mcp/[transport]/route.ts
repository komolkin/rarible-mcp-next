// app/api/mcp/[transport]/route.ts

// ✅ Ensure this runs in Node.js, not Edge
export const runtime = "nodejs";

// ✅ Increase timeout for long SSE sessions
export const maxDuration = 120;

import { createMcpHandler } from "mcp-handler";

// Create the MCP handler
const handler = createMcpHandler(
  (server) => {
    // 👇 Minimal tool so your server actually reports something
    server.tool(
      "health",
      "Simple health check that returns pong",
      {},
      async () => {
        return { content: [{ type: "text", text: "pong" }] };
      }
    );
  },
  {},
  {
    basePath: "/api/mcp",
    verboseLogs: true,
    // Leave Redis out unless you’ve set up Upstash or another Redis:
    // redisUrl: process.env.REDIS_URL,
  }
);

// ✅ Important: export both GET and POST so HTTP + SSE work
export { handler as GET, handler as POST };
