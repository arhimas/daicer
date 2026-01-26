import { Command as EngineCommand, MoveCommand } from '../types';

/**
 * Parses raw text input into Engine Commands.
 * Supports basic CLI-style syntax (e.g. "MOVE:0,0,0").
 */
export class ActionParser {
    
    /**
     * Parses a text string into an EngineCommand if recognized.
     * @param text The input text
     * @param actorId The ID of the actor performing the command
     */
    static parse(text: string, actorId: string): EngineCommand | null {
        const trimmed = text.trim();
        
        if (trimmed.startsWith('MOVE:')) {
            return this.parseMove(trimmed, actorId);
        }

        return null;
    }

    private static parseMove(text: string, actorId: string): MoveCommand | null {
        const parts = text.replace(/^MOVE:/, '').split(',');
        if (parts.length >= 2) {
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            const rawZ = parts.length > 2 ? Number(parts[2]) : 0;
            const z = (isNaN(rawZ) ? 0 : Math.max(-3, Math.min(3, rawZ))) as 0 | 1 | 2 | 3 | -1 | -2 | -3;
            
            if (isNaN(x) || isNaN(y)) return null;

            return {
                type: 'MOVE',
                timestamp: Date.now(),
                payload: {
                    actorId,
                    targetPosition: { x, y, z },
                    mode: 'walk',
                },
            };
        }
        return null;
    }
}
