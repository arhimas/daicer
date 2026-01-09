import fs from 'fs';
import path from 'path';

const SEED_PATH = path.resolve(__dirname, '../../../../../../seeds/game-data');

export const loadRealMonsters = () => {
  try {
    const monstersPath = path.join(SEED_PATH, 'monsters.json');
    if (!fs.existsSync(monstersPath)) {
      console.warn(`Real data not found at ${monstersPath}, using fallback.`);
      return [];
    }
    const data = JSON.parse(fs.readFileSync(monstersPath, 'utf-8'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((m: Record<string, any>) => ({
      documentId: `mon-${m.index}`,
      name: m.name,
      type: 'monster',
      hp: m.hit_points,
      maxHp: m.hit_points,
      ac: m.armor_class?.[0]?.value || 10,
      stats: {
        strength: m.strength,
        dexterity: m.dexterity,
        constitution: m.constitution,
        intelligence: m.intelligence,
        wisdom: m.wisdom,
        charisma: m.charisma,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      structuredActions: (m.actions || []).map((a: Record<string, any>, idx: number) => {
        let type = 'utility';
        if (a.desc?.toLowerCase().includes('melee weapon attack')) type = 'melee';
        else if (a.desc?.toLowerCase().includes('ranged weapon attack')) type = 'ranged';

        return {
          id: `act-${m.index}-${idx}`,
          name: a.name,
          type,
          toHit: a.attack_bonus,
          range: a.desc?.match(/reach\s(\d+)\sft/)?.[1] || a.desc?.match(/range\s(\d+)\/(\d+)\sft/)?.[1] || '5',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          damage: a.damage?.map((d: Record<string, any>) => ({
            dice: d.damage_dice,
            type: d.damage_type?.index || 'bludgeoning',
            bonus: 0, // baked into dice usually or complex
          })),
          description: a.desc,
        };
      }),
    }));
  } catch (e) {
    console.error('Failed to load real monsters:', e);
    return [];
  }
};
