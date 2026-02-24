import { defineClass } from '../../../features/genesis-core/blueprints';

export default defineClass({
  slug: 'barbarian',
  name: 'Barbarian',
  description: 'A fierce warrior of primitive background who can enter a battle rage.',
  hit_die: 'd12',
  subclasses: ['berserker'],
  proficiencies: [
    'light-armor',
    'medium-armor',
    'shields',
    'simple-weapons',
    'martial-weapons',
    'saving-throw-str',
    'saving-throw-con',
  ],
  compilation_state: {
    status: 'Valid',
    summary: 'Imported from reference data.',
  },
});
