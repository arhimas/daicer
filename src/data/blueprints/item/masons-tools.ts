import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'masons-tools',
  name: "Mason's Tools",
  description:
    "These special tools include the items needed to pursue a craft or trade. The table shows examples of the most common types of tools, each providing items related to a single craft. Proficiency with a set of artisan's tools lets you add your proficiency bonus to any ability checks you make using the tools in your craft. Each type of artisan's tools requires a separate proficiency.",
  type: 'tool',
  rarity: 'common',
  value: 10,
  weight: 8,
  size: 'Medium',
});
