import { AgentRuntime } from "@elizaos/core";
import type { Character } from "@elizaos/core";
import { afiScoutCharacter } from "../src/afiscout/index.js";
import { afiSignalOutboxPlugin } from "../src/afiscout/plugins/afi-signal-outbox.js";
import type { AfiScoutSignalDraft } from "../src/afiscout/types/afi-scout-signal.js";

// Minimal in-memory adapter to satisfy AgentRuntime requirements without real DB
function createInMemoryAdapter(agentId: string, name: string) {
  const agentRecord = {
    id: agentId,
    name,
    bio: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    db: {},
    async initialize() {},
    async init() {},
    async runPluginMigrations() {},
    async isReady() {
      return true;
    },
    async close() {},
    async getConnection() {
      return null;
    },
    async getAgent(id: string) {
      return id === agentId ? agentRecord : null;
    },
    async getAgents() {
      return [agentRecord];
    },
    async createAgent() {
      return true;
    },
    async updateAgent() {
      return true;
    },
    async deleteAgent() {
      return true;
    },
    async ensureEmbeddingDimension() {},
    async getEntitiesByIds() {
      return [];
    },
    async getEntitiesForRoom() {
      return [];
    },
    async createEntities() {
      return true;
    },
    async updateEntity() {},
    async getComponent() {
      return null;
    },
    async getComponents() {
      return [];
    },
    async createComponent() {
      return true;
    },
    async updateComponent() {},
    async deleteComponent() {},
    async getMemories() {
      return [];
    },
    async getMemoryById() {
      return null;
    },
    async getMemoriesByIds() {
      return [];
    },
    async getMemoriesByRoomIds() {
      return [];
    },
    async getCachedEmbeddings() {
      return [];
    },
    async log() {},
    async getLogs() {
      return [];
    },
    async deleteLog() {},
    async searchMemories() {
      return [];
    },
    async searchMemoryColumns() {
      return [];
    },
    async getMemoryByEmbedding() {
      return null;
    },
    async addEmbeddingToMemory(memory: any) {
      return memory;
    },
  };
}

async function main() {
  // Build a minimal character that only uses the AFIScout plugin
  const character: Character = {
    ...afiScoutCharacter,
    plugins: [afiSignalOutboxPlugin as any],
  };

  const agentId = "afiscout-agent";
  const adapter = createInMemoryAdapter(agentId, character.name);

  // Minimal runtime without DB adapter (skip migrations)
  const runtime = new AgentRuntime({
    character,
    plugins: [afiSignalOutboxPlugin as any],
    adapter,
    agentId,
  });

  // For this local smoke, skip full runtime initialization (no DB/agents needed)
  // await runtime.initialize({ skipMigrations: true });

  // Locate the AFIScout outbox action
  const action = afiSignalOutboxPlugin.actions?.find(
    (a) => a.name === "emitAfiSignalDraft"
  );
  if (!action || typeof action.execute !== "function") {
    throw new Error("AFIScout outbox action not found or invalid.");
  }

  const testMessage = {
    userId: "afiscout-test-user",
    content:
      "I'm thinking about a long BTCUSDT swing trade on the 4h timeframe because ETF inflows look strong.",
  };

  // Map message into a draft payload
  const input = {
    symbol: "BTCUSDT",
    market: "crypto",
    timeframe: "4h",
    action: "long",
    thesis: testMessage.content,
    tags: ["swing", "etf-inflows", "momentum"],
  };

  const result = await action.execute(input);
  const draft: AfiScoutSignalDraft | undefined =
    result && "draft" in result ? (result as any).draft : undefined;

  if (!draft) {
    throw new Error("AFIScout did not return a draft payload.");
  }

  console.log(
    "[AFIScout Smoke] Draft AFI signal:\n",
    JSON.stringify(draft, null, 2)
  );
}

main().catch((err) => {
  console.error("[AFIScout Smoke] Failed:", err);
  process.exit(1);
});
