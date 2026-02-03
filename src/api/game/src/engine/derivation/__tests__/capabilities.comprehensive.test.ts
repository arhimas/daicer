
import { describe, it, expect } from 'vitest';
import { deriveSpeed, deriveActions } from '@daicer/engine/derivation/capabilities';
import { DerivationContext } from '@daicer/engine/derivation/types';

const baseContext: DerivationContext = {
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    proficiencyBonus: 2,
    race: { name: 'Human', speed: 30 },
    equipment: [],
    // innateActions is actually on the context per signature but not in base types sometimes
    // we cast as needed
} as any;

describe('Capabilities - Branch Maximization', () => {

    it('should derive speed from race object (number)', () => {
        const context = { ...baseContext, race: { speed: 40 } };
        const speed = deriveSpeed(context as any);
        expect(speed.walk).toBe(40);
    });

    it('should derive speed from race object (object)', () => {
        const context = { ...baseContext, race: { speed: { walk: 25, swim: 20 } } };
        const speed = deriveSpeed(context as any);
        expect(speed.walk).toBe(25);
        expect(speed.swim).toBe(20);
    });

    it('should apply heavy armor penalty if Str too low', () => {
        const context = { 
            ...baseContext, 
            attributes: { ...baseContext.attributes, strength: 8 },
            equipment: [{ 
                name: 'Plate', 
                equipment_category: { slug: 'heavy-armor' },
                str_minimum: 15,
                isEquipped: true
             }] 
        };
        const speed = deriveSpeed(context as any);
        // Base 30 - 10 = 20
        expect(speed.walk).toBe(20);
    });

    it('should NOT apply heavy armor penalty if Str sufficient', () => {
        const context = { 
            ...baseContext, 
            attributes: { ...baseContext.attributes, strength: 16 },
            equipment: [{ 
                name: 'Plate', 
                equipment_category: { slug: 'heavy-armor' },
                str_minimum: 15,
                isEquipped: true
             }] 
        };
        const speed = deriveSpeed(context as any);
        expect(speed.walk).toBe(30);
    });

    it('should NOT apply heavy armor penalty if no str_req', () => {
        const context = { 
            ...baseContext, 
            attributes: { ...baseContext.attributes, strength: 8 },
            equipment: [{ 
                name: 'Ring Mail', 
                equipment_category: { slug: 'heavy-armor' },
                // No str_minimum
                isEquipped: true
             }] 
        };
        const speed = deriveSpeed(context as any);
        expect(speed.walk).toBe(30);
    });

    it('should include innate actions', () => {
        const innate = [{ id: 'breath', name: 'Dragon Breath' }];
        const context = { ...baseContext, innateActions: innate };
        
        const actions = deriveActions(context as any);
        expect(actions).toHaveLength(1);
        expect(actions[0].name).toBe('Dragon Breath');
    });

    it('should derive spells from context', () => {
        // Mocking SerializedSpell
        const spells = [{ id: 1, name: 'Magic Missile', level: 1 }];
        const context = { ...baseContext, spells };
        
        const actions = deriveActions(context as any);
        expect(actions).toHaveLength(1);
        expect(actions[0].name).toBe('Magic Missile');
    });

    it('should skip unequipped items', () => {
        const equipment = [{
            name: 'Sword',
            damage_dice: '1d8',
            isEquipped: false // Explicitly unequipped
        }];
        const context = { ...baseContext, equipment };
        
        const actions = deriveActions(context as any);
        // Should fall back to Unarmed Strike
        expect(actions[0].name).toBe('Unarmed Strike');
    });

    it('should provide Unarmed Strike fallback if no actions', () => {
        const context = { ...baseContext, equipment: [] }; // No items, no spells
        const actions = deriveActions(context as any);
        expect(actions).toHaveLength(1);
        expect(actions[0].name).toBe('Unarmed Strike');
    });
});
