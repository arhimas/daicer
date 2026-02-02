export interface ClassFeature {
  name: string;
  level: number;
  description: string;
  is_subclass_feature?: boolean;
}

export interface ClassValidationData {
  slug: string;
  name: string;
  hit_die: number;
  proficiency_choices: string[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    saving_throws: string[];
  };
  equipment: string[];
  progression: Array<{
    level: number;
    pb: number;
    features: string[];
    span_slots?: Record<number, number>; // level -> amount
    class_specific?: Record<string, unknown>; // e.g. "Rage Damage", "Sneak Attack"
  }>;
}

export interface ParseResult {
  classData: ClassValidationData;
  features: ClassFeature[];
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}
