import { EntitySpell } from '../../../../engine/types';
import { StrapiSpell, StrapiSpellbook } from './types';

const mapSpell = (s: StrapiSpell, source: 'known' | 'prepared'): EntitySpell => ({
  documentId: s.documentId,
  name: s.name,
  level: s.level || 0,
  school: s.school?.name || 'Universal',
  source,
  castingTime: s.casting_time || '1 Action',
  range: s.range || 'Self',
  description: s.description || 'No description available.',
  // SOTA V2: Could parse components/duration if engine supported them
});

export const resolveSpells = (spellbook?: StrapiSpellbook): EntitySpell[] => {
  const spells: EntitySpell[] = [];

  if (!spellbook) return spells;

  // 1. Process Known Spells
  if (Array.isArray(spellbook.knownSpells)) {
    spells.push(...spellbook.knownSpells.map((s) => mapSpell(s, 'known')));
  }

  // 2. Process Prepared Spells (Deduplicate or Update Source)
  if (Array.isArray(spellbook.preparedSpells)) {
    spellbook.preparedSpells.forEach((s) => {
      const existingMsg = spells.find((e) => e.documentId === s.documentId);
      if (!existingMsg) {
        spells.push(mapSpell(s, 'prepared'));
      } else {
        // Upgrade status to prepared (implies known + prepared)
        existingMsg.source = 'prepared';
      }
    });
  }

  return spells;
};
