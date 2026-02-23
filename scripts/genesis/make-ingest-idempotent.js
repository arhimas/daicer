/* eslint-disable */
const fs = require('fs');
const path = require('path');

let script = fs.readFileSync('scripts/genesis/ingest-5e.ts', 'utf-8');

if (!script.includes('async function entityExists')) {
  script = script.replace(
    'async function saveEntity',
    `async function entityExists(type: string, index: string): Promise<boolean> {
    const filename = path.join(process.cwd(), 'seed-data', type, \`\${index}.json\`);
    try {
        await fs.promises.access(filename);
        return true;
    } catch {
        return false;
    }
}

async function saveEntity`
  );

  // Replace loops to add the skip block
  const replacements = [
    [
      'const request = damageTypeMapper.map(dt);',
      'if (await entityExists("damage-type", dt.index)) { console.log(`⏩ Skipping ${dt.name}`); count++; continue; }\n                     const request = damageTypeMapper.map(dt);',
    ],
    [
      'const request = conditionMapper.map(cond);',
      'if (await entityExists("status-effect", cond.index)) { console.log(`⏩ Skipping ${cond.name}`); count++; continue; }\n                     const request = conditionMapper.map(cond);',
    ],
    [
      'const request = magicSchoolMapper.map(sch);',
      'if (await entityExists("magic-school", sch.index)) { console.log(`⏩ Skipping ${sch.name}`); count++; continue; }\n                     const request = magicSchoolMapper.map(sch);',
    ],
    [
      'const request = backgroundMapper.map(bg);',
      'if (await entityExists("background", bg.index)) { console.log(`⏩ Skipping ${bg.name}`); count++; continue; }\n                     const request = backgroundMapper.map(bg);',
    ],
    [
      'const request = weaponPropertyMapper.map(wp);',
      'if (await entityExists("weapon-property", wp.index)) { console.log(`⏩ Skipping ${wp.name}`); count++; continue; }\n                     const request = weaponPropertyMapper.map(wp);',
    ],
    [
      'const request = traitMapper.map(trait);',
      'if (await entityExists("trait", trait.index)) { console.log(`⏩ Skipping ${trait.name}`); count++; continue; }\n                     const request = traitMapper.map(trait);',
    ],
    [
      'const request = featureMapper.map(feat);',
      'if (await entityExists("feature", feat.index)) { console.log(`⏩ Skipping ${feat.name}`); count++; continue; }\n                     const request = featureMapper.map(feat);',
    ],
    [
      'const request = spellMapper.map(spell);',
      'if (await entityExists("spell", spell.index)) { console.log(`⏩ Skipping ${spell.name}`); count++; continue; }\n                const request = spellMapper.map(spell);',
    ],
    [
      'const request = itemMapper.map(item);',
      'if (await entityExists("item", item.index)) { console.log(`⏩ Skipping ${item.name}`); count++; continue; }\n                const request = itemMapper.map(item);',
    ],
    [
      'const request = classMapper.map(cls);',
      'if (await entityExists("class", cls.index)) { console.log(`⏩ Skipping ${cls.name}`); count++; continue; }\n                    const request = classMapper.map(cls);',
    ],
    [
      'const request = raceMapper.map(race);',
      'if (await entityExists("race", race.index)) { console.log(`⏩ Skipping ${race.name}`); count++; continue; }\n                     const request = raceMapper.map(race);',
    ],
  ];

  for (const [find, replace] of replacements) {
    script = script.replace(find, replace);
  }

  fs.writeFileSync('scripts/genesis/ingest-5e.ts', script);
  console.log('Ingest script made idempotent!');
} else {
  console.log('Already idempotent.');
}
