const { createStrapi } = require('@strapi/strapi');

const prompts = [
    {
        key: 'pixel-forge-system',
        text: `You are a Pixel Art Engine. 
  Your goal is to fill a {{width}}x{{height}} grid with hex colors based on an ASCII structural map.
  
  RULES:
  1. OUTPUT: strictly a JSON array of strings (rows).
  2. BACKGROUND: Use "transparent" for empty space.
  3. FOREGROUND: Hex color (e.g., "#FF0000").
  4. STYLE: High contrast, vivid fantasy RPG style.

  {{specificInstruction}}

  {{enhancedPrompt}}
  
  ASCII BLUEPRINT MAP ({{width}}x{{height}}):
  {{asciiBlueprint}}
  
  {{visionInstruction}}
  
  {{contextData}}`,
        category: 'system'
    },
    {
        key: 'blueprint-architect',
        text: `ACT AS A BLUEPRINT ARCHITECT.
  Task: Create a structural blueprint for a "{{prompt}}".
  Context: Pixel Art RPG Asset ({{archetype}}).
  Grid Size: {{width}}x{{height}}.
  LEGEND: '#' (Body), 'O' (Head), 'X' (Weapon), 'l'/'r' (Hands), 'L' (Legs), '+' (Acc), '.' (Empty).
  OUTPUT: JSON array of strings (rows).
  {{contextData}}`,
        category: 'system'
    },
    {
        key: 'voxel-architect',
        text: `ACT AS A VOXEL ARCHITECT.
  Task: Create a 3D Voxel Structure for a "{{prompt}}".
  Dimensions: {{width}}x{{width}}x{{depth}}.
  BLOCKS: stone, dirt, grass, wood, plank, sand, glass, leaf, coal, iron, gold.
  INSTRUCTIONS: Output list of non-air blocks.
  {{contextData}}`,
        category: 'system'
    },
    {
        key: 'enhance-terrain',
        text: `Task: Seamless tiling texture for "{{rawPrompt}}". Style: Masterpiece 16-bit pixel art, fantasy D&D RPG aesthetic, vibrant colors, high contrast.`,
        category: 'system'
    },
    {
        key: 'enhance-item',
        text: `Task: Iconic inventory sprite for "{{rawPrompt}}". Style: Masterpiece 16-bit pixel art, fantasy D&D RPG aesthetic, vibrant colors, high contrast.`,
        category: 'system'
    },
    {
        key: 'enhance-character',
        text: `Task: Character sprite for "{{rawPrompt}}". Style: Masterpiece 16-bit pixel art, fantasy D&D RPG aesthetic, vibrant colors, high contrast.`,
        category: 'system'
    }
];

async function seed() {
  // Initialize Strapi instance without starting the HTTP server
  const strapi = await createStrapi({ distDir: 'dist' }).load();
  
  try {
      for (const p of prompts) {
          const existing = await strapi.db.query('api::prompt.prompt').findOne({ where: { key: p.key } });
          if (!existing) {
              await strapi.entityService.create('api::prompt.prompt', {
                  data: p
              });
              console.log(`Created prompt: ${p.key}`);
          } else {
              await strapi.entityService.update('api::prompt.prompt', existing.id, {
                  data: { text: p.text }
              });
              console.log(`Updated prompt: ${p.key}`);
          }
      }
  } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
  }
  
  process.exit(0);
}

seed();
