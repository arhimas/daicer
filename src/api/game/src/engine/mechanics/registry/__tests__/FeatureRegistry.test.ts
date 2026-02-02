import { describe, it, expect } from 'vitest';
import { FeatureRegistry, FeatureHandler } from '../FeatureRegistry';

describe('FeatureRegistry', () => {
    // handlers is static private map. We rely on public API.
    
    it('should register and retrieve a handler', () => {
        const handler: FeatureHandler = {
            name: 'Test Feature',
            canApply: () => true,
        };

        FeatureRegistry.register(handler);
        const retrieved = FeatureRegistry.get('Test Feature');
        
        expect(retrieved).toBe(handler);
    });

    it('should be case insensitive', () => {
        const handler: FeatureHandler = {
            name: 'Sneak Attack',
            canApply: () => true,
        };

        FeatureRegistry.register(handler);
        expect(FeatureRegistry.get('sneak attack')).toBe(handler);
        expect(FeatureRegistry.get('SNEAK ATTACK')).toBe(handler);
    });

    it('should return undefined for unknown feature', () => {
        expect(FeatureRegistry.get('Unknown')).toBeUndefined();
    });
});
