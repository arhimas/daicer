
import { DamageInstance } from '../DamageInstance';
import { Entity } from '../../../../types';

describe('DamageInstance', () => {
    // Mock Entity
    const createTarget = (traits: Partial<Entity> = {}): Entity => ({
        id: 'target',
        name: 'Dummy',
        type: 'monster',
        position: { x: 0, y: 0, z: 0 },
        hp: 10,
        maxHp: 10,
        armorClass: 10,
        speed: 30,
        stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, passivePerception: 10, initiativeBonus: 0 },
        actions: [],
        features: [],
        conditions: [],
        resistances: [],
        immunities: [],
        vulnerabilities: [],
        color: 'red',
        visionRadius: 0,
        ...traits
    });

    it('should resolve normal damage', () => {
        const damage = new DamageInstance(10, 'Fire');
        const target = createTarget();
        const { finalAmount, logic } = damage.resolveAgainst(target);
        expect(finalAmount).toBe(10);
        expect(logic).toHaveLength(0);
    });

    it('should resolve immunity', () => {
        const damage = new DamageInstance(10, 'Fire');
        const target = createTarget({ immunities: ['Fire'] });
        const { finalAmount, logic } = damage.resolveAgainst(target);
        expect(finalAmount).toBe(0);
        expect(logic).toContain('Immune to Fire');
    });

    it('should resolve resistance', () => {
        const damage = new DamageInstance(10, 'Fire');
        const target = createTarget({ resistances: ['Fire'] });
        const { finalAmount, logic } = damage.resolveAgainst(target);
        expect(finalAmount).toBe(5);
        expect(logic).toContain('Resistant to Fire (Halved)');
    });

    it('should resolve vulnerability', () => {
        const damage = new DamageInstance(10, 'Fire');
        const target = createTarget({ vulnerabilities: ['Fire'] });
        const { finalAmount, logic } = damage.resolveAgainst(target);
        expect(finalAmount).toBe(20);
        expect(logic).toContain('Vulnerable to Fire (Doubled)');
    });

    it('should apply resistance then vulnerability (math check)', () => {
        // 10 -> Resist (5) -> Vuln (10).
        // If order reversed: 10 -> Vuln (20) -> Resist (10).
        // Math is same for *2 and /2. But rounding might matter.
        // Logic says floor on resist.
        // 11 -> Resist -> 5 -> Vuln -> 10.
        // 11 -> Vuln -> 22 -> Resist -> 11.
        // 5e Rule: Resistance applies first.
        
        // Code implementation: Resistance check first.
        const damage = new DamageInstance(11, 'Fire');
        const target = createTarget({ resistances: ['Fire'], vulnerabilities: ['Fire'] });
        
        // My implementation:
        // if resistant -> floor(11/2) = 5.
        // if vulnerable -> floor(5*2) = 10.
        const { finalAmount, logic } = damage.resolveAgainst(target);
        expect(finalAmount).toBe(10);
        expect(logic).toHaveLength(2);
    });
});
