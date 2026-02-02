import { describe, it, expect, beforeEach } from 'vitest';
import { EntropySystem } from '../index';

describe('EntropySystem', () => {
    let entropy: EntropySystem;

    beforeEach(() => {
        entropy = new EntropySystem('test-seed-123');
    });

    it('should initialize with default state', () => {
        const state = entropy.state;
        expect(state.conditions).toHaveLength(5);
        expect(state.entropyPool).toBe(0.1);
        expect(state.eventsLog).toHaveLength(0);
    });

    it('should be deterministic with seed', () => {
        const entropy1 = new EntropySystem('same-seed');
        const entropy2 = new EntropySystem('same-seed');
        expect(entropy1.state.conditions[0].key).toBe(entropy2.state.conditions[0].key);
    });

    it('should advance turn and increase pool', () => {
        // Mock RNG to control outcome? 
        // Or just run it and check logic logic.
        // Pool increases by 0.01 per turn.
        entropy.advanceTurn(1, 1);
        expect(entropy.state.entropyPool).toBeGreaterThan(0.1); // 0.1 + 0.01 = 0.11 or lowered if event
        
        // With 'test-seed-123', we can predict if needed, but let's check bounding.
        // If event fired, pool would drop.
        // Initial pool 0.1. Prob = 0.1 + 0.05 = 0.15.
        // It likely won't trigger immediately.
    });

    it('should trigger event eventually', () => {
        let changed = false;
        for (let i = 0; i < 100; i++) {
            const change = entropy.advanceTurn(1, i);
            if (change) {
                changed = true;
                break;
            }
        }
        expect(changed).toBe(true);
    });

    it('should simulate time passage', () => {
        const result = entropy.simulateTimePassage(8, 10);
        // 8 hours -> 80% chance of event usually, or at least pool increase.
        if (!result) {
            expect(entropy.state.entropyPool).toBeGreaterThan(0.1);
        }
    });

    it('should apply changes manually', () => {
        const change = {
            mutation: {
                key: entropy.state.conditions[0].key,
                newValue: 'NewValue_Test',
                reason: 'Test'
            }
        };
        entropy.applyChange(change, 5);
        expect(entropy.state.conditions[0].currentValue).toBe('NewValue_Test');
    });
});
