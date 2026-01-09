import { ClassDefinition } from './ClassDefinition';

export class ClassRegistry {
  private static classes = new Map<string, ClassDefinition>();

  static register(def: ClassDefinition) {
    this.classes.set(def.name.toLowerCase(), def);
  }

  static get(name: string): ClassDefinition | undefined {
    return this.classes.get(name.toLowerCase());
  }

  static getAll(): ClassDefinition[] {
    return Array.from(this.classes.values());
  }
}
