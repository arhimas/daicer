import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Berserk',
  description:
    "Whenever the golem starts its turn with 40 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points. The golem's creator, if within 60 feet of the berserk golem, can try to calm it by speaking firmly and persuasively. The golem must be able to hear its creator, who must take an action to make a DC 15 Charisma (Persuasion) check. If the check succeeds, the golem ceases being berserk. If it takes damage while still at 40 hit points or fewer, the golem might go berserk again.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Golem goes berserk, attacking nearest creature/object. Can be calmed with DC 15 CHA (Persuasion) check.',
      chance: 17,
      duration_rounds: null,
    },
  ],
  slug: 'flesh-golem-berserk',
});
