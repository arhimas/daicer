import type { Core } from '@strapi/strapi';

declare global {
  interface Strapi extends Core.Strapi {}

  // Extend global imports if needed or define specific ambient types
}

declare module '@strapi/strapi' {
  interface Strapi {
    documents(uid: string): any; // Helper until official types catch up
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
  entity_sheets?: any[];
}
