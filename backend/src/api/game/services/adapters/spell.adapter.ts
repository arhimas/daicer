import { EntitySpell } from '../../src/engine/types';
import { StrapiSpell, StrapiSpellbook } from './types';

export const mapStrapiSpellToEntitySpell = (s: StrapiSpell, source: 'known' | 'prepared' | 'innate'): EntitySpell => {
  // Casting Time
  let castingTime = s.casting_time || '1 Action';
  if (s.casting_config) {
    const val = s.casting_config.casting_time || s.casting_config.time_unit || '1 Action';
    castingTime = val;
  }

  // Range
  let range = typeof s.range === 'string' ? s.range : 'Self';
  if (s.range_config) {
    if (s.range_config.type === 'Ranged (Feet)') range = `${s.range_config.distance} ft`;
    else if (s.range_config.type === 'Ranged (Miles)') range = `${s.range_config.distance} miles`;
    else range = s.range_config.type || 'Self';
  }

  // School resolution
  let schoolName = 'Universal';
  if (typeof s.school === 'string') {
    schoolName = s.school;
  } else if (s.school && typeof s.school === 'object' && 'name' in s.school) {
    schoolName = s.school.name;
  }

  return {
    documentId: s.documentId,
    name: s.name,
    level: s.level || 0,
    school: schoolName,
    source,
    castingTime,
    range,
    description: s.description || 'No description available.',
  };
};

export const resolveSpells = (spellbook?: StrapiSpellbook): EntitySpell[] => {
  const spells: EntitySpell[] = [];

  if (!spellbook) return spells;

  // 1. Process Known Spells
  if (Array.isArray(spellbook.knownSpells)) {
    spells.push(...spellbook.knownSpells.map((s) => mapStrapiSpellToEntitySpell(s, 'known')));
  }

  // 2. Process Prepared Spells (Deduplicate or Update Source)
  if (Array.isArray(spellbook.preparedSpells)) {
    spellbook.preparedSpells.forEach((s) => {
      const existingMsg = spells.find((e) => e.documentId === s.documentId);
      if (!existingMsg) {
        spells.push(mapStrapiSpellToEntitySpell(s, 'prepared'));
      } else {
        // Upgrade status to prepared (implies known + prepared)
        existingMsg.source = 'prepared';
      }
    });
  }

  return spells;
};
