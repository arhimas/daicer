import { BaseCompiler, CompilationResult } from '../Compiler';

/**
 * Validates 'api::entity.entity' (Blueprints).
 * Represents a "Monster Manual" entry validation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EntityCompiler extends BaseCompiler<Record<string, any>> {
  readonly name = 'EntityCompiler';
  readonly phase = 'Blueprint';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async compile(data: Record<string, any>): Promise<CompilationResult> {
    const result = this.createResult();
    const slug = data.slug;

    if (!slug) {
      this.logError(result, 'Missing slug');
      return result;
    }

    // 1. Static Metadata Validation
    if (!data.name) this.logError(result, 'Missing Name');
    if (data.level === undefined || data.level === null) this.logWarn(result, 'Missing Level/CR');

    // 2. Stats Validation
    if (!data.stats) {
      this.logError(result, 'Missing Stats Component');
    } else {
      const S = data.stats;
      if (S.strength === undefined) this.logError(result, 'Missing Strength');
      if (S.dexterity === undefined) this.logError(result, 'Missing Dexterity');
      if (S.constitution === undefined) this.logError(result, 'Missing Constitution');
      if (S.intelligence === undefined) this.logError(result, 'Missing Intelligence');
      if (S.wisdom === undefined) this.logError(result, 'Missing Wisdom');
      if (S.charisma === undefined) this.logError(result, 'Missing Charisma');
    }

    // 3. Action Validation (Relationships)
    // Strapi populates relations if requested. Orchestrator should request 'actions'.
    if (data.actions && Array.isArray(data.actions)) {
      for (const action of data.actions) {
        if (!action.type) this.logWarn(result, `Action ${action.slug} missing type`);
        // Recursively we could check if action is valid, but strictly
        // we rely on ActionCompiler (if it existed) or just basic checks here.
      }
    }

    // 4. Inventory Validation (Component)
    if (data.inventory && Array.isArray(data.inventory)) {
      for (const itemEntry of data.inventory) {
        if (!itemEntry.item) {
          this.logError(result, 'Inventory entry missing item relation');
        } else {
          // Could check if item is Valid, but that requires deep lookup
          // or trusting compilation_state of the item.
        }
      }
    }

    this.logInfo(result, `Validated Entity Blueprint: ${slug}`);
    return result;
  }
}
