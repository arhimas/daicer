"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const context_builder_1 = require("../context-builder");
const snippets_1 = require("../snippets");
(0, vitest_1.describe)('ContextBuilder', () => {
    let builder;
    let mockStrapi;
    (0, vitest_1.beforeEach)(() => {
        mockStrapi = {
            log: {
                info: vitest_1.vi.fn(),
                warn: vitest_1.vi.fn(),
                error: vitest_1.vi.fn(),
            },
            plugin: vitest_1.vi.fn().mockReturnValue({
                service: vitest_1.vi.fn().mockReturnValue({
                    fetchDeepContext: vitest_1.vi.fn().mockResolvedValue({ id: 1, name: 'Deep Entity' }),
                }),
            }),
            getModel: vitest_1.vi.fn().mockReturnValue({ info: { displayName: 'Mock Entity' } }),
            db: {
                query: vitest_1.vi.fn().mockReturnValue({
                    findMany: vitest_1.vi.fn().mockResolvedValue([
                        { name: 'Head', slug: 'head', color: '#FF0000', description: 'The head.' },
                        { name: 'Core', slug: 'core', color: '#FFFFFF', description: 'The body.' }
                    ]),
                }),
            },
        };
        builder = new context_builder_1.ContextBuilder(mockStrapi);
    });
    (0, vitest_1.describe)('buildEntityContext', () => {
        (0, vitest_1.it)('should build deep context from DB when ID is provided', async () => {
            const config = {
                entityContext: { uid: 'api::test.test', documentId: 'doc123' },
                width: 32,
                height: 32,
                size: 'Medium'
            };
            const result = await builder.buildEntityContext(config);
            (0, vitest_1.expect)(result).toContain('ENTITY TYPE: Mock Entity');
            (0, vitest_1.expect)(result).toContain('"name": "Deep Entity"');
            (0, vitest_1.expect)(mockStrapi.plugin).toHaveBeenCalledWith('map-explorer');
        });
        (0, vitest_1.it)('should merge draft data over deep data', async () => {
            const config = {
                entityContext: { uid: 'api::test.test', documentId: 'doc123' },
                entityData: { name: 'Draft Name' },
                width: 32,
                height: 32,
                size: 'Medium'
            };
            const result = await builder.buildEntityContext(config);
            (0, vitest_1.expect)(result).toContain('"name": "Draft Name"');
            (0, vitest_1.expect)(result).not.toContain('"name": "Deep Entity"'); // Should be overridden
        });
        (0, vitest_1.it)('should fallback to shallow context on error', async () => {
            mockStrapi.plugin.mockReturnValue({
                service: vitest_1.vi.fn().mockReturnValue({
                    fetchDeepContext: vitest_1.vi.fn().mockRejectedValue(new Error('DB Down')),
                })
            });
            const config = {
                entityContext: { uid: 'api::test.test', documentId: 'doc123' },
                entityData: { simpleField: 'simple' },
                width: 32,
                height: 32,
                size: 'Medium'
            };
            const result = await builder.buildEntityContext(config);
            (0, vitest_1.expect)(result).toContain(snippets_1.SNIPPETS.SHALLOW_CONTEXT_HEADER);
            (0, vitest_1.expect)(result).toContain('simpleField: simple');
        });
        (0, vitest_1.it)('should inject prompt override warning if prompt provided', async () => {
            const config = {
                entityContext: { uid: 'api::test.test', documentId: 'doc123' },
                prompt: "Make it blue",
                width: 32,
                height: 32,
                size: 'Medium'
            };
            const result = await builder.buildEntityContext(config);
            (0, vitest_1.expect)(result).toContain('[IMPORTANT OVERRIDE]');
            (0, vitest_1.expect)(result).toContain('Make it blue');
        });
    });
    (0, vitest_1.describe)('buildVisionContext', () => {
        (0, vitest_1.it)('should return vision instruction and zone map', async () => {
            const { instruction, zoneMap } = await builder.buildVisionContext();
            (0, vitest_1.expect)(instruction).toContain(snippets_1.SNIPPETS.VISION_INSTRUCTION_PREFIX);
            (0, vitest_1.expect)(instruction).toContain('Head [#FF0000]');
            (0, vitest_1.expect)(zoneMap).toEqual({
                head: '#FF0000',
                core: '#FFFFFF'
            });
        });
        (0, vitest_1.it)('should handle empty zones gracefully', async () => {
            mockStrapi.db.query().findMany.mockResolvedValue([]);
            const { instruction, zoneMap } = await builder.buildVisionContext();
            (0, vitest_1.expect)(instruction).toBe(snippets_1.SNIPPETS.VISION_INSTRUCTION_PREFIX);
            (0, vitest_1.expect)(zoneMap).toEqual({});
        });
    });
});
