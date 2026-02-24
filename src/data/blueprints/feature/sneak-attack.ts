import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sneak-attack',
  name: 'Sneak Attack',
  compilation_state: {
    status: 'Valid',
    hash: '7309995328892416',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully compiled from reference data.',
  },
  description:
    "Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't incapacitated, and you don't have disadvantage on the attack roll. The amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.",
  level: 1,
  lore: 'A master of timing and precision, the rogue waits for the exact moment of vulnerability to strike where it hurts most.',
  tags: ['rogue', 'combat', 'damage'],
});
