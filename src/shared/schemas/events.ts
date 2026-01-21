import { z } from 'zod';
import { CoordinatesSchema } from './common';

export const MapMovePayloadSchema = z.object({
  entityId: z.union([z.string(), z.number()]),
  from: CoordinatesSchema,
  to: CoordinatesSchema,
});

export type MapMovePayload = z.infer<typeof MapMovePayloadSchema>;

export const SpawnEntityPayloadSchema = z.object({
  entityId: z.union([z.string(), z.number()]),
  position: CoordinatesSchema,
});

export type SpawnEntityPayload = z.infer<typeof SpawnEntityPayloadSchema>;

/**
 * Union schema for all Game Events (Movement, Spawning, etc).
 */
export const GameEventPayloadSchema = z.union([
  z.object({ type: z.literal('MOVE'), payload: MapMovePayloadSchema }),
  z.object({ type: z.literal('SPAWN_ENTITY'), payload: SpawnEntityPayloadSchema }),
  z.object({ type: z.string(), payload: z.record(z.string(), z.unknown()) }),
]);

export type GameEventStrict = z.infer<typeof GameEventPayloadSchema>;

// Socket Payloads

/**
 * Payload for joining a game room.
 */
export const RoomJoinSchema = z.object({
  roomId: z.string(),
  token: z.string().optional(),
  userId: z.string().optional(), // For backward compatibility / explict ID
});

export type RoomJoinPayload = z.infer<typeof RoomJoinSchema>;

/**
 * Payload for initiating turn processing.
 */
export const TurnProcessSchema = z.object({
  roomId: z.string(),
  language: z.string().optional(),
});

export type TurnProcessPayload = z.infer<typeof TurnProcessSchema>;

/**
 * Payload for client-submitted player actions.
 */
export const PlayerActionSchema = z.object({
  roomId: z.string(),
  // Union of action types for strict validation
  action: z.union([
    z.string(), // Allow raw string for legacy/LLM freedom
    z.object({
      type: z.enum(['move', 'attack', 'interact', 'cast']),
      x: z.number(),
      y: z.number(),
      z: z.number().default(0),
      targetId: z.string().optional(),
    }),
  ]),
});

export type PlayerActionPayload = z.infer<typeof PlayerActionSchema>;

/**
 * Payload for signaling player readiness.
 */
export const PlayerReadySchema = z.object({
  roomId: z.string(),
  isReady: z.boolean(),
});

export type PlayerReadyPayload = z.infer<typeof PlayerReadySchema>;
