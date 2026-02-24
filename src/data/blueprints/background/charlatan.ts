import { defineBackground } from '../../../features/genesis-core/blueprints';

export default defineBackground({
  slug: 'charlatan',
  name: 'Charlatan',
  compilation_state: {
    status: 'Valid',
    hash: 'b8f9e2a1c0d3e4f5a6b7c8d9e0f1a2b3',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully compiled Charlatan background from PHB sources.',
  },
  description:
    "You have always had a way with people. You know what makes them tick, you can tease out their hearts' desires after a few minutes of conversation, and with a few leading questions you can read them like they were children's books. It's a useful talent, and one that you're perfectly willing to use for your advantage. You know what people want and you deliver it, or rather, you promise to deliver it. You're a con artist, a scammer, a cheat. You have a favorite scheme you use to fleece your marks, ranging from selling 'magic' potions to assuming a false identity to infiltrate high society.",
  equipment: [
    {
      isEquipped: false,
      item: 'fine-clothes',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'disguise-kit',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'weighted-dice',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'pouch',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'gold-piece',
      quantity: 15,
      slot: 'backpack',
    },
  ],
  feature: {
    name: 'False Identity',
    description:
      'You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona. Additionally, you can forge documents including official papers and personal letters, as long as you have seen an example of the kind of document or the handwriting you are trying to copy.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Deception',
      proficiency: 'skill-deception',
    },
    {
      type: 'Skill',
      name: 'Sleight of Hand',
      proficiency: 'skill-sleight-of-hand',
    },
    {
      type: 'Tool',
      name: 'Disguise kit',
      proficiency: 'tool-disguise-kit',
    },
    {
      type: 'Tool',
      name: 'Forgery kit',
      proficiency: 'tool-forgery-kit',
    },
  ],
});
