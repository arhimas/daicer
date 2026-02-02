
import { StrapiAdapter, LLMCoreConfig } from '../types';
import { SNIPPETS } from './snippets';

export class ContextBuilder {
  constructor(private adapter: StrapiAdapter, private config: LLMCoreConfig) {}

  /**
   * Builds the Deep Context string by merging Database State with Frontend Draft State.
   * Handles strict schema introspection and conflict resolution.
   */
  async buildEntityContext(
    config: { 
      entityContext?: { uid: string; documentId: string }; 
      entityData?: Record<string, unknown>; 
      prompt?: string;
      type?: string;
      archetype?: string;
      width: number;
      height: number;
      size: string;
    }
  ): Promise<string> {
    if (config.entityContext?.uid && config.entityContext?.documentId) {
      try {
        const { uid, documentId } = config.entityContext;
        
        // A. Deep Fetch via Adapter
        let dbEntity = {};
        if (this.adapter.fetchContext) {
            dbEntity = await this.adapter.fetchContext(uid, documentId);
        } else {
            // Fallback to basic fetch if no custom fetcher provided
            dbEntity = await this.adapter.db.query(uid).findOne({ where: { documentId } });
        }

        // B. Merge Frontend Data (Draft State)
        const mergedEntity = { 
            ...dbEntity, 
            ...(config.entityContext.uid === uid ? config.entityData : {}) 
        };

        // C. Introspect Schema
        const model = this.adapter.getModel(uid);
        
        // D. Build Context String
        let contextDataString = `ENTITY TYPE: ${model.info.displayName || uid}\n` + 
                                `JSON DATA:\n${JSON.stringify(mergedEntity, null, 2)}`;
        
        this.adapter.log.info(`Pixel Forge: SOTA Deep Context Injected (Merged Draft) for ${uid}:${documentId}`);

        // E. Conflict Resolution
        if (config.prompt && config.prompt.length > 5) {
            contextDataString += SNIPPETS.PROMPT_OVERRIDE_WARNING(config.prompt);
        }

        return contextDataString;
      } catch (e) {
        this.adapter.log.warn("Pixel Forge: Deep Context Fetch Failed/Skipped, using Shallow Data.", e);
        return this.formatShallowContext(config);
      }
    }

    return this.formatShallowContext(config);
  }

  /**
   * Formats shallow context when deep fetch is impossible or failed.
   */
  private formatShallowContext(config: { 
    entityData?: Record<string, unknown>; 
    type?: string; 
    archetype?: string; 
    width: number; 
    height: number; 
    size: string 
  }): string {
    const context = [
        SNIPPETS.SHALLOW_CONTEXT_HEADER,
        `- Generated Type: ${config.type || 'Unknown'}`,
        `- Archetype: ${config.archetype || 'Unknown'}`,
        `- Target Size: ${config.size} (${config.width}x${config.height})`
    ];
    
    const data = config.entityData;
    if (data && Object.keys(data).length > 0) {
        for (const [key, value] of Object.entries(data)) {
            if (SNIPPETS.IGNORED_SHALLOW_KEYS.includes(key)) continue;
            const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
            context.push(`- ${key}: ${valStr}`);
        }
    } else {
        context.push(SNIPPETS.SHALLOW_DATA_FALLBACK);
    }
    return context.join('\n');
  }

  /**
   * Builds the Vision Instruction block, injecting Semantic Zone definitions.
   */
  async buildVisionContext(): Promise<{ instruction: string; zoneMap: Record<string, string> }> {
    let visionInstruction = SNIPPETS.VISION_INSTRUCTION_PREFIX;
    const dynamicZoneMap: Record<string, string> = {};

    try {
        const uid = this.config.contentTypes?.['zone'];
        if (uid) {
            const zones = await this.adapter.db.query(uid).findMany();
            
            if (zones && zones.length > 0) {
                 const zoneList = zones.map((z: any) => {
                     const color = z.color.toUpperCase();
                     const slug = z.slug.toLowerCase();
                     // Map Slug -> Color for blueprintToPixels logic
                     dynamicZoneMap[slug] = color;
                     
                     return `- ${z.name} [${color}]: ${z.description || ''}`;
                 }).join('\n');
                 visionInstruction += `\n\nSEMANTIC ZONES (Color -> Meaning):\n${zoneList}`;
            }
        }
    } catch(e) {
        this.adapter.log.warn("Failed to load zones for prompt context", e);
    }

    return { instruction: visionInstruction, zoneMap: dynamicZoneMap };
  }
}
