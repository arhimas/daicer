import { EntityLanguage, EntityProficiency } from '../../src/engine/types';
import { StrapiEntitySheet } from './types';

export const resolveProficiencies = (
  sheet: StrapiEntitySheet
): { proficiencies: EntityProficiency[]; languages: EntityLanguage[] } => {
  // 1. Proficiencies (Skills, Armor, Weapons)
  const proficiencies: EntityProficiency[] = (sheet.proficiencies || []).map((p) => ({
    documentId: p.documentId,
    name: p.name,
    type: p.type || 'General',
    // SOTA: We could map p.attribute here if Engine supported it
  }));

  // 2. Languages
  const languages: EntityLanguage[] = (sheet.languages || []).map((l) => ({
    documentId: l.documentId,
    name: l.name,
    isRare: l.is_rare,
  }));

  return { proficiencies, languages };
};
