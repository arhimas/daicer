import { z } from 'zod';
import { createDaicerTool, StrapiContext } from '../tool-factory';

const listEntitiesSchema = z.object({});

interface StrapiEntitySheet {
  documentId: string;
  type?: string;
  name?: string;
  position?: { x: number; y: number; z: number };
  currentHp?: number;
  maxHp?: number;
}

export const listEntitiesTool = (context: StrapiContext) =>
  createDaicerTool(
    {
      name: 'list_entities',
      description:
        'Lists all entities (players, monsters, NPCs) currently in the room with their positions and status.',
      schema: listEntitiesSchema,
      outputSchema: z.string(), // Returns a formatted string list
      func: async (_input, { strapi, roomDocumentId }) => {
        // Fetch all character sheets in the room
        const entities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
          filters: {
            room: { documentId: roomDocumentId },
          },
          populate: ['stats', 'position'], // Ensure position is loaded
          limit: 100, // Reasonable cap
        });

        if (!entities || entities.length === 0) {
          return 'No entities found in this room.';
        }

        const lines = entities.map((param) => {
          const sheet = param as unknown as StrapiEntitySheet & {
            structuredActions?: Array<{
              id: string;
              name: string;
              type: string;
              damage?: Array<{ dice: string; type: string }>;
            }>;
          };
          const pos = sheet.position || { x: '?', y: '?', z: '?' };
          const hpStatus = `${sheet.currentHp}/${sheet.maxHp} HP`;

          // Format Actions
          let actionsInfo = '';
          if (sheet.structuredActions && sheet.structuredActions.length > 0) {
            const actionList = sheet.structuredActions
              .slice(0, 5) // Limit to top 5 to avoid context bloat
              .map((a) => {
                const dmg = a.damage ? ` (${a.damage.map((d) => d.dice).join('+')} ${a.damage[0]?.type})` : '';
                return `[${a.type === 'spell' ? 'SPELL' : 'WEAPON'}: "${a.name}" (ID: ${a.id})${dmg}]`;
              })
              .join(', ');
            actionsInfo = ` | Actions: ${actionList}`;
          }

          return `- [${sheet.type?.toUpperCase() || 'UNKNOWN'}] **${sheet.name}** (ID: ${sheet.documentId}) at (${pos.x}, ${pos.y}, ${pos.z}) | ${hpStatus}${actionsInfo}`;
        });

        return `Found ${entities.length} entities:\n${lines.join('\n')}`;
      },
    },
    context
  );
