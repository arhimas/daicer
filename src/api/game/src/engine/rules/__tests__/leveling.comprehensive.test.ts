import { resolveLevelUp, getLevelFromXP } from '../leveling';
import { EntitySheet } from '../../types';
import { RuleSet, ClassDefinition, ClassProgression } from '../../types/rules';
import { describe, expect, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// --- Mocks & Factories ---

const MOCK_RULES: RuleSet = {
  xp_table: [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000,
    265000, 305000, 355000,
  ],
  proficiency_table: {
    '1': 2,
    '2': 2,
    '3': 2,
    '4': 2,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 4,
    '10': 4,
    '11': 4,
    '12': 4,
    '13': 5,
    '14': 5,
    '15': 5,
    '16': 5,
    '17': 6,
    '18': 6,
    '19': 6,
    '20': 6,
  },
  full_caster_slots: {
    // simplified generic table, typical full caster
    '1': [2],
    '2': [3],
    '3': [4, 2],
    '4': [4, 3],
    '5': [4, 3, 2], // ... truncated for brevity, full table in real rules
  },
};

const CLASSES_DIR = path.join(process.cwd(), 'data/library/molecules/classes');
const ALL_CLASSES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
];

interface RawClassJSON {
  slug: string;
  name: string;
  hit_die: string | number;
  progression: {
    level: number;
    pb: number;
    features: string[]; // Raw strings from JSON
    spell_slots?: any; // varies
  }[];
}

function loadClassDefinition(slug: string): ClassDefinition {
  const filePath = path.join(CLASSES_DIR, `${slug}.json`);
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const json: RawClassJSON[] = JSON.parse(rawContent);
  const data = json[0]; // array wrapper

  // TRANSFORM RAW JSON TO STRICT TYPESCRIPT DEFINITION WITH RELATIONS
  const progression: ClassProgression[] = data.progression.map((p) => ({
    level: p.level,
    features: p.features.map((fName) => ({
      documentId: `mock-feat-${slug}-${fName.toLowerCase().replace(/\s+/g, '-')}`,
      name: fName,
    })),
    // Spell Slots logic might need manual mapping if JSON structure varies widely,
    // but for now we trust ClassDefinition might lazily carry it or we rely on rules.
    // The JSONs actually have `spell_slots` often null or complex. We'll ignore extensive spell slot parsing
    // in this factory unless critical for the 'feature' test.
    // For Wizard/Bard it's implied by "Spellcasting" feature usually.
    class_specifics: {},
  }));

  return {
    name: data.name,
    hit_die: typeof data.hit_die === 'number' ? `1d${data.hit_die}` : data.hit_die,
    progression: progression,
  };
}

function createBaseSheet(className: string): EntitySheet {
  return {
    id: 'test-char-1',
    name: 'Test Character',
    race: 'Human',
    characterClass: className,
    level: 1,
    xp: 0,
    hp: 10,
    maxHp: 10,
    attributes: {
      Strength: 10,
      Dexterity: 10,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    } as any, // casting for simplicity in test
    hitDice: { total: 1, current: 1, die: '1d8' }, // Default, will be overwritten by class load
    proficiencyBonus: 2,
    features: [],
    spells: [],
    inventory: [],
    skills: {},
    savingThrows: { fortitude: 0, reflex: 0, will: 0 },
    actions: [],
    proficiencies: [],
    languages: [],
    traits: [],
    conditions: [],
    resources: [],
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      passivePerception: 10,
      initiativeBonus: 0,
    },
    // legacy required fields
    background: 'Noble',
    alignment: 'Neutral',
    appearance: {} as any,
    personality: {} as any,
    backstory: '',
    backgroundDetails: {} as any,
    alliesAndOrganizations: '',
    treasure: '',
    advancementPoints: { ability: 0, skill: 0, talent: 0 },
    expertises: [],
    deathSaves: { successes: 0, failures: 0 },
    inspiration: false,
    speed: 30,
    armorClass: 10,
    initiative: 0,
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    structuredActions: [],
    talents: [],
  };
}

// --- Tests ---

describe('Comprehensive Leveling System (1-20)', () => {
  // 1. Validate XP Table Logic first
  test('XP Table Thresholds', () => {
    // 0 -> 1
    expect(getLevelFromXP(0, MOCK_RULES)).toBe(1);
    expect(getLevelFromXP(299, MOCK_RULES)).toBe(1);

    // 300 -> 2
    expect(getLevelFromXP(300, MOCK_RULES)).toBe(2);

    // 6500 -> 5
    expect(getLevelFromXP(6500, MOCK_RULES)).toBe(5);

    // 355000 -> 20
    expect(getLevelFromXP(355000, MOCK_RULES)).toBe(20);
  });

  // 2. Class Leveling Loop
  describe.each(ALL_CLASSES)('Class: %s', (slug) => {
    const classDef = loadClassDefinition(slug);

    test(`Levels 1-20 correctly for ${classDef.name}`, () => {
      let sheet = createBaseSheet(classDef.name);

      // Override hit die from class
      sheet.hitDice.die = classDef.hit_die;

      // Initial Logic Verification (Level 1 typically handled by Creation, but let's ensure base)
      expect(sheet.level).toBe(1);

      // LEVEL UP LOOP
      for (let lvl = 2; lvl <= 20; lvl++) {
        const prevHp = sheet.maxHp;

        // NEGATIVE TEST: Verify features for THIS level (lvl) are NOT YET present in the sheet (which is at lvl-1)
        // This proves "features are only allowed in the correct level"
        const featuresForNextLevel = classDef.progression.find((p) => p.level === lvl)?.features || [];
        for (const futureFeat of featuresForNextLevel) {
          // Skip if we already got it at a previous level (rare, but possible if feature repeats e.g. "Ability Score Improvement" with distinct effects, though usually names differ like ASI IV, ASI V or implicit)
          // Actually, standard naming usually repeats "Ability Score Improvement".
          // So we only assert NOT PRESENT if it wasn't ALSO in a previous level.
          const gainedPreviously = classDef.progression
            .filter((p) => p.level < lvl)
            .some((p) => p.features.some((f) => f.name === futureFeat.name));

          if (!gainedPreviously) {
            const hasIt = sheet.features.some((f) => f.name === futureFeat.name);
            expect(hasIt).toBe(false);
          }
        }

        // Advance Time/XP
        // We manually set level to iterate (resolveLevelUp is pure and expects input sheet)
        // Actually resolveLevelUp logic: "const newLevel = sheet.level + 1"
        // So we just feed it the previous sheet.
        const outputSheet = resolveLevelUp(sheet, classDef, MOCK_RULES);

        // ASSERTIONS

        // 1. Level Increased
        expect(outputSheet.level).toBe(lvl);

        // 2. HP Increased (Deterministic Average + CON 0)
        // HitDie 1d8 (avg 5), 1d12 (avg 7), etc.
        // Formula: max(1, avg + conMod)
        // Just verify it went UP. Exact math tested in unit test.
        expect(outputSheet.maxHp).toBeGreaterThan(prevHp);

        // 3. PB Updated
        const expectedPB = MOCK_RULES.proficiency_table[lvl.toString()];
        expect(outputSheet.proficiencyBonus).toBe(expectedPB);

        // 4. Features Added
        const featuresForLevel = classDef.progression.find((p) => p.level === lvl)?.features || [];
        // Check that AT LEAST these new features exist in the sheet
        // Note: mock features have 'documentId' and 'name'.
        for (const feat of featuresForLevel) {
          const hasFeat = outputSheet.features.some((f) => f.name === feat.name);
          expect(hasFeat).toBe(true);
        }

        // Update iterator for next pass
        sheet = outputSheet;
      }

      // Final State Check
      expect(sheet.level).toBe(20);
      expect(sheet.features.length).toBeGreaterThan(0);
    });
  });
});
