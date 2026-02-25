import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The centaur makes two attacks: one with its pike and one with its hooves or two with its longbow.',
  type: 'utility',
  slug: 'centaur-multiattack',
});
