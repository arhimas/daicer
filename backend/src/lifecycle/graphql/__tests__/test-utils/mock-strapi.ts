import { vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// In-memory DB
export const db = {
  'api::world.world': [],
  'api::dm-setting.dm-setting': [],
  'api::room.room': [],
  'api::turn.turn': [],
  'api::message.message': [],
};

export const resetMockStrapi = () => {
  for (const key in db) {
    db[key] = [];
  }
  // Reset Service Mocks
  vi.clearAllMocks();
};

// Generic Document Service Mock
const createDocService = (uid) => ({
  create: vi.fn(async ({ data }) => {
    const doc = {
      documentId: uuidv4(),
      id: Math.floor(Math.random() * 10000),
      ...data,
    };
    db[uid].push(doc);
    return doc;
  }),
  update: vi.fn(async ({ documentId, data }) => {
    const idx = db[uid].findIndex((d) => d.documentId === documentId);
    if (idx === -1) throw new Error(`Entity not found: ${uid} ${documentId}`);
    const updated = { ...db[uid][idx], ...data };
    db[uid][idx] = updated;
    return updated;
  }),
  findMany: vi.fn(async ({ filters, populate }) => {
    // Simple filter support: Check exact matches for top-level keys
    // filters can be { roomId: '...' } OR { $or: [...] }
    let results = db[uid];

    if (filters) {
      if (filters.$or) {
        // Basic OR support
        results = results.filter((item) => {
          return filters.$or.some((cond) => {
            return Object.entries(cond).every(([k, v]) => item[k] === v);
          });
        });
      } else {
        results = results.filter((item) => {
          return Object.entries(filters).every(([k, v]) => item[k] === v);
        });
      }
    }

    // Basic populate simulation (Mock relationships if needed)
    // For now, E2E logic manually joins if needed, or we assume refs are IDs.
    // However, resolvers like 'generateWorld' 'populate: ["world"]' and then access room.world.
    // If room.world is just an ID string, room.world.seed will crash.
    // We need to auto-populate if requested.
    if (populate && Array.isArray(populate)) {
      results = results.map((item) => {
        const populated = { ...item };
        populate.forEach((field) => {
          // Handle nested "players.character" etc? Too complex.
          // Handle direct: "world"
          if (field === 'world') {
            const wId = item.world; // stored as ID
            const wDoc = db['api::world.world'].find((w) => w.documentId === wId || w.documentId === wId?.documentId);
            if (wDoc) populated.world = wDoc;
          }
          if (field === 'dmSettings') {
            const dId = item.dmSettings;
            const dDoc = db['api::dm-setting.dm-setting'].find((d) => d.documentId === dId);
            if (dDoc) populated.dmSettings = dDoc;
          }
        });
        return populated;
      });
    }

    return results;
  }),
  findOne: vi.fn(async ({ documentId, populate }) => {
    const results = await createDocService(uid).findMany({ filters: { documentId }, populate });
    return results[0] || null;
  }),
});

// Mock Services
export const mockStrapi = {
  db,
  documents: (uid) => createDocService(uid),
  service: (uid) => {
    // Return spies/mocks we can inspect in tests
    // We attach them to mockStrapi properties for easy access/override in tests
    if (!mockStrapi.services[uid]) {
      mockStrapi.services[uid] = {}; // specific implementation injected by test
    }
    return mockStrapi.services[uid];
  },
  services: {
    'api::game.game': {
      generateWorld: vi.fn(),
      processTurn: vi.fn(),
    },
    'api::game.world-generation': {
      generateWorld: vi.fn(),
    },
    'api::voxel-engine.voxel-engine': {
      getChunk: vi.fn(),
    },
  },
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};
