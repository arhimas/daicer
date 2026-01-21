import { BaseCompiler, CompilationResult } from '../Compiler';
import { ConditionType } from '../../rules/conditions';

/**
 * Validates 'api::status-effect' entities against the Engine's Condition rules.
 * Ensures the slug matches a known condition in the engine enum.
 */
export class ConditionCompiler extends BaseCompiler<Record<string, unknown>> {
    readonly name = 'ConditionCompiler';
    readonly phase = 'Atom';

    async compile(data: Record<string, unknown>): Promise<CompilationResult> {
        const result = this.createResult();
        const slug = data.slug as string | undefined;
        
        if (!slug) {
            this.logError(result, 'Missing slug');
            return result;
        }

        const cleanSlug = slug.replace('status-effect.', '').toLowerCase();

        // 1. Check against Engine Constants
        // Get all enum values
        const validConditions = Object.values(ConditionType).map(v => v.toLowerCase());

        if (!validConditions.includes(cleanSlug)) {
             this.logError(result, `Unknown Condition: '${cleanSlug}'. Engine only supports: ${validConditions.join(', ')}`);
        } else {
             this.logInfo(result, `Validated Condition: ${cleanSlug}`);
        }

        return result;
    }
}
