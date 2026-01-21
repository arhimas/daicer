import { ICompiler, CompilationResult } from './Compiler';
import { DamageTypeCompiler } from './atoms/DamageTypeCompiler';
import { ConditionCompiler } from './atoms/ConditionCompiler';
import { SpellCompiler } from './molecules/SpellCompiler';
import { FeatureCompiler } from './molecules/FeatureCompiler';
import { EquipmentCompiler } from './compounds/EquipmentCompiler';
import { EntityCompiler } from './blueprints/EntityCompiler';

// Stub for Strapi Global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const strapi: any;

export class CompilationOrchestrator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private compilers: Map<string, ICompiler<any>> = new Map();

  constructor() {
    this.register(new DamageTypeCompiler());
    this.register(new ConditionCompiler());
    this.register(new SpellCompiler());
    this.register(new FeatureCompiler());
    this.register(new EquipmentCompiler());
    this.register(new EntityCompiler());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(compiler: ICompiler<any>) {
    this.compilers.set(compiler.name, compiler);
  }

  async runPhase(phase: 'Atom' | 'Molecule' | 'Compound' | 'Blueprint'): Promise<void> {  
    strapi.log.info(`[Compilation] Starting Phase: ${phase}`);
    
    // Mapping Phase to Content Types
    const phaseMap: Record<string, string[]> = {
        'Atom': ['api::damage-type.damage-type', 'api::status-effect.status-effect'],
        'Molecule': ['api::spell.spell', 'api::feature.feature'],
        'Compound': ['api::item.item'], // Placeholder
        'Blueprint': ['api::entity.entity'] // Placeholder
    };

    const types = phaseMap[phase] || [];

    for (const uid of types) {
        await this.compileCollection(uid);
    }
  }

  async compileCollection(uid: string) {
     strapi.log.info(`[Compilation] Processing Collection: ${uid}`);
     
     const populate = this.getPopulate(uid);

     // 1. Fetchall
     const entries = await strapi.entityService.findMany(uid, {
         populate
     });

     if (Array.isArray(entries)) {
         for (const entry of entries) {
             await this.compileEntity(uid, (entry as any).id, entry);
         }
     }
  }

  async compileEntity(uid: string, id: number | string, data?: unknown) {
      // 1. Fetch if needed
      let entity = data;
      if (!entity) {
          entity = await strapi.entityService.findOne(uid, id, {
              populate: this.getPopulate(uid)
          });
      }

      if (!entity) {
          strapi.log.error(`[Compilation] Entity not found: ${uid}:${id}`);
          return;
      }

      // 2. Determine Compiler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let compiler: ICompiler<any> | undefined;
      // Atom Phase
      if (uid === 'api::damage-type.damage-type') compiler = this.compilers.get('DamageTypeCompiler');
      if (uid === 'api::status-effect.status-effect') compiler = this.compilers.get('ConditionCompiler');
      
      // Molecule Phase
      if (uid === 'api::spell.spell') compiler = this.compilers.get('SpellCompiler');
      if (uid === 'api::feature.feature') compiler = this.compilers.get('FeatureCompiler');
      
      // Compound Phase
      if (uid === 'api::item.item') compiler = this.compilers.get('EquipmentCompiler');
      
      // Blueprint Phase
      if (uid === 'api::entity.entity') compiler = this.compilers.get('EntityCompiler');

      if (!compiler) {
         strapi.log.warn(`[Compilation] No compiler found for ${uid}`);
         return;
      }

      try {
          const result = await compiler.compile(entity);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await this.saveResult(uid, (entity as any).id, result);
          if (result.status === 'Valid') {
              strapi.log.info(`[Compilation] ${uid}:${id} -> ${result.status}`);
          } else {
              strapi.log.warn(`[Compilation] ${uid}:${id} -> ${result.status}`);
              result.logs.forEach(l => {
                  if (l.level === 'error') strapi.log.error(`   ❌ ${l.message}`);
                  if (l.level === 'warn') strapi.log.warn(`    ⚠️ ${l.message}`);
              });
          }
      } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          strapi.log.error(`[Compilation] Crash on ${(entity as any).id}`, e);
      }
  }

  private getPopulate(uid: string): string[] {
      const base = ['compilation_state'];
      
      switch (uid) {
          case 'api::entity.entity':
              return [...base, 'stats', 'inventory', 'inventory.item', 'actions'];
          case 'api::item.item':
             return [...base, 'equipment_category'];
          case 'api::spell.spell':
             return [...base, 'casting_config', 'range_config', 'mechanics_config', 'damage_instances', 'condition_instances'];
      }
      return base;
  }

  private async saveResult(uid: string, id: number | string, result: CompilationResult) {
      // Update the Entity's Component
      await strapi.entityService.update(uid, id, {
          data: {
              compilation_state: {
                  status: result.status,
                  last_run: result.timestamp,
                  summary: result.status === 'Valid' ? 'Passed Checks' : result.error || 'Validation Failed'
              }
          }
      });

      // 2. Log Result
      if (result.status === 'Valid') {
        strapi.log.info(`[Compilation] ${uid}:${id} -> ${result.status}`);
      } else {
        strapi.log.warn(`[Compilation] ${uid}:${id} -> ${result.status} (${result.error})`);
      }
  }
}
