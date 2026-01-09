import type { Core } from '@strapi/strapi';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Strapi extends Core.Strapi {}

  // Extend global imports if needed or define specific ambient types
}

declare module '@strapi/strapi' {
  interface Strapi {
    documents(uid: string): unknown; // Helper until official types catch up
  }
}

// Specific missing interfaces used in game-event.ts
export interface RoomWithWorld {
  id: string;
  documentId: string;
  code: string;
  world?: {
    seed?: string;
  };
}

export interface RoomWithSheets {
  id: string;
  documentId: string;
  entity_sheets?: Record<string, unknown>[];
}
