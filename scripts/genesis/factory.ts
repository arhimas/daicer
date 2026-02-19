import { SchemaLoader } from '../../src/features/genesis-core/schema-loader';
import { LLMBridge } from '../../src/features/genesis-core/llm-bridge';
import { DryRunService } from '../../src/features/genesis-core/dry-run';
import { PromptBuilder } from '../../src/features/genesis-core/prompt-builder';
import { JsonSchemaBuilder } from '../../src/features/genesis-core/json-schema-builder';

// Factory to create the engine stack
export function createGenesisEngine() {
    // Configure paths relative to CWD (project root usually)
    const loader = new SchemaLoader('./schema');
    const jsonBuilder = new JsonSchemaBuilder(loader);
    const prompts = new PromptBuilder(jsonBuilder);
    const bridge = new LLMBridge();
    const dryRun = new DryRunService(loader);

    return {
        loader,
        prompts,
        bridge,
        dryRun
    };
}
