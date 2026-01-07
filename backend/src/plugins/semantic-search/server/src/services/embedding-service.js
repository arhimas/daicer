'use strict';

const { OpenAI } = require('openai');

module.exports = ({ strapi }) => ({
  openai: null,

  init() {
    // Lazy init or immediate? Tutorial suggests immediate.
    // We reuse existing ENV vars if possible.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      strapi.log.warn('⚠️ Semantic Search: OPENAI_API_KEY not found. Helper text search will be used.');
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  },

  async generateEmbedding(text) {
    if (!this.openai) {
      this.init();
      if (!this.openai) {
        strapi.log.warn('OpenAI not initialized, skipping embedding.');
        return null;
      }
    }

    if (!text || !text.trim()) return [];

    // Clean text
    let cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Limits: text-embedding-3-small has 8192 tokens max.
    // Approx 1 token ~= 4 chars -> 32,000 chars.
    // We'll be safe with 24,000 chars.
    if (cleanedText.length > 24000) {
      cleanedText = cleanedText.substring(0, 24000);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanedText,
      });
      return response.data[0].embedding;
    } catch (e) {
      strapi.log.error('Embedding Generation Failed:', e.message);
      // Return null so we don't crash the whole save process
      return null;
    }
  },
});
