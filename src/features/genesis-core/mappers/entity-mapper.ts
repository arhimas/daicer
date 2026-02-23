/* eslint-disable @typescript-eslint/no-explicit-any */

export interface GenerationRequest {
  uid: string; // Strapi UID (e.g., 'api::spell.spell')
  prompt: string; // The instruction for the LLM
  referenceId: string; // Original ID/Index (e.g., 'fireball')
  name: string; // Readable name (e.g., 'Fireball')
}

export abstract class EntityMapper<TSource> {
  abstract getUid(): string;

  abstract map(entity: TSource): GenerationRequest;

  protected formatJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
