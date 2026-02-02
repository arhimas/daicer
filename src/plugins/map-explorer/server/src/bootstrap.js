"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bootstrap = async ({ strapi }) => {
    // bootstrap phase
    await strapi.plugin('map-explorer').service('queueService').initialize();
    // Seed Prompts
    try {
        const promptPath = path_1.default.join(process.cwd(), 'src', 'datas', 'prompts.json');
        if (fs_1.default.existsSync(promptPath)) {
            const prompts = JSON.parse(fs_1.default.readFileSync(promptPath, 'utf8'));
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
                }
                else {
                    // Optional: Update if text is empty? For now, respect DB state.
                    strapi.log.debug(`System Prompt ${p.key} exists.`);
                }
            }
        }
    }
    catch (e) {
        strapi.log.error("Failed to seed prompts", e);
    }
};
exports.default = bootstrap;
