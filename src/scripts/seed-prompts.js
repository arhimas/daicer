const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const PROMPTS_FILE = path.join(__dirname, '../libs/llm-core/prompts.json');

async function seed() {
  // Initialize Strapi instance without starting the HTTP server
  const strapi = await createStrapi({ distDir: 'dist' }).load();
  
  try {
      const content = fs.readFileSync(PROMPTS_FILE, 'utf-8');
      const prompts = JSON.parse(content);

      for (const p of prompts) {
          const existing = await strapi.db.query('api::prompt.prompt').findOne({ where: { key: p.key } });
          const promptData = {
              key: p.key,
              text: p.text,
              category: p.category,
              // We could seed variables into the 'embedding' json field if we want to store schema in DB too
              // embedding: p.variables 
          };

          if (!existing) {
              await strapi.entityService.create('api::prompt.prompt', {
                  data: promptData
              });
              console.log(`Created prompt: ${p.key}`);
          } else {
              await strapi.entityService.update('api::prompt.prompt', existing.id, {
                  data: promptData
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
