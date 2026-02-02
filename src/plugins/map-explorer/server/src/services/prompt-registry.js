"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_PROMPT_KEYS = exports.PromptSchemas = void 0;
const zod_1 = require("zod");
// Zod Schemas for Runtime Validation
exports.PromptSchemas = {
    'system-identity': zod_1.z.object({}),
    'gameplay-combat': zod_1.z.object({
        combatantState: zod_1.z.string(),
        action: zod_1.z.string(),
    }),
    'gameplay-exploration': zod_1.z.object({
        location: zod_1.z.string(),
        players: zod_1.z.string(),
    }),
    'user-onboarding': zod_1.z.object({}),
    'system-safety-tools': zod_1.z.object({}),
    'pixel-forge-system': zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number(),
        contextData: zod_1.z.string(),
        visionInstruction: zod_1.z.string(),
        specificInstruction: zod_1.z.string(),
        enhancedPrompt: zod_1.z.string(),
    }),
    'blueprint-architect': zod_1.z.object({
        prompt: zod_1.z.string(),
        archetype: zod_1.z.string(),
        width: zod_1.z.number(),
        height: zod_1.z.number(),
        contextData: zod_1.z.string(), // Must include Strict Legend
    }),
    'voxel-architect': zod_1.z.object({
        prompt: zod_1.z.string(),
        width: zod_1.z.number(),
        depth: zod_1.z.number(),
        contextData: zod_1.z.string(),
    }),
    'genesis-architect': zod_1.z.object({
        term: zod_1.z.string(),
        type: zod_1.z.string(),
        contextData: zod_1.z.string(),
    }),
};
// Runtime Helper to validate keys
exports.VALID_PROMPT_KEYS = Object.keys(exports.PromptSchemas);
