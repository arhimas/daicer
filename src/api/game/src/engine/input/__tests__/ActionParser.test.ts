import { describe, it, expect } from 'vitest';
import { ActionParser } from '../ActionParser';

describe('ActionParser', () => {
    it('should parse valid MOVE command', () => {
        const cmd = ActionParser.parse('MOVE:10,20,1', 'actor1');
        expect(cmd).not.toBeNull();
        expect(cmd?.type).toBe('MOVE');
        if (cmd?.type === 'MOVE') {
            expect(cmd.payload.actorId).toBe('actor1');
            expect(cmd.payload.targetPosition).toEqual({ x: 10, y: 20, z: 1 });
        }
    });

    it('should handle optional Z', () => {
        const cmd = ActionParser.parse('MOVE:5,5', 'actor1');
        if (cmd?.type === 'MOVE') {
             expect(cmd.payload.targetPosition.z).toBe(0);
        }
    });

    it('should clamp Z', () => {
         const cmd = ActionParser.parse('MOVE:5,5,100', 'actor1');
         if (cmd?.type === 'MOVE') {
             expect(cmd.payload.targetPosition.z).toBe(3);
         }
    });

    it('should return null for invalid syntax', () => {
        expect(ActionParser.parse('ATTACK:thing', 'actor1')).toBeNull(); // Only MOVE supported
        expect(ActionParser.parse('MOVE:invalid', 'actor1')).toBeNull();
    });
});
