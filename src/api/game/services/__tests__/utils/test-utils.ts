/**
 * Test Utilities for ActionEngine
 * Provides a Stateful Mock Database to verify persistence and side-effects.
 */
import { vi } from 'vitest';
import actionEngineFactory from '@/api/game/services/action-engine';

// Minimal Types for Mocking
interface MockDoc {
  documentId: string;
  [key: string]: any;
}

export class MockGameDatabase {
  private store: Map<string, Map<string, MockDoc>> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.store.clear();
  }

  // Seed the database
  seed(collection: string, data: MockDoc[]) {
    if (!this.store.has(collection)) {
      this.store.set(collection, new Map());
    }
    const colParams = this.store.get(collection)!;
    data.forEach((doc) => {
      colParams.set(doc.documentId, JSON.parse(JSON.stringify(doc))); // Deep Copy
    });
  }

  // Get state for verification
  getState(collection: string, documentId: string): MockDoc | undefined {
    return this.store.get(collection)?.get(documentId);
  }

  // The Mock Strapi Object
  getMockStrapi() {
    return {
      documents: (uid: string) => ({
        findOne: vi.fn(async ({ documentId }: { documentId: string }) => {
          const doc = this.store.get(uid)?.get(documentId);
          if (!doc) return null;
          return JSON.parse(JSON.stringify(doc)); // Return copy to mimic DB fetch
        }),

        findMany: vi.fn(async (params: { filters?: any; fields?: any }) => {
          const col = this.store.get(uid);
          if (!col) return [];
          let results = Array.from(col.values());

          // Ultra-basic filter implementation for 'room'
          if (params?.filters?.room?.documentId) {
            const roomId = params.filters.room.documentId;
            results = results.filter((doc) => {
              // Handle population logic shim
              if (doc.room && typeof doc.room === 'object') return doc.room.documentId === roomId;
              return doc.room === roomId;
            });
          }

          return JSON.parse(JSON.stringify(results));
        }),

        update: vi.fn(async ({ documentId, data }: { documentId: string; data: any }) => {
          const col = this.store.get(uid);
          if (!col) throw new Error(`Collection ${uid} not found`);
          const existing = col.get(documentId);
          if (!existing) throw new Error(`Document ${documentId} not found in ${uid}`);

          const updated = { ...existing, ...data };
          col.set(documentId, updated);
          return updated;
        }),

        create: vi.fn(async ({ data }: { data: any }) => {
          // Auto-gen ID if missing
          const docId = data.documentId || `doc-${Date.now()}-${Math.random()}`;
          const newDoc = { ...data, documentId: docId };

          if (!this.store.has(uid)) this.store.set(uid, new Map());
          this.store.get(uid)!.set(docId, newDoc);
          return newDoc;
        }),
      }),

      // Mock other services if needed
      service: (name: string) => {
        if (name === 'api::game.inventory-service') {
          return {
            dropItem: vi.fn().mockResolvedValue({ success: true }),
            dropAll: vi.fn().mockResolvedValue({ success: true }),
            pickupItem: vi.fn().mockResolvedValue({ success: true }),
            dropItemAt: vi.fn().mockResolvedValue({ success: true }),
          };
        }
        return {
          handleModifyTerrain: vi.fn().mockResolvedValue({ success: true }),
        };
      },
    };
  }
}

export const createTestContext = () => {
  const db = new MockGameDatabase();
  const strapiMock = db.getMockStrapi();

  // Stub Global Strapi
  vi.stubGlobal('strapi', strapiMock);

  const actionEngine = actionEngineFactory({ strapi: strapiMock });

  return { db, actionEngine, strapiMock };
};
