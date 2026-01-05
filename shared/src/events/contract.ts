import { z } from 'zod';

export const StructuredActionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  toHit: z.number().optional(),
  reach: z.number().optional(),
  damage: z
    .array(
      z.object({
        dice: z.string(),
        bonus: z.number().optional(),
        type: z.string().optional(),
      })
    )
    .optional(),
});
export type StructuredAction = z.infer<typeof StructuredActionSchema>;

export const EntityUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['player', 'monster', 'npc', 'object']).or(z.string()),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  speed: z.number(),
  currentHp: z.number(),
  maxHp: z.number(),
  structuredActions: z.array(StructuredActionSchema).default([]),
  // Allow loose properties for debug fields until strictly typed
  raw: z.any().optional(),
  visionRadius: z.number().optional(),
  color: z.string().optional(),
  ac: z.number().optional(), // Added AC
  stats: z.any().optional(),
  features: z.any().optional(),
  equipment: z.any().optional(),
  proficiencies: z.any().optional(),
});
export type EntityUpdate = z.infer<typeof EntityUpdateSchema>;

export const EntitiesUpdatePayloadSchema = z.object({
  entities: z.array(EntityUpdateSchema),
});
export type EntitiesUpdatePayload = z.infer<typeof EntitiesUpdatePayloadSchema>;

export const TurnProcessPayloadSchema = z.object({
  roomId: z.string(),
  turnNumber: z.number().optional(),
  activeEntityId: z.string().optional(),
  // Add other fields as strict testing reveals them
});
export type TurnProcessPayload = z.infer<typeof TurnProcessPayloadSchema>;

export const GameUpdatePayloadSchema = z.object({
  type: z.string(),
  data: z.any(),
});
export type GameUpdatePayload = z.infer<typeof GameUpdatePayloadSchema>;

export const MessagePayloadSchema = z.object({
  id: z.string(),
  content: z.string(),
  sender: z.string().optional(),
  senderType: z.enum(['system', 'user', 'assistant']).optional(),
  timestamp: z.number().optional(),
});
export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

// Union of all possible payloads for generic handling
export const SocketEventSchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('entities:update'), payload: EntitiesUpdatePayloadSchema }),
  z.object({ event: z.literal('turn:processing'), payload: TurnProcessPayloadSchema }),
  z.object({ event: z.literal('turn:complete'), payload: TurnProcessPayloadSchema }),
  z.object({ event: z.literal('message:new'), payload: MessagePayloadSchema }),
  z.object({ event: z.literal('game:update'), payload: GameUpdatePayloadSchema }),
]);
export type SocketEvent = z.infer<typeof SocketEventSchema>;
