import { generateImageGemini } from '../../../utils/llm/image';

/**
 * Helper to extract text from Strapi Rich Text or String
 */
interface StrapiRichTextNode {
  type?: string;
  text?: string;
  children?: StrapiRichTextNode[];
}

function extractText(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  // If it's a Blocks structure (array)
  if (Array.isArray(content)) {
    return content.map((block: StrapiRichTextNode) => block.children?.map((c) => c.text).join('') || '').join('\n');
  }
  return '';
}

export default ({ strapi }) => ({
  /**
   * Generate Portrait (Face Close-up)
   */
  async generatePortrait({ payload, referenceImage }) {
    strapi.log.info(`[Assets] Generating Portrait for ${payload.name}`);

    // 1. Get Prompts
    const masterPromptEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_generation_master_prompt' },
    });
    const framingEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_framing_portrait' },
    });

    const masterTemplate = extractText(masterPromptEntity?.text) || 'Fantasy character portrait.';
    const framing = extractText(framingEntity?.text) || 'Close-up face portrait.';

    // 2. Construct Prompt
    const description = payload.basePrompt || 'A hero.';
    const appearance = payload.appearance || {};

    // Flatten appearance for context
    const details = [
      `Race: ${appearance.race || 'Unknown'}`,
      `Class: ${appearance.classRole || 'Unknown'}`,
      `Hair: ${appearance.hair || ''}`,
      `Eyes: ${appearance.eyes || ''}`,
      `Attire: ${appearance.attire || ''}`,
      `Features: ${appearance.notableFeatures || ''}`,
      `Tone: ${payload.tone || ''}`,
    ]
      .filter(Boolean)
      .join(', ');

    const finalPrompt = `
      ${masterTemplate}
      
      SUBJECT: ${payload.name}
      DESCRIPTION: ${description}
      DETAILS: ${details}
      
      FRAMING: ${framing}
    `.trim();

    // 3. Prepare References
    const references = [];
    if (referenceImage) {
      // Remove header if present
      const clean = referenceImage.replace(/^data:image\/\w+;base64,/, '');
      references.push({ mimeType: 'image/png', data: clean });
    }

    // 4. Call Gemini
    const result = await generateImageGemini(
      {
        prompt: finalPrompt,
        referenceImages: references,
      },
      'gemini-3-pro-image-preview'
    ); // Prefer high quality for portrait

    return {
      mimeType: 'image/png',
      data: result.url.replace(/^data:image\/\w+;base64,/, ''),
    };
  },

  /**
   * Generate Upper Body (Waist Up)
   */
  async generateUpperBody({ payload, portrait, referenceImage }) {
    strapi.log.info(`[Assets] Generating Upper Body for ${payload.name}`);

    const masterPromptEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_generation_master_prompt' },
    });
    const framingEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_framing_upper_body' },
    });

    const masterTemplate = extractText(masterPromptEntity?.text) || 'Fantasy character concept.';
    const framing = extractText(framingEntity?.text) || 'Upper body, waist up shot.';

    const description = payload.basePrompt || '';
    const details = `Race: ${payload.appearance?.race}`;

    const finalPrompt = `
      ${masterTemplate}
      SUBJECT: ${payload.name}
      DESCRIPTION: ${description}
      DETAILS: ${details}
      FRAMING: ${framing}
      CONSISTENCY: Use the provided reference image as the EXACT character visual source.
    `.trim();

    const references = [];

    // Priority: User Reference > Generated Portrait
    if (referenceImage) {
      const clean = referenceImage.replace(/^data:image\/\w+;base64,/, '');
      references.push({ mimeType: 'image/png', data: clean });
    } else if (portrait && portrait.data) {
      references.push({ mimeType: 'image/png', data: portrait.data });
    }

    const result = await generateImageGemini({
      prompt: finalPrompt,
      referenceImages: references,
    });

    return {
      mimeType: 'image/png',
      data: result.url.replace(/^data:image\/\w+;base64,/, ''),
    };
  },

  /**
   * Generate Full Body (Head to Toe)
   */
  async generateFullBody({ payload, portrait, upperBody, referenceImage }) {
    strapi.log.info(`[Assets] Generating Full Body for ${payload.name}`);

    const masterPromptEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_generation_master_prompt' },
    });
    const framingEntity = await strapi.db.query('api::prompt.prompt').findOne({
      where: { key: 'image_framing_full_body' },
    });

    const masterTemplate = extractText(masterPromptEntity?.text) || 'Fantasy character full body.';
    const framing = extractText(framingEntity?.text) || 'Full body shot, head to toe.';

    const finalPrompt = `
      ${masterTemplate}
      SUBJECT: ${payload.name}
      FRAMING: ${framing}
      CONSISTENCY: Maintain exact visual identity from reference.
    `.trim();

    const references = [];
    if (referenceImage) {
      references.push({ mimeType: 'image/png', data: referenceImage.replace(/^data:image\/\w+;base64,/, '') });
    } else {
      // Use Upper Body as primary ref if available, else Portrait
      if (upperBody && upperBody.data) references.push({ mimeType: 'image/png', data: upperBody.data });
      else if (portrait && portrait.data) references.push({ mimeType: 'image/png', data: portrait.data });
    }

    const result = await generateImageGemini({
      prompt: finalPrompt,
      referenceImages: references,
    });

    return {
      mimeType: 'image/png',
      data: result.url.replace(/^data:image\/\w+;base64,/, ''),
    };
  },
});
