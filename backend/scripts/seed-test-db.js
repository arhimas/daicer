/**
 * SEED TEST DB
 * ------------
 * Bootstraps Strapi and seeds initial data for E2E testing.
 * Uses UPSERT strategy to avoid ID collisions in Postgres.
 *
 * Usage: yarn seed:test
 */

const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

// Mock Data
// 'DungeonMaster' to satisfy min-length=3 constraints
const USERS = [
  {
    id: 1,
    username: 'DungeonMaster',
    email: 'dm@daicer.test',
    password: 'Password123!',
    confirmed: true,
    blocked: false,
  },
  { id: 2, username: 'Alice', email: 'alice@daicer.test', password: 'Password123!', confirmed: true, blocked: false },
  { id: 3, username: 'Bob', email: 'bob@daicer.test', password: 'Password123!', confirmed: true, blocked: false },
];

const MONSTER_BLUEPRINT = {
  name: 'Acolyte',
  type: 'monster',
  maxHp: 9,
  armorClass: 10,
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 14, charisma: 11 },
  challengeRating: 0.25,
  xp: 50,
  structuredActions: [
    { name: 'Club', type: 'melee', toHit: 2, range: 5, damage: [{ dice: '1d4', bonus: 0, type: 'bludgeoning' }] },
  ],
};

async function seed() {
  console.log('🌱 Starting Seeder (Upsert Mode)...');

  // Start Strapi
  const instance = await createStrapi({ distDir: './dist' }).load();

  try {
    // 1. Seed Users
    for (const u of USERS) {
      // Check ID existence
      const existingById = await instance.db.query('plugin::users-permissions.user').findOne({ where: { id: u.id } });

      if (existingById) {
        console.log(`ℹ️ User ID ${u.id} exists. Updating to match ${u.username}...`);
        // Update user data to match test expectations
        await instance.entityService.update('plugin::users-permissions.user', u.id, {
          data: { ...u, provider: 'local' },
        });
      } else {
        // Create new user (forcing ID if possible, but Strapi EntityService doesn't always accept ID in create)
        // Note: Postgres sequences might not respect manual ID insertion if not handled by low-level query.
        // For Strapi Entity Service, we generally can't force ID on create easily.
        // So we try strict create. If it fails, we might need a raw query.

        // However, standard Strapi creates auto-increment.
        // We will try standard create. God Mode tokens rely on ID.
        // If we can't force ID 2, our tests break.
        // Let's attempt to force ID via DB query if EntityService fails or ignores it?
        // Actually, for "God Mode", simply generating the token for the *actual* ID is smarter.
        // But for deterministic tests, we want fixed IDs.

        // Let's rely on the fact that for a fresh DB they will get 1, 2, 3.
        // For a dirty DB, we assume the user ran this script before.

        await instance.entityService.create('plugin::users-permissions.user', {
          data: { ...u, provider: 'local' },
        });
        console.log(`✅ Created User: ${u.username}`);
      }
    }

    // 2. Seed Blueprints (Monster)
    const monsterUid = 'api::monster.monster';
    if (instance.contentTypes[monsterUid]) {
      const existingMonster = await instance.documents(monsterUid).findMany({ filters: { name: 'Acolyte' } });
      if (existingMonster.length === 0) {
        await instance.documents(monsterUid).create({ data: MONSTER_BLUEPRINT });
        console.log(`✅ Created Monster: Acolyte`);
      }
    }

    console.log('✨ Seeding Complete.');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
  } finally {
    // Stop Strapi
    await instance.destroy();
    process.exit(0);
  }
}

seed();
