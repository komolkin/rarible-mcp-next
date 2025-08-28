// app/api/mcp/[transport]/route.ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { RaribleProtocolMcp } from "@rarible/protocol-mcp";

// One shared SDK instance
const rarible = new RaribleProtocolMcp({
  apiKeyAuth: process.env.RARIBLE_API_KEY ?? "",
});

const handler = createMcpHandler(
  (server) => {
    // Example: fetch NFT by itemId (CHAIN:contract:tokenId)
    server.tool(
      "rarible_get_item_by_id",
      "Fetch NFT item by Rarible itemId like CHAIN:0x...:tokenId",
      { itemId: z.string().min(3) },
      async ({ itemId }) => {
        const data = await rarible.nftItems.getItemById({ itemId });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );

    // Example: list collections owned by an address (CHAIN:0x...)
    server.tool(
      "rarible_get_collections_by_owner",
      "List NFT collections owned by an address on a chain",
      { owner: z.string().describe("e.g. ETHEREUM:0xabc...") },
      async ({ owner }) => {
        const data = await rarible.nftCollections.getCollectionsByOwner({
          owner,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );

    // Example: fetch collection (can include metrics such as floor if available)
    server.tool(
      "rarible_get_collection",
      "Fetch collection by id like CHAIN:0xcontract",
      { collectionId: z.string() },
      async ({ collectionId }) => {
        const data = await rarible.nftCollections.getCollectionById({
          collection: collectionId,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );
  },
  // (optional) MCP server options
  {},
  // Adapter options (important!)
  {
    // Needed for SSE resumability in production (use Upstash/Redis on Vercel)
    redisUrl: process.env.REDIS_URL,
    // Must match this route’s base path
    basePath: "/api/mcp",
    // Increase if you expect long-running SSE sessions
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
