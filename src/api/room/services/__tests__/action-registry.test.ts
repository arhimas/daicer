
import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '@/api/room/services/action-registry';

describe('Action Registry', () => {
    let actionRegistry: any;
    let mockStrapi: any;

    beforeEach(() => {
        mockStrapi = {
            entityService: {
                findOne: vi.fn(),
                update: vi.fn(),
            },
        };
        actionRegistry = service({ strapi: mockStrapi });
    });

    describe('rollDice', () => {
        it('should correctly parsing simple dice notation (1d20)', () => {
            const result = actionRegistry.rollDice('1d20');
            expect(result.total).toBeGreaterThanOrEqual(1);
            expect(result.total).toBeLessThanOrEqual(20);
            expect(result.rolls).toHaveLength(1);
            expect(result.modifier).toBe(0);
        });

        it('should correctly parse dice notation with modifier (2d6+5)', () => {
            const result = actionRegistry.rollDice('2d6+5');
            expect(result.total).toBeGreaterThanOrEqual(7); // 1+1+5
            expect(result.total).toBeLessThanOrEqual(17); // 6+6+5
            expect(result.rolls).toHaveLength(2);
            expect(result.modifier).toBe(5);
        });

        it('should correctly parse dice notation with negative modifier (1d10-2)', () => {
             const result = actionRegistry.rollDice('1d10-2');
             expect(result.total).toBeGreaterThanOrEqual(-1); // 1-2
             expect(result.total).toBeLessThanOrEqual(8); // 10-2
             expect(result.modifier).toBe(-2);
        });

        it('should handle simple integers as constant rolls', () => {
            const result = actionRegistry.rollDice('10');
            expect(result.total).toBe(10);
            expect(result.rolls).toHaveLength(0);
        });

        it('should throw error for invalid dice expression', () => {
            expect(() => actionRegistry.rollDice('invalid')).toThrow('Invalid dice expression: invalid');
        });

        it('should throw error for too many dice', () => {
            expect(() => actionRegistry.rollDice('101d6')).toThrow('Too many dice!');
        });

         it('should throw error for invalid sides', () => {
            expect(() => actionRegistry.rollDice('1d1')).toThrow('Invalid die sides!');
        });
    });

    describe('moveEntity', () => {
        it('should move entity successfully within speed', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue({
                position: { x: 0, y: 0 },
                stats: { speed: 30 }
            });

            // Distance 5 units = 25ft < 30ft
            const result = await actionRegistry.moveEntity(1, 4, 3);
            
            expect(result.success).toBe(true);
            // distance = max(4,3) * 5 = 20ft
            expect(result.distanceFt).toBe(20); 
            expect(result.isDash).toBe(false);
            expect(mockStrapi.entityService.update).toHaveBeenCalledWith('api::entity-sheet.entity-sheet', 1, {
                data: { position: { x: 4, y: 3 } }
            });
        });

        it('should calculate dash status correctly', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue({
                position: { x: 0, y: 0 },
                stats: { speed: 30 }
            });

             // Distance 7 units = 35ft > 30ft
             // wait, logic is max(dx, dy) * 5. 
             // x=7, y=0. Distance = 7 * 5 = 35ft.
            const result = await actionRegistry.moveEntity(1, 7, 0);

            expect(result.isDash).toBe(true);
             expect(result.distanceFt).toBe(35);
        });

        it('should throw if character sheet not found', async () => {
             mockStrapi.entityService.findOne.mockResolvedValue(null);
             await expect(actionRegistry.moveEntity(1, 10, 10)).rejects.toThrow('Character sheet not found');
        });

        it('should default current pos and speed if missing', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue({
                // missing position and stats
            });

            // Default pos 0,0. Speed 30.
            // Move to 1,0. Distance 5ft.
            const result = await actionRegistry.moveEntity(1, 1, 0);
            expect(result.success).toBe(true);
            expect(result.distanceFt).toBe(5);
        });
    });

    describe('applyDamage', () => {
        it('should apply damage and reduce HP', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue({
                currentHp: 20
            });

            const result = await actionRegistry.applyDamage(1, 5, 'slashing');

            expect(result.newHp).toBe(15);
            expect(result.isUnconscious).toBe(false);
            expect(mockStrapi.entityService.update).toHaveBeenCalledWith('api::entity-sheet.entity-sheet', 1, {
                data: { currentHp: 15 }
            });
        });

        it('should handle clamp HP to 0 and set unconscious', async () => {
             mockStrapi.entityService.findOne.mockResolvedValue({
                currentHp: 10
            });

            const result = await actionRegistry.applyDamage(1, 15, 'fire');

            expect(result.newHp).toBe(0);
            expect(result.isUnconscious).toBe(true);
            expect(mockStrapi.entityService.update).toHaveBeenCalledWith('api::entity-sheet.entity-sheet', 1, {
                data: { currentHp: 0 }
            });
        });

        it('should throw if target not found', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue(null);
            await expect(actionRegistry.applyDamage(1, 5, 'acid')).rejects.toThrow('Target not found');
        });
    });

     describe('deductResource', () => {
        it('should deduct resource successfully (mock)', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue({ id: 1 });
            const result = await actionRegistry.deductResource(1, 'arrow', 1);
            expect(result.success).toBe(true);
        });

         it('should throw if character not found', async () => {
            mockStrapi.entityService.findOne.mockResolvedValue(null);
             await expect(actionRegistry.deductResource(1, 'arrow')).rejects.toThrow('Character not found');
        });
     });
});
