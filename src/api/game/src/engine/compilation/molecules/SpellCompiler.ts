import { BaseCompiler, CompilationResult } from '../Compiler';
import { ActionHydrator } from '../../derivation/ActionHydrator';
import { DerivationContext } from '../../derivation/types';

/**
 * Validates 'api::spell.spell' entities.
 * 1. Checks static fields (slug, school, level).
 * 2. Attempts to Hydrate the spell into a RuntimeAction (Dry Run).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SpellCompiler extends BaseCompiler<Record<string, any>> {
    readonly name = 'SpellCompiler';
    readonly phase = 'Molecule';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async compile(data: Record<string, any>): Promise<CompilationResult> {
        const result = this.createResult();
        const slug = data.slug;

        if (!slug) {
            this.logError(result, 'Missing slug');
            return result;
        }

        // 1. Static Validation
        if (!data.school) this.logWarn(result, 'Missing School');
        if (data.level === undefined || data.level === null) this.logError(result, 'Missing Level');

        // 2. Hydration Dry Run
        // We create a Mock Context to simulate a caster
        const mockContext: DerivationContext = {
            stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            proficiencyBonus: 2,
            spellcastingAbility: 'intelligence',
            level: 1,
            equipment: [],
        };

        try {
            // This function converts the DB JSON -> RuntimeAction
            // It parses dice formulas (e.g. "8d6"), validates ranges, etc.
            const runtimeAction = ActionHydrator.hydrateFromSpell(data, mockContext);
            
            if (!runtimeAction) {
                this.logError(result, 'Hydration returned null/undefined');
            } else {
                this.logInfo(result, `Successfully Hydrated: ${runtimeAction.name}`);
                
                // Deep Check on Damage Instances (via effects)
                if (runtimeAction.effects && runtimeAction.effects.length > 0) {
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     runtimeAction.effects.forEach((eff: any, i: number) => {
                         if (eff.type === 'damage') {
                            if (!eff.dice && !eff.amount && !eff.flat) {
                                this.logWarn(result, `Effect ${i} (Damage) has no dice or flat value.`);
                            }
                         }
                     });
                }
            }
        } catch (e) {
            this.logError(result, `Hydration Crash: ${e.message}`, { stack: e.stack });
        }

        return result;
    }
}
