/**
 * Pure utility to convert entity data into a formatted Markdown string.
 * This is isolated for rigorous unit testing without Strapi dependencies.
 */
export function entityToMarkdown(type: string, name: string, data: Record<string, unknown>): string {
  // Header
  let md = `# ${name}\n\n`;
  md += `**Type**: ${type}\n`;

  if (data.description && typeof data.description === 'string') {
    md += `\n**Description**:\n${data.description}\n\n`;
  }

  // Specific field handling for better readability
  md += `## Data Properties\n`;

  const IGNORED_FIELDS = [
    'id',
    'documentId',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'createdBy',
    'updatedBy',
    'name',
    'title', // Often redundant with name header
    'description',
    'embedding',
    'password',
    'resetPasswordToken',
    'confirmationToken',
    'provider', // Auth stuff
  ];

  const sortedKeys = Object.keys(data).sort();

  for (const key of sortedKeys) {
    if (IGNORED_FIELDS.includes(key)) continue;

    const value = data[key];
    if (value === null || value === undefined) continue;

    // Handle Objects/Arrays
    if (typeof value === 'object') {
        const valCheck = value as { name?: string; title?: string; id?: number };
        
        if (Array.isArray(value)) {
          // List of relations
          const list = value as { name?: string; title?: string }[];
          if (list.length === 0) continue;

          // Try to map to names/titles
          const displayList = list.map(v => v.name || v.title || JSON.stringify(v));
          // If items are just strings/numbers/primitives
          if (typeof list[0] !== 'object') {
             md += `- **${key}**: ${value.join(', ')}\n`;
          } else {
             // check if it looks like a relation with name
             if (list[0].name || list[0].title) {
                 md += `- **${key}**: ${list.map(v => v.name || v.title).join(', ')}\n`;
             } else {
                 // Fallback: simplified length info or just JSON if small? 
                 // For now, let's just say "List of X items" to avoid huge dumps? 
                 // Or safe JSON if small. User wants "extremely good" context.
                 // Let's try recursive dump if it's small? No, recursive logic is risky for potential circles.
                 // let's stick to safe JSON stringify but minimal
                 md += `- **${key}**: JSON Array (${list.length} items)\n`;
             }
          }
        } else {
          // Single Object / Relation
          if (Object.keys(value).length === 0) continue; // Empty object

          // Relation check
          if (valCheck.name) {
            md += `- **${key}**: ${valCheck.name}\n`;
          } else if (valCheck.title) {
            md += `- **${key}**: ${valCheck.title}\n`;
          } else {
            // Generic JSON object dump, formatted
            const jsonStr = JSON.stringify(value);
            if (jsonStr.length < 100) {
                md += `- **${key}**: ${jsonStr}\n`;
            } else {
                md += `- **${key}**: JSON Object\n`;
            }
          }
        }
    } else {
      // Primitives
      md += `- **${key}**: ${value}\n`;
    }
  }

  return md;
}
