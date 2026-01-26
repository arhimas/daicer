import { ActionParser } from '../ActionParser';

describe('ActionParser', () => {
    it('returns null for unknown commands', () => {
        expect(ActionParser.parse('HELLO', 'actor-1')).toBeNull();
    });

    it('parses MOVE command correctly', () => {
        const cmd = ActionParser.parse('MOVE:10,20', 'actor-1');
        expect(cmd).not.toBeNull();
        expect(cmd?.type).toBe('MOVE');
        if (cmd?.type === 'MOVE') {
             expect(cmd.payload.actorId).toBe('actor-1');
             expect(cmd.payload.targetPosition.x).toBe(10);
             expect(cmd.payload.targetPosition.y).toBe(20);
             expect(cmd.payload.targetPosition.z).toBe(0); // Default Z
        }
    });
    
    it('parses 3D MOVE command', () => {
        const cmd = ActionParser.parse('MOVE:5,5,1', 'actor-1');
         if (cmd?.type === 'MOVE') {
             expect(cmd.payload.targetPosition.z).toBe(1);
        }
    });

    it('handles invalid coordinates gracefully', () => {
        expect(ActionParser.parse('MOVE:a,b', 'actor-1')).toBeNull();
    });
});
