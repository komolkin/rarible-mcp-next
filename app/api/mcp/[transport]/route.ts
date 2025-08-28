// app/api/mcp/[transport]/route.ts

// ✅ Ensure this runs in Node.js, not Edge
export const runtime = "nodejs";

// ✅ Increase timeout for long SSE sessions
export const maxDuration = 120;

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { RaribleProtocolMcp } from "@rarible/protocol-mcp";

// Rarible MCP SDK instance (no top-level awaits)
const rarible = new RaribleProtocolMcp({
  apiKeyAuth: process.env.RARIBLE_API_KEY ?? "",
});

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

    // Rarible: get collection by id
    server.tool(
      "rarible_get_collection",
      "Fetch collection by id like CHAIN:0xcontract",
      { collectionId: z.string() },
      async ({ collectionId }) => {
        const data = await rarible.collections.getCollectionById({
          collectionId,
        });
        return { content: [{ type: "json", json: data }] };
      }
    );

    // Rarible: get item by itemId
    server.tool(
      "rarible_get_item_by_id",
      "Fetch NFT item by itemId like CHAIN:0x...:tokenId",
      { itemId: z.string() },
      async ({ itemId }) => {
        const data = await rarible.nftItems.getItemById({ itemId });
        return { content: [{ type: "json", json: data }] };
      }
    );

    // Rarible: list items by owner
    server.tool(
      "rarible_get_items_by_owner",
      "List NFTs owned by an address on a chain",
      { owner: z.string().describe("e.g. ETHEREUM:0xabc...") },
      async ({ owner }) => {
        const data = await rarible.nftOwnerships.getNftOwnershipsByOwner({
          owner,
        });
        return { content: [{ type: "json", json: data }] };
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
