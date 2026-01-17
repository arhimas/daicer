import { BaseCompiler, CompilationResult } from '../Compiler';
import { ActionHydrator } from '../../derivation/ActionHydrator';
import { DerivationContext } from '../../derivation/types';

/**
 * Validates 'api::item.item' entities.
 * Focuses on Equipment (Weapons, Armor) and General Items.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EquipmentCompiler extends BaseCompiler<Record<string, any>> {
    readonly name = 'EquipmentCompiler';
    readonly phase = 'Compound';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async compile(data: Record<string, any>): Promise<CompilationResult> {
        const result = this.createResult();
        const slug = data.slug;

        if (!slug) {
            this.logError(result, 'Missing slug');
            return result;
        }

        // 1. Static Validation
        if (!data.name) this.logError(result, 'Missing Name');
        if (!data.type) this.logWarn(result, 'Missing Type (e.g. equipment, loot)');

        // 2. Weapon Hydration Check
        // If it looks like a weapon (has damage_dice or weapon category), try to hydrate.
        const isWeapon = data.damage_dice || 
                        (data.equipment_category && ['weapon', 'simple-weapon', 'martial-weapon'].includes(data.equipment_category.slug));

        if (isWeapon) {
            const mockContext: DerivationContext = {
                stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
                attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
                proficiencyBonus: 2,
                spellcastingAbility: 'intelligence', // Irrelevant for weapons usually
                level: 1,
                equipment: [],
            };

            try {
                const actions = ActionHydrator.hydrateFromEquipment(data, mockContext);
                
                if (!actions || actions.length === 0) {
                     this.logError(result, 'Weapon Hydration failed: No actions generated.');
                } else {
                     this.logInfo(result, `Hydrated ${actions.length} action(s) for weapon.`);
                     
                     // Validate generated actions
                     actions.forEach((act, i) => {
                         if (act.effects) {
                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                             act.effects.forEach((eff: any) => {
                                 if (eff.type === 'damage' && !eff.dice && !eff.amount && !eff.flat) {
                                     this.logWarn(result, `Action ${i} (${act.name}) has damage effect without dice/amount.`);
                                 }
                             });
                         }
                     });
                }
            } catch (e) {
                this.logError(result, `Weapon Hydration Crash: ${e.message}`);
            }
        }

        return result;
    }
}
