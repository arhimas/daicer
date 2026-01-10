import { z } from 'zod';

export const TurnActionTypeSchema = z.enum(['action', 'movement', 'bonus', 'free']);
export type TurnActionType = z.infer<typeof TurnActionTypeSchema>;

export const TurnActionSchema = z.object({
  playerId: z.union([z.string(), z.number()]),
  characterId: z.union([z.string(), z.number()]).optional(),
  type: TurnActionTypeSchema,
  intent: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.number(),
});

export type TurnAction = z.infer<typeof TurnActionSchema>;

export const TurnPhaseSchema = z.enum(['idle', 'waiting_for_actions', 'processing']);
export type TurnPhase = z.infer<typeof TurnPhaseSchema>;

export const TurnDataSchema = z.object({
  phase: TurnPhaseSchema,
  startTime: z.number(),
  actions: z.array(TurnActionSchema),
});

export type TurnData = z.infer<typeof TurnDataSchema>;

/**
 * Partial definition of a Player in the Room context
 */
export interface RoomPlayer {
  id: string | number;
  userId: string | number;
  name: string;
  character?: { id: string | number; name?: string } | null;
  isReady?: boolean;
  isOnline?: boolean;
  joinedAt?: number;
}

/**
 * Partial definition of Room used in Turn Service
 * We define strictly what we expect to access.
 */
export interface RoomContext {
  id: number | string;
  documentId?: string;
  turnData?: TurnData;
  players?: RoomPlayer[];
  history?: Record<string, unknown>[];
  setting?: string;
  theme?: string;
  tone?: string;
  worldDescription?: string;
  entity_sheets?: Record<string, unknown>[]; // TODO: Typed EntitySheet
}

/**
 * Strict Input for Room Creation/Update
 * (Bypassing Strapi's sometimes incomplete generated Input types)
 */
export interface RoomCreationInput {
  roomId?: string;
  code?: string;
  owner?: string;
  phase?: string;
  worldDescription?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
  structures?: unknown[];
  players?: RoomPlayer[]; // Component Input
  turnData?: TurnData;
  messages?: unknown[];
  // Add other schema fields as necessary for strictness
}
