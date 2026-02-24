import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The xorn makes three claw attacks and one bite attack.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'xorn-multiattack',
});
