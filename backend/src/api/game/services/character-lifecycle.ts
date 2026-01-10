import { generateText } from '../../../utils/llm';
import { getPrompt, formatPrompt } from '../../../utils/prompt';
import { uploadBase64Image } from '../../../utils/upload';
import { createCharacterSnapshot, formatDmInstruction, EntityDeriver } from '../src/engine';
import type { WorldSettings, Player, EntitySheet, Language } from '../src/engine';

// Helper to format DM style

interface PopulatedEntitySheet extends Omit<
  EntitySheet,
  'race' | 'class' | 'classes' | 'characterClass' | 'personality'
> {
  documentId: string;
  race?: string | { name: string };
  class?: string | { name: string };
  classes?: { class: string | { name: string }; level: number }[];
  characterClass?: string;
  personality?: { traits: string; ideals: string; bonds: string; flaws: string };
}

interface StrapiCharacter {
  documentId: string;
  name: string;
  classes?: { class: { name: string; documentId: string }; level: number }[];
  race?: string;
  stats: unknown;
  appearance?: unknown;
  backstory?: string;
  background?: string;
  equipment?: unknown[];
}

export default ({ strapi }) => ({
  createSnapshot(characterSheets: unknown[]) {
    const snapshot: Record<string, unknown> = {};
    for (const sheet of characterSheets) {
      if (!sheet || typeof sheet !== 'object') continue;

      const s = sheet as { documentId: string; [key: string]: unknown };
      if (s.documentId) {
        const snap = createCharacterSnapshot(s);
        if (snap) {
          snapshot[s.documentId] = snap;
        }
      }
    }
    return snapshot;
  },

  async addCharacter(
    roomId: string,
    characterData: Record<string, unknown>,
    user: { documentId: string; id: string; username: string }
  ) {
    // 1. Fetch Room with populated players

    const filters: Record<string, unknown>[] = [{ documentId: roomId }, { roomId: roomId }];
    if (!isNaN(Number(roomId))) {
      filters.push({ id: Number(roomId) });
    }

    const rooms = await strapi.documents('api::room.room').findMany({
      filters: { $or: filters },
      populate: ['players', 'players.user', 'players.character', 'players.characterSheet'],
    });

    if (!rooms || rooms.length === 0) {
      throw new Error('Room not found');
    }
    const room = rooms[0] as {
      players: Player[];
      documentId: string;
      config: unknown;
    };
    const players = room.players || [];

    // 2. Process Avatar Uploads
    const avatarSlots = ['portrait', 'upperBody', 'fullBody'];
    const processedAvatarPreview: Record<
      string,
      { id?: string | number; url?: string; data?: string; mimeType?: string }
    > = {
      ...((characterData.avatarPreview as Record<
        string,
        { id?: string | number; url?: string; data?: string; mimeType?: string }
      >) || {}),
    };

    if (processedAvatarPreview) {
      for (const slot of avatarSlots) {
        if (processedAvatarPreview[slot] && processedAvatarPreview[slot].data) {
          try {
            strapi.log.info(`Processing avatar upload for slot: ${slot}`);
            const base64 = `data:${processedAvatarPreview[slot].mimeType};base64,${processedAvatarPreview[slot].data}`;
            const filename = `avatar-${user.id}-${slot}-${Date.now()}`;
            const uploadResult = await uploadBase64Image(base64, filename);
            if (uploadResult) {
              processedAvatarPreview[slot] = {
                id: uploadResult.id,
                url: uploadResult.url,
              };
              strapi.log.info(`Avatar ${slot} uploaded successfully: ${uploadResult.id}`);
            }
          } catch (err) {
            strapi.log.error(`Failed to upload ${slot} avatar:`, err);
          }
        }
      }
    }

    // 3. Create OR Link Character Entity
    let createdCharacter: StrapiCharacter | null = null;

    // Check if we are linking an existing character
    if (characterData.documentId) {
      // Validate it exists
      const existing = await strapi.documents('api::character.character').findOne({
        documentId: characterData.documentId,
      });

      if (existing) {
        strapi.log.info(`Linking player to existing character: ${existing.name} (${existing.documentId})`);
        createdCharacter = existing;
      } else {
        strapi.log.warn(`Linked character ${characterData.documentId} not found, falling back to creation.`);
      }
    }

    // If not linking or not found, create new
    if (!createdCharacter) {
      let raceId = null;
      if (characterData.race) {
        const races = await strapi.documents('api::race.race').findMany({
          filters: { name: characterData.race },
        });
        if (races && races.length > 0) {
          raceId = races[0].documentId;
          // Capture race speed for stat derivation
          // Capture race speed for stat derivation
          if ('speed' in races[0]) {
            (characterData as Record<string, unknown>)._raceSpeed = races[0].speed;
          }
        }
      }

      let classId = null;
      const className = characterData.characterClass || characterData.class;
      if (className) {
        const classes = await strapi.documents('api::class.class').findMany({
          filters: { name: className },
        });
        if (classes && classes.length > 0) {
          classId = classes[0].documentId;
        }
      }

      const rawStats = (characterData.baseStats || characterData.attributes || {}) as Record<string, unknown>;
      const baseStats = {
        strength: Number(rawStats.Strength || rawStats.strength || 10),
        dexterity: Number(rawStats.Dexterity || rawStats.dexterity || 10),
        constitution: Number(rawStats.Constitution || rawStats.constitution || 10),
        intelligence: Number(rawStats.Intelligence || rawStats.intelligence || 10),
        wisdom: Number(rawStats.Wisdom || rawStats.wisdom || 10),
        charisma: Number(rawStats.Charisma || rawStats.charisma || 10),
      };

      createdCharacter = await strapi.documents('api::character.character').create({
        data: {
          name: characterData.name,
          race: raceId,
          classes: classId ? [{ class: classId, level: 1 }] : [],
          backstory: characterData.backstory || characterData.background,
          appearance: characterData.appearance,
          equipment: characterData.equipment,
          user: user.documentId,
          stats: baseStats,
          portrait: processedAvatarPreview?.portrait?.id,
          upperBody: processedAvatarPreview?.upperBody?.id,
          fullBody: processedAvatarPreview?.fullBody?.id,
        },
        status: 'published',
      });
    }

    // 4. Create Character Sheet (The Gameplay Instance)
    // We create it immediately so the Waiting Room can show real stats/sheet

    // Prepare derivation context for lifecycle sheet too
    const rawStats = (createdCharacter.stats as Record<string, number>) || {};
    const attributes = {
      str: rawStats.strength || 10,
      dex: rawStats.dexterity || 10,
      con: rawStats.constitution || 10,
      int: rawStats.intelligence || 10,
      wis: rawStats.wisdom || 10,
      cha: rawStats.charisma || 10,
    };

    // Extract actual equipment items
    const equipmentList = (createdCharacter.equipment as { isEquipped: boolean; item: unknown }[]) || [];
    const equipmentForDeriver = equipmentList
      .filter((entry) => entry.isEquipped && entry.item)
      .map((entry) => entry.item);

    const derived = EntityDeriver.derive({
      attributes,
      classes: createdCharacter.classes?.map((c) => ({
        name: c.class.name,
        level: c.level,
        hitDie: (c.class as unknown as { hit_die: number }).hit_die, // Correctly type the cast
      })),
      level: 1, // Fallback
      equipment: equipmentForDeriver,
      race: {
        speed: (characterData as Record<string, unknown>)._raceSpeed as number,
      },
    });

    const sheetData = {
      name: createdCharacter.name,
      type: 'player',
      class: createdCharacter.classes?.[0]?.class, // Relation via Component
      race: createdCharacter.race, // Relation
      level: derived.level,
      experience: 0,

      stats: createdCharacter.stats,
      currentHp: derived.hp,
      maxHp: derived.maxHp,
      ac: derived.ac, // Snapshot Derived AC
      speed: derived.speed.walk, // Snapshot Speed, using walked speed
      attributes: createdCharacter.stats, // Map stats to attributes (Legacy field?)
      appearance: createdCharacter.appearance,
      backstory: createdCharacter.backstory,
      inventory: createdCharacter.equipment || [],
      position: { x: 0, y: 0, z: 0 }, // Default spawn
      character: createdCharacter.documentId, // Link to global asset
      room: room.documentId,
      structuredActions: derived.structuredActions?.map((action) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = action;
        return rest;
      }),
    };

    const createdSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: sheetData,
      status: 'published',
    });

    strapi.log.info(`Created CharacterSheet ${createdSheet.documentId} for Room ${roomId}`);

    // 5. Update Room Player Component
    const playerIndex = players.findIndex(
      (p: Player) => p.user?.documentId === user.documentId || p.user?.id === user.id
    );

    if (playerIndex === -1) {
      throw new Error('User is not a player in this room');
    }

    const updatedPlayers = [...players] as Record<string, unknown>[];
    updatedPlayers[playerIndex] = {
      ...players[playerIndex],
      character: createdCharacter.documentId, // Keep global link for reference
      characterSheet: createdSheet.documentId, // The Active Sheet
      isReady: false,
      name: characterData.name as string,
    };

    await strapi.documents('api::room.room').update({
      documentId: room.documentId,
      data: {
        players: updatedPlayers,
      },
    });

    return { character: createdCharacter, characterSheet: createdSheet, player: updatedPlayers[playerIndex] };
  },

  async generateCharacterOpening(
    worldDescription: string,
    character: EntitySheet,
    mainContext: string,
    language: Language = 'en',
    settings?: WorldSettings,
    streamId?: string
  ): Promise<string> {
    let dynamicStyleInstructions = 'Standard DM Style';
    if (settings?.dmStyle) {
      const instruction = formatDmInstruction(settings.dmStyle);
      dynamicStyleInstructions = `DYNAMIC STYLE ADJUSTMENTS:\n${instruction}`;
    }

    const c = character as PopulatedEntitySheet;

    // Safety check for race name
    let raceName = 'Unknown';
    if (typeof c.race === 'string') raceName = c.race;
    else if (c.race && typeof c.race === 'object' && 'name' in c.race)
      raceName = (c.race as { name: string }).name || 'Unknown';

    // Safety check for class name
    let className = 'Unknown Class';
    if (c.characterClass) className = c.characterClass;
    else if (c.classes && Array.isArray(c.classes) && c.classes.length > 0) {
      const cls = c.classes[0].class;
      if (typeof cls === 'string') className = cls;
      else if (cls && typeof cls === 'object' && 'name' in cls)
        className = (cls as { name: string }).name || 'Unknown Class';
    }
    // Fallback legacy support
    else if (typeof c.class === 'string') className = c.class;
    else if (c.class && typeof c.class === 'object' && 'name' in c.class)
      className = (c.class as { name: string }).name || 'Unknown Class';

    if (className === 'Unknown Class' && c.characterClass) className = c.characterClass;

    const charSummary = `Name: ${character.name}
Race: ${raceName}
Class: ${className}
Background: ${character.background || 'Unknown'}
Backstory Snippet: ${character.backstory ? character.backstory.substring(0, 300) + '...' : 'None provided'}
Personality: ${c.personality?.traits || ''} ${c.personality?.ideals || ''}
Attributes: STR ${c.attributes?.Strength || 10}, DEX ${c.attributes?.Dexterity || 10}, INT ${c.attributes?.Intelligence || 10}, WIS ${c.attributes?.Wisdom || 10}, CHA ${c.attributes?.Charisma || 10}`;

    const defaultSystem = `You are the Dungeon Master (DM) writing a private opening vignette for a specific character.

${dynamicStyleInstructions}

WORLD CONTEXT:
${worldDescription}

MAIN ADVENTURE HOOK:
${mainContext}

TARGET CHARACTER:
${charSummary}

GOAL:
Write a deeply personal, sensory-rich opening that bridges their backstory to the current moment.
Focus on their internal state, their unique perception, and their immediate surroundings.`;

    let systemPrompt = await getPrompt('character_opening_system', language, defaultSystem);

    if (systemPrompt.includes('{{worldContext}}')) {
      systemPrompt = formatPrompt(systemPrompt, {
        dmStyle: dynamicStyleInstructions,
        worldContext: worldDescription,
        mainContext: mainContext,
        characterSummary: charSummary,
      });
    } else if (systemPrompt.includes('{{worldDescription}}')) {
      systemPrompt = formatPrompt(systemPrompt, { worldDescription, mainContext });
    }

    const defaultUser = `Generate a personalized opening for ${character.name} (${raceName} ${className}).
Synchronize with the Main Context.
Describe sensory details, internal state, and prepare for reaction.
Start with ### Through ${character.name}'s Eyes`;

    let userPrompt = await getPrompt('character_opening_user', language, defaultUser);
    if (userPrompt.includes('{{characterName}}')) {
      userPrompt = formatPrompt(userPrompt, {
        characterName: character.name,
        characterRace: raceName,
        characterClass: className,
      });
    }

    return generateText(systemPrompt, userPrompt, language, { metadata: { streamId } });
  },

  async generateMainOpening(
    worldDescription: string,
    players: Player[],
    language: Language = 'en',
    settings?: WorldSettings,
    streamId?: string
  ): Promise<string> {
    let dynamicStyleInstructions = 'Standard DM Style';
    if (settings?.dmStyle) {
      const instruction = formatDmInstruction(settings.dmStyle);
      dynamicStyleInstructions = `DYNAMIC STYLE ADJUSTMENTS:\n${instruction}`;
    }

    const partyContext =
      players.length > 0
        ? players
            .map((p) => {
              const c = p.character as unknown as PopulatedEntitySheet | undefined;
              if (!c) return `- ${p.name}: (No Character)`;

              const rName =
                c.race && typeof c.race === 'object' && 'name' in c.race
                  ? (c.race as { name: string }).name
                  : (c.race as string) || 'Unknown';
              const cName =
                c.classes && Array.isArray(c.classes) && c.classes.length > 0
                  ? (() => {
                      const cls = c.classes[0].class;
                      return cls && typeof cls === 'object' && 'name' in cls
                        ? (cls as { name: string }).name
                        : (cls as string) || 'Unknown';
                    })()
                  : c.characterClass || (c.class as string) || 'Unknown';
              const desc = (c as unknown as { description?: string }).description || 'A brave adventurer';

              return `- ${c.name} (${rName} ${cName}): ${desc}`;
            })
            .join('\n')
        : 'A group of adventurers form.';

    const defaultSystem = `You are the Dungeon Master (DM) starting a new D&D 5e campaign.

${dynamicStyleInstructions}

WORLD CONTEXT:
${worldDescription}

THE PARTY:
${partyContext}

GOAL:
Write a compelling, public opening narration that welcomes the players to the world.
Establish the atmosphere, the immediate setting, and why they are here.`;

    let systemPrompt = await getPrompt('main_opening_system', language, defaultSystem);

    if (systemPrompt.includes('{{worldContext}}')) {
      systemPrompt = formatPrompt(systemPrompt, {
        dmStyle: dynamicStyleInstructions,
        worldContext: worldDescription,
        partyContext: partyContext,
      });
    }

    const defaultUser = `Based on: ${worldDescription}
Write a 2-3 paragraph opening.
1. Grounded Start
2. Party Unity
3. Inciting Incident
4. Call to Action
5. DO NOT ask questions.`;

    let userPrompt = await getPrompt('main_opening_user', language, defaultUser);
    if (userPrompt.includes('{{worldDescription}}')) {
      userPrompt = formatPrompt(userPrompt, { worldDescription });
    }

    return generateText(systemPrompt, userPrompt, language, { metadata: { streamId } });
  },
});
