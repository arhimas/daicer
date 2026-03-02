import { defineRace } from '@/features/genesis-core/blueprints';

export default defineRace({
  slug: 'gnome',
  name: 'Gnome',
  description:
    'Gnomes are most often good. Those who tend toward law are sages, engineers, researchers, scholars, investigators, or inventors. Those who tend toward chaos are minstrels, tricksters, wanderers, or fanciful jewelers. Gnomes are good-hearted, and even the tricksters among them are more playful than vicious. Gnomes mature at the same rate humans do, and most are expected to settle down into an adult life by around age 40. They can live 350 to almost 500 years. Gnomes are between 3 and 4 feet tall and average about 40 pounds. Your size is Small. You can speak, read, and write Common and Gnomish. The Gnomish language, which uses the Dwarvish script, is renowned for its technical treatises and its catalogs of knowledge about the natural world. Ability Score Increase: Your Intelligence score increases by 2.',
  size: 'Small',
  speed: {},
  traits: ['darkvision', 'gnome-cunning'],
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
});
