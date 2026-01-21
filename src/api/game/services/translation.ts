/**
 * Translation Service
 * 
 * A simple service to handle translation tasks within the Daicer ecosystem.
 * Currently implements a heuristic/mock engine but is architected to support
 * pluggable providers (e.g. TranslateGemma, Google Translate) in the future.
 */

import { Strapi } from '@strapi/strapi';

export type SupportedLanguage = 'en' | 'es' | 'pt';

/**
 * A tiny localized dictionary for "happy path" testing and demonstration.
 * In a real scenario, this would be replaced by an external API or LLM call.
 */
const DICTIONARY: Record<string, Record<SupportedLanguage, string>> = {
  'hello': { en: 'Hello', es: 'Hola', pt: 'Olá' },
  'world': { en: 'World', es: 'Mundo', pt: 'Mundo' },
  'attack': { en: 'Attack', es: 'Ataque', pt: 'Ataque' },
  'damage': { en: 'Damage', es: 'Daño', pt: 'Dano' },
  'sword': { en: 'Sword', es: 'Espada', pt: 'Espada' },
  'shield': { en: 'Shield', es: 'Escudo', pt: 'Escudo' },
  'fire': { en: 'Fire', es: 'Fuego', pt: 'Fogo' },
  'water': { en: 'Water', es: 'Agua', pt: 'Água' },
};

 
export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * Translates a single string to the target language.
   * Currently uses a mock/heuristic approach:
   * 1. Checks a small static dictionary.
   * 2. If not found, prepends the language code (e.g. "[ES] Original Text") to simulate translation.
   * 
   * @param text The text to translate
   * @param targetLang The target language code
   */
  translate(text: string, targetLang: SupportedLanguage): string {
    if (!text || typeof text !== 'string') return text;
    
    // Normalize for dictionary lookup
    const lower = text.toLowerCase().trim();
    
    // 1. Dictionary Lookup
    if (DICTIONARY[lower] && DICTIONARY[lower][targetLang]) {
      // Preserve case if possible (simple capitalization)
      const translated = DICTIONARY[lower][targetLang];
      if (text[0] === text[0].toUpperCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1);
      }
      return translated;
    }

    // 2. Fallback Heuristic
    // If the text is already "tagged" with a language prefix, maybe we strip it? 
    // For now, just append the target tag to show operation.
    return `[${targetLang.toUpperCase()}] ${text}`;
  },

  /**
   * Translates a JSON object or array.
   * 
   * @param data The JSON data to translate
   * @param targetLang The target language
   * @param options Configuration options
   * @param options.translateKeys If true, object keys will also be translated.
   */
  translateJson(
    data: any, 
    targetLang: SupportedLanguage, 
    options: { translateKeys?: boolean } = {}
  ): any {
    const { translateKeys = false } = options;

    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.translate(data, targetLang);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.translateJson(item, targetLang, options));
    }

    if (typeof data === 'object') {
      const result: any = {};
      
      for (const key of Object.keys(data)) {
        const value = data[key];
        
        // Handle Key Translation
        let newKey = key;
        if (translateKeys) {
          // We assume keys are also strings that might need translation
          newKey = this.translate(key, targetLang);
        }

        // Recursive Value Translation
        result[newKey] = this.translateJson(value, targetLang, options);
      }
      
      return result;
    }

    // Return numbers, booleans, etc. as-is
    return data;
  },

  /**
   * Translates an entity based on its Strapi Schema.
   * INTELLIGENT: Respects field types to avoid breaking Enums, UIDs, and Relations.
   *
   * @param entity - The entity data to translate.
   * @param contentTypeUID - The Strapi UID of the content type (e.g. 'api::spell.spell').
   * @param targetLang - The target language.
   * @returns Translated entity object.
   */
  translateEntity(entity: any, contentTypeUID: string, targetLang: SupportedLanguage): any {
    if (!entity || typeof entity !== 'object') return entity;

    // Get the schema
    // @ts-ignore
    const schema = strapi.contentTypes[contentTypeUID] || strapi.components[contentTypeUID];
    if (!schema) {
        console.warn(`[TranslationService] Schema not found for UID: ${contentTypeUID}. Falling back to simple JSON translation.`);
        return this.translateJson(entity, targetLang, { translateKeys: false });
    }

    const result: any = { ...entity }; // Shallow copy to start

    for (const key of Object.keys(entity)) {
        // Skip system fields
        if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale', 'localizations'].includes(key)) {
            continue;
        }

        const value = entity[key];
        const attr = schema.attributes[key];

        if (!attr) {
            // Field not in schema (maybe virtual or private), keep as is
            continue;
        }

        // Handle based on attribute type
        switch (attr.type) {
            case 'string':
            case 'text':
            case 'richtext':
                // Translate content fields
                // Skip if it looks like a code or ID? (Heuristic: no spaces, snake_case?)
                // But generally, we trust the schema 'string' type unless it's a specific 'uid' type.
                if (typeof value === 'string') {
                    result[key] = this.translate(value, targetLang);
                }
                break;

            case 'component':
                if (attr.repeatable) {
                    if (Array.isArray(value)) {
                        result[key] = value.map((item: any) => 
                            this.translateEntity(item, attr.component, targetLang)
                        );
                    }
                } else {
                    if (value) {
                         result[key] = this.translateEntity(value, attr.component, targetLang);
                    }
                }
                break;

            case 'dynamiczone':
                if (Array.isArray(value)) {
                    result[key] = value.map((item: any) => {
                        const componentUID = item.__component;
                        if (componentUID) {
                            return this.translateEntity(item, componentUID, targetLang);
                        }
                        return item;
                    });
                }
                break;
            
            case 'json':
                // For JSON fields, we usually want to translate values but NOT keys.
                // However, JSON fields often contain config that shouldn't be touched.
                // SAFE DEFAULT: Do NOT translate JSON fields unless requested. 
                // Given the errors we saw (config objects), it's safer to skip JSON by default 
                // or use a very conservative translate (values only).
                // Let's Skip JSON fields for now to solve validation errors in 'mechanics_config' etc.
                // If the user wants specific JSON translation, they can upgrade this service later.
                break;

            case 'enumeration':
            case 'uid':
            case 'email':
            case 'password':
            case 'boolean':
            case 'integer':
            case 'biginteger':
            case 'float':
            case 'decimal':
            case 'date':
            case 'datetime':
            case 'time':
            case 'timestamp':
            case 'relation':
            case 'media':
                // Do NOT translate these types
                break;
            
            default:
                break;
        }
    }

    return result;
  }
});
