import { Core } from '@strapi/strapi';

export class TestFactory {
  private strapi: Core.Strapi;

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  /**
   * Creates a Room entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createRoom(overrides: Partial<any> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.strapi.documents('api::room.room') as any).create({
      data: {
        name: 'Test Room',
        description: 'A room created by TestFactory',
        width: 10,
        height: 10,
        locale: 'en',
        ...overrides,
      },
      status: 'published',
    });
  }

  /**
   * Creates a Monster entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createMonster(overrides: Partial<any> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.strapi.documents('api::monster.monster') as any).create({
      data: {
        name: 'Test Monster',
        slug: 'test-monster-' + Date.now(),
        type: 'monster',
        hit_points: 10,
        armor_class: 10,
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        locale: 'en',
        ...overrides,
      },
      status: 'published',
    });
  }

  /**
   * Creates a Character entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createCharacter(overrides: Partial<any> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.strapi.documents('api::character.character') as any).create({
      data: {
        name: 'Test Character',
        slug: 'test-character-' + Date.now(),
        hp: 20,
        stats: {
          strength: 12,
          dexterity: 12,
          constitution: 12,
          intelligence: 12,
          wisdom: 12,
          charisma: 12,
        },
        locale: 'en',
        ...overrides,
      },
      status: 'published',
    });
  }

  /**
   * Creates an EntitySheet entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createEntitySheet(overrides: Partial<any> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.strapi.documents('api::entity-sheet.entity-sheet') as any).create({
      data: {
        name: 'Test Entity Sheet',
        type: 'monster',
        currentHp: 10,
        maxHp: 10,
        level: 1,
        // locale: 'en', // EntitySheet schema seems to not have i18n
        ...overrides,
      },
      status: 'published',
    });
  }
}
