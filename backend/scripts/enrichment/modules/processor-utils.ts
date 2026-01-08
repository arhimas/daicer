import { getStrapiClient } from '../../utils/strapi-client';

export const fetchRagContext = async (entityName: string): Promise<string> => {
  const client = getStrapiClient();
  try {
    const searchRes: any = await client
      .fetch('/semantic-search/search', {
        method: 'POST',
        body: JSON.stringify({
          query: entityName,
          limit: 3,
          targets: ['knowledge'],
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      .then((r) => r.json());

    if (searchRes.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
      const snippets = searchRes.data.map((s: any) => `- ${s.content || s.excerpt}`).join('\n');
      return `\n\nOFFICIAL RULES REFERENCE (Use this for accuracy):\n${snippets}`;
    }
  } catch (ragErr) {
    // Silent fail is acceptable for RAG context
  }
  return '';
};

export function extractDescription(e: any): string {
  let t = '';
  if (typeof e.description === 'string') t += e.description;
  else if (Array.isArray(e.description)) {
    t += e.description.map((b: any) => b.children?.map((c: any) => c.text).join('')).join('\n');
  }

  if (e.actions) t += '\nActions: ' + JSON.stringify(e.actions);
  if (e.special_abilities) t += '\nAbilities: ' + JSON.stringify(e.special_abilities);
  if (!t && e.desc) t = e.desc;

  return t;
}
