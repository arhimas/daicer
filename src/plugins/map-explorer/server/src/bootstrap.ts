import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  await strapi.plugin('map-explorer').service('queueService').initialize();

  // Seed Prompts
  try {
      const promptPath = path.join(process.cwd(), 'src', 'datas', 'prompts.json');
      
      if (fs.existsSync(promptPath)) {
          const prompts = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
          
          for (const p of prompts) {
              const existing = await strapi.db.query('api::prompt.prompt').findOne({
                  where: { key: p.key }
              });

              if (!existing) {
                  strapi.log.info(`Creating missing System Prompt: ${p.key}`);
                  await strapi.db.query('api::prompt.prompt').create({
                      data: {
                          key: p.key,
                          text: p.text,
                          description: "System Generated via Bootstrap",
                          publishedAt: new Date()
                      }
                  });
              } else {
                  // Optional: Update if text is empty? For now, respect DB state.
                  strapi.log.debug(`System Prompt ${p.key} exists.`);
              }
          }
      }
  } catch (e) {
      strapi.log.error("Failed to seed prompts", e);
  }
};

export default bootstrap;
