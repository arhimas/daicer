import { BaseCompiler, CompilationResult } from '@daicer/engine/compilation/Compiler';

/**
 * Validates 'api::damage-type' entities against the Engine's DamageType enum.
 * Philosophy: "If the Engine can't compute it, it doesn't exist."
 */
export class DamageTypeCompiler extends BaseCompiler<Record<string, unknown>> {
  readonly name = 'DamageTypeCompiler';
  readonly phase = 'Atom';

  async compile(data: Record<string, unknown>): Promise<CompilationResult> {
    const result = this.createResult();
    const slug = data.slug as string | undefined;

    // 1. Static Validation
    if (!slug) {
      this.logError(result, 'Missing slug');
      return result;
    }

    // 2. Engine Logic Check (Enum Parsing)
    // The slug (e.g. "damage-type.fire" or just "fire") must map to DamageType enum
    // Strategy: Clean the slug and check inclusion
    const cleanSlug = slug.replace('damage-type.', '').toLowerCase();

    // Valid Enum Values
    const validTypes: string[] = [
      'slashing',
      'piercing',
      'bludgeoning',
      'fire',
      'cold',
      'lightning',
      'thunder',
      'poison',
      'acid',
      'psychic',
      'necrotic',
      'radiant',
      'force',
      'precision',
    ];

    if (!validTypes.includes(cleanSlug)) {
      this.logError(result, `Invalid DamageType slug: '${slug}'. Engine only supports: ${validTypes.join(', ')}`);
    } else {
      this.logInfo(result, `Validated DamageType: ${cleanSlug}`);
    }

    return result;
  }
}
