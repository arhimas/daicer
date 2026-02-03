import { BaseCompiler, CompilationResult } from '@daicer/engine/compilation/Compiler';
import { ActionHydrator } from '@daicer/engine/derivation/ActionHydrator';
import { createValidationContext } from '@daicer/engine/derivation/types';

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
    const isWeapon =
      data.damage_dice ||
      (data.equipment_category && ['weapon', 'simple-weapon', 'martial-weapon'].includes(data.equipment_category.slug));

    if (isWeapon) {
      const mockContext = createValidationContext();

      try {
        // Cast to SerializedItem for hydration attempt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actions = ActionHydrator.hydrateFromEquipment(data as any, mockContext);

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
        this.logError(result, `Weapon Hydration Crash: ${(e as Error).message}`);
      }
    }

    return result;
  }
}
