/**
 * Data Contracts (formerly Shared/Engine types)
 * These shapes are guaranteed by the Backend (via Socket/API).
 */

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

// Enum-like object for values + Type for usage
export const Attribute = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
} as const;
export type Attribute = (typeof Attribute)[keyof typeof Attribute];

export const calculateModifier = (score: number) => Math.floor((score - 10) / 2);

export interface SkillDetail {
  name: string;
  ability: string;
  proficiency: string;
  modifier: number;
}

export interface TimeFrame {
  id: string;
  documentId?: string;
  turnNumber: number;
  data: any; // Snapshot data
  gameState: any; // Alias for data
  timestamp: number; // For debug view
  createdAt: string;
}

export interface EntitySheet {
  attributes: Record<string, number>;
  skills: Record<string, { total: number; proficient: boolean }>;
  hp: number;
  maxHp: number;
  ac?: number;
  armorClass?: number;
  speed: number | { walk: number; [key: string]: number };
  structuredActions: EntityAction[];
  features: EntityFeature[];
  equipment?: any[];

  name?: string;
  stats?: any; // Legacy
  initiative?: number;
  initiativeBonus?: number;
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
  avatarPreview?: { portrait?: any }; // Loose type for now
}

export interface ResourcePool {
  name: string;
  current: number;
  max: number;
  refresh: string;
}

export interface Talent {
  name: string;
  description: string;
  source?: string;
}

export interface EntityAction {
  id?: string;
  name: string;
  description?: string;
  type: string;
  toHit?: number;
  range?: number;
  damage?: { dice: string; bonus?: number; type: string }[];
  save?: { dc: number; stat: string };
}

export interface EntityFeature {
  name: string;
  description: string;
  usage?: { max: number; per: string };
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type?: 'talk' | 'narration' | 'system' | 'text' | 'narrative';
  metadata?: Record<string, any>;
  images?: string[];
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
  timeFrames?: TimeFrame[];
  worldHistory?: any[]; // Legacy or alias for timeFrames
  turnData?: any;
  config?: any;
  createdAt?: string | number;
  structures?: any[];
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
  attackBonus?: number;
  damage?: string;
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
  block?: string; // For compatibility
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
export const createUnifiedTerrainGenerator = (_seed: string, _config: any) => {
  return (chunkX: number, chunkY: number, _size: number) => ({
    x: chunkX,
    y: chunkY,
    z: 0,
    tiles: [], // Empty for mock
    biomes: [],
  });
};
