/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntityMapper, GenerationRequest } from '@/features/genesis-core/mappers/entity-mapper';

// --- Damage Type ---
export class DamageTypeMapper extends EntityMapper<any> {
  getUid(): string {
    return 'api::damage-type.damage-type';
  }
  map(entity: any): GenerationRequest {
    const prompt = `Generate a D&D 5e Damage Type. Map 'name' and 'desc'. Ensure 'slug' is kebab-case. Reference: ${this.formatJson(entity)}`;
    return { uid: this.getUid(), prompt, referenceId: entity.index || entity.slug, name: entity.name };
  }
}

// --- Condition ---
export class ConditionMapper extends EntityMapper<any> {
  getUid(): string {
    return 'api::status-effect.status-effect';
  }
  map(entity: any): GenerationRequest {
    const prompt = `Generate a D&D 5e Condition (Status Effect). Map 'name' and 'desc'. Ensure 'slug' is kebab-case. Reference: ${this.formatJson(entity)}`;
    return { uid: this.getUid(), prompt, referenceId: entity.index || entity.slug, name: entity.name };
  }
}

// --- Magic School ---
export class MagicSchoolMapper extends EntityMapper<any> {
  getUid(): string {
    return 'api::magic-school.magic-school';
  }
  map(entity: any): GenerationRequest {
    const prompt = `Generate a D&D 5e Magic School. Map 'name' and 'desc'. Ensure 'slug' is kebab-case. Reference: ${this.formatJson(entity)}`;
    return { uid: this.getUid(), prompt, referenceId: entity.index || entity.slug, name: entity.name };
  }
}

// --- Background ---
export class BackgroundMapper extends EntityMapper<any> {
  getUid(): string {
    return 'api::background.background';
  }
  map(entity: any): GenerationRequest {
    const prompt = `Generate a D&D 5e Background. Map 'name', 'desc', 'feature', 'proficiencies', 'equipment'. Ensure 'slug' is kebab-case. Reference: ${this.formatJson(entity)}`;
    return { uid: this.getUid(), prompt, referenceId: entity.index || entity.slug, name: entity.name };
  }
}

// --- Weapon Property ---
export class WeaponPropertyMapper extends EntityMapper<any> {
  getUid(): string {
    return 'api::weapon-property.weapon-property';
  }
  map(entity: any): GenerationRequest {
    const prompt = `Generate a D&D 5e Weapon Property. Map 'name' and 'desc'. Ensure 'slug' is kebab-case. Reference: ${this.formatJson(entity)}`;
    return { uid: this.getUid(), prompt, referenceId: entity.index || entity.slug, name: entity.name };
  }
}
