import { client } from '../src/cli/utils/client';

const CLASS_DATA = {
  Barbarian: {
    hit_die: 'd12',
    description: 'A fierce warrior of primitive background who can enter a battle rage.',
  },
  Bard: {
    hit_die: 'd8',
    description: 'An inspiring magician whose power echoes the music of creation.',
  },
  Cleric: {
    hit_die: 'd8',
    description: 'A priestly champion who wields divine magic in service of a higher power.',
  },
  Druid: {
    hit_die: 'd8',
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.',
  },
  Fighter: {
    hit_die: 'd10',
    description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  },
  Monk: {
    hit_die: 'd8',
    description:
      'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.',
  },
  Paladin: {
    hit_die: 'd10',
    description: 'A holy warrior bound to a sacred oath.',
  },
  Ranger: {
    hit_die: 'd10',
    description: 'A warrior who combats threats on the edges of civilization.',
  },
  Rogue: {
    hit_die: 'd8',
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.',
  },
  Sorcerer: {
    hit_die: 'd6',
    description: 'A spellcaster who draws on inherent magic from a gift or bloodline.',
  },
  Warlock: {
    hit_die: 'd8',
    description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.',
  },
  Wizard: {
    hit_die: 'd6',
    description: 'A scholarly magic-user capable of manipulating the structures of reality.',
  },
};

async function run() {
  console.log('Starting Class Data Update...');

  // 1. Fetch all classes
  const classes = await client.collection('classes').find({ limit: 50 });
  const classList = Array.isArray(classes) ? classes : (classes as any).data;

  if (!classList || classList.length === 0) {
    console.error('No classes found in database!');
    process.exit(1);
  }

  console.log(`Found ${classList.length} classes to update.`);

  // 2. Update each class
  for (const classEntry of classList) {
    // Handle V4/V5 data structure differences (attributes vs flat)
    const name = classEntry.name || classEntry.attributes?.name;
    const documentId = classEntry.documentId; // V5 uses documentId

    if (!name) {
      console.warn('Skipping class with no name:', classEntry);
      continue;
    }

    const data = CLASS_DATA[name as keyof typeof CLASS_DATA];
    if (!data) {
      console.warn(`No data defined for class: ${name}`);
      continue;
    }

    console.log(`Updating ${name} (ID: ${documentId})...`);
    console.log(`  Hit Die: ${data.hit_die}`);
    console.log(`  Description: ${data.description}`);

    try {
      await client.collection('classes').update(documentId, {
        hit_die: data.hit_die,
        description: data.description, // Note: Schema defines this as RichText, passing string usually works or needs specific format
      });
      console.log(`  ✅ Updated ${name}`);
    } catch (err) {
      console.error(`  ❌ Failed to update ${name}:`, err);
    }
  }

  console.log('\nUpdate complete.');
}

run().catch(console.error);
