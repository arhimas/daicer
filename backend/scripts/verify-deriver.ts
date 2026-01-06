import { EntityDeriver } from '../src/engine/derivation';
// ActionDefinition is in shared
import { ActionDefinition } from '../src/shared/schemas/actions';
// We need to resolve imports correctly.
// backend/src/engine/index.ts exports all.

// Mock Context
const context = {
  name: 'Test Acolyte',
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  level: 1,
  proficiencyBonus: 2,
  speed: 30,
  innateActions: [], // Empty
  equipment: [], // Empty
};

const derived = EntityDeriver.derive(context);

console.log('--- DERIVED ACTIONS ---');
console.log(JSON.stringify(derived.structuredActions, null, 2));

if (derived.structuredActions && derived.structuredActions.length > 0) {
  console.log('SUCCESS: Actions generated.');
} else {
  console.log('FAILURE: No actions generated.');
}
