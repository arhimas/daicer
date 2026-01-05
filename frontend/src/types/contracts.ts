/**
 * Data Contracts (formerly Shared/Engine types)
 * These shapes are guaranteed by the Backend (via Socket/API).
 */

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export type Attribute = string;

export interface EntitySheet {
  attributes: Record<string, number>;
  skills: Record<string, { total: number; proficient: boolean }>;
  hp: number;
  maxHp: number;
  ac?: number;
  armorClass?: number;
  speed: number | { walk: number; [key: string]: number };
  structuredActions: any[]; // Avoid complex type for now
  features: any[];
  equipment?: any[];
  name?: string;
  [key: string]: any;
}

export interface Entity {
  id: string;
  type: 'player' | 'npc' | 'monster' | 'object';
  name: string;
  position: Coordinates;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number | { walk: number; [key: string]: number };
  sheet?: EntitySheet;
  color: string;
  visionRadius: number;
  stats?: any; // Legacy stat block
}

export type Role = 'dm' | 'player' | 'spectator' | 'god' | 'premium' | 'free';

export interface Player {
  id: string;
  userId: string;
  name: string;
  role: Role;
  isOnline?: boolean;
  character?: any; // MinEntity
  characterSheet?: EntitySheet | null;
  action?: string | null;
  isReady: boolean;
  position?: Coordinates;
  documentId?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type?: 'talk' | 'narration' | 'system' | 'text' | 'narrative';
  metadata?: Record<string, any>;
  targetPlayer?: string;
  recipientId?: string;
  documentId?: string;
}

export interface RoomMembership {
  id: string;
  role: Role;
  room?: Room;
  player?: Player;
  user?: { id: string; username: string };
}

export interface Room {
  id: string;
  code: string;
  phase: string;
  players?: Player[];
  messages?: Message[];
  settings?: any;
  mapConfig?: any;
  terrainData?: any;
  isActive?: boolean;
  documentId?: string;
  ownerId?: string;
  owner?: { id: string; username: string; documentId?: string };
  roomId?: string;
  updatedAt: number;
  generationEvents?: any[];
  worldDescription?: string;
}

export interface Creature {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  position: Coordinates;
  type: 'npc' | 'monster';
  sheet?: EntitySheet;
}

// Map Types
export interface Tile {
  x: number;
  y: number;
  z: number;
  biome: string;
  elevation: number;
  isWalkable: boolean;
  blockType?: string;
}

export interface ChunkDTO {
  x: number;
  y: number;
  z: number;
  tiles: Tile[][][];
  biomes?: string[];
}
export type GridChunk = ChunkDTO;

// Socket Payloads
export interface RoomJoinPayload {
  roomId: string;
  token?: string;
  userId?: string;
}

export interface TurnProcessPayload {
  roomId: string;
  language?: string;
}

export interface PlayerActionPayload {
  roomId: string;
  action: string | { type: string; [key: string]: any };
}

export type ScaleLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AdventureLength = 'flash' | 'short' | 'medium' | 'long' | 'epic' | 'legendary';
export type Difficulty = 'storyteller' | 'easy' | 'medium' | 'challenging' | 'gritty' | 'deadly';
export type WorldSize = 'intimate' | 'small' | 'medium' | 'large' | 'vast' | 'epic';
export type DMPerformanceMode = 'pirate' | 'shakespearean' | 'noir' | 'courtly' | 'grimdark' | 'storybook';
export type WorldType = 'terra' | 'water' | 'desert' | 'ice' | 'volcanic' | 'forest' | 'sky' | 'underground' | 'custom';

export interface DMStyle {
  verbosity: ScaleLevel;
  detail: ScaleLevel;
  engagement: ScaleLevel;
  narrative: ScaleLevel;
  specialMode?: DMPerformanceMode | null;
  customDirectives: string;
}

export interface WorldSettings {
  worldType: WorldType;
  worldSize: WorldSize;
  difficulty: Difficulty;
  adventureLength: AdventureLength;
  dmStyle: DMStyle;
  [key: string]: any;
}

export interface WorldConfig {
  seed: string;
  [key: string]: any;
}

export interface GameEvent {
  type: string;
  payload: any;
  timestamp?: number;
}

export type Language = 'en' | 'es' | 'pt-BR';
export type GamePhase =
  | 'SETUP'
  | 'TERRAIN_GENERATION'
  | 'CHARACTER_CREATION'
  | 'GAMEPLAY'
  | 'COMBAT'
  | 'LOBBY'
  | 'PAUSED'
  | 'ENDED';
export const GamePhase = {
  SETUP: 'SETUP',
  TERRAIN_GENERATION: 'TERRAIN_GENERATION',
  CHARACTER_CREATION: 'CHARACTER_CREATION',
  GAMEPLAY: 'GAMEPLAY',
  COMBAT: 'COMBAT',
  LOBBY: 'LOBBY',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
} as const;

export interface HistoricalPeriod {
  name: string;
  duration: number;
  description: string;
}

export interface WorldCondition {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface Structure {
  id: string;
  type: string;
  position: Coordinates;
}

export interface Road {
  id: string;
  path: Coordinates[];
}

export type CharacterSheet = EntitySheet;

export enum ActionType {
  Move = 'MOVE',
  Attack = 'ATTACK',
  SkillCheck = 'SKILL_CHECK',
  CastSpell = 'CAST_SPELL',
  Interact = 'INTERACT',
  LongRest = 'LONG_REST',
  ModifyTerrain = 'MODIFY_TERRAIN',
  RollSave = 'ROLL_SAVE',
  EndTurn = 'END_TURN',
}

// Logic Placeholders (Mocking removed logic types)
export const DEFAULT_GENERATION_PARAMS = {};
export const createUnifiedTerrainGenerator = (seed: string, config: any) => {
  return (chunkX: number, chunkY: number, size: number) => ({
    x: chunkX,
    y: chunkY,
    z: 0,
    tiles: [], // Empty for mock
    biomes: [],
  });
};
