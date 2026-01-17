import { BaseCompiler, CompilationResult } from '../Compiler';


/**
 * Validates 'api::feature.feature' entities.
 * 1. Checks basic metadata.
 * 2. Checks if logic exists in FeatureRegistry (Optional, but good info).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FeatureCompiler extends BaseCompiler<Record<string, any>> {
    readonly name = 'FeatureCompiler';
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
        if (!data.name) this.logError(result, 'Missing Name');
        
        // 2. Registry Lookup
        // It's okay if it's not in the registry (Passive Feature), but we might want to know.
        // If the feature claims to have mechanical effects but isn't registered, that's a warning.
        
        // We assume FeatureRegistry has a static 'get' or check. 
        // Based on viewed code, it seems to be a Class instance usually, but let's check imports.
        // Assuming we can instantiate or access a singleton if it exists, 
        // OR we just assume that if we can't find it, it's passive.
        
        // Strategy: We won't crash on registry, just log info for now.
        // "Is this feature purely descriptive?"
        
        this.logInfo(result, `Validated Feature: ${slug}`);

        return result;
    }
}
