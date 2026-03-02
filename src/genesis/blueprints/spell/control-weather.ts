import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'control-weather',
  name: 'Control Weather',
  level: 8,
  school: 'Transmutation',
  casting_config: {
    time_value: 10,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'Burning incense and bits of earth and wood mixed in water.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    aoe_shape: 'Sphere',
    aoe_size: 26400,
  },
  duration_config: {
    type: 'Concentration',
    value: 8,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early.\n\nWhen you cast the spell, you change the current weather conditions, which are determined by the GM based on the climate and season. You can change precipitation, temperature, and wind. It takes 1d4 x 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal.\n\nWhen you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction.\n\n##### Precipitation\n| Stage | Condition |\n|---|---|\n| 1 | Clear |\n| 2 | Light clouds |\n| 3 | Overcast or ground fog |\n| 4 | Rain, hail, or snow |\n| 5 | Torrential rain, driving hail, or blizzard |\n\n##### Temperature\n| Stage | Condition |\n|---|---|\n| 1 | Unbearable heat |\n| 2 | Hot |\n| 3 | Warm |\n| 4 | Cool |\n| 5 | Cold |\n| 6 | Arctic cold |\n\n##### Wind\n| Stage | Condition |\n|---|---|\n| 1 | Calm |\n| 2 | Moderate wind |\n| 3 | Strong wind |\n| 4 | Gale |\n| 5 | Storm |",
  compilation_state: {
    status: 'Valid',
  },
});
