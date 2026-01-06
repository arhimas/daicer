import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performActionTool } from '../perform-action';
import { StrapiContext } from '../../tool-factory';
import { ActionDispatcher } from '../../../../engine';

// Mock dependencies where necessary, but use real logic for target testing
vi.mock('../../../../engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../engine')>();
  return {
    ...actual,
    ActionDispatcher: vi.fn(), // We will mock instances of this
  };
});

describe('Tool Lifecycle Integration', () => {
  let mockContext: StrapiContext;
  let mockDispatch: vi.Mock;

  beforeEach(() => {
    mockDispatch = vi.fn().mockReturnValue({ events: [], success: true, message: 'Action performed' });

    // Correctly mock the constructor
    const functionHelper = function () {
      return { dispatch: mockDispatch };
    };
    vi.mocked(ActionDispatcher).mockImplementation(functionHelper as unknown as typeof ActionDispatcher);

    mockContext = {
      strapi: {
        documents: vi.fn().mockReturnValue({
          findOne: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        }),
        log: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      },
      roomDocumentId: 'room-123',
    } as unknown as StrapiContext;
  });

  it('should derive actions from inventory and execute successfully', async () => {
    // 1. Setup: Entity with Inventory Item (Sword) but NO structuredActions
    // This simulates a character picking up an item or having it added to inventory
    const inventoryItem = {
      name: 'Iron Sword',
      type: 'weapon',
      damage: [{ dice: '1d8', bonus: 2, type: 'slashing' }],
    };

    const mockRoom = {
      documentId: 'room-123',
      config: {},
      players: [],
      entity_sheets: [
        {
          documentId: 'hero-1',
          type: 'player',
          name: 'Hero',
          currentHp: 20,
          maxHp: 20,
          stats: { strength: 16, dexterity: 12 }, // +3 STR
          inventory: [inventoryItem],
          structuredActions: [], // EMPTY - should be derived
          position: { x: 0, y: 0, z: 0 },
        },
      ],
    };

    vi.mocked(mockContext.strapi.documents('api::room.room').findOne).mockResolvedValue(mockRoom);

    // 2. Execute: perform_action call inputting the Inventory Item Name (or mapped ID)
    // The engine's ActionDispatcher typically requires an ActionID.
    // However, the EntityAdapter generates ephemeral actions from inventory.
    // We need to verify that an action with name "Iron Sword" is available on the entity state passed to dispatch.

    const tool = performActionTool(mockContext);
    const input = {
      commandType: 'ATTACK' as const,
      // User says "Attack with Iron Sword"
      // The tool normalizes this. But wait, perform_action doesn't resolve "Iron Sword" string to ID.
      // The LLM writes "actorId" and "actionId".
      // If the LLM infers the actionId from a previous `list_entities` call (which also uses Adapter), it sends an ID.
      // But for this test, let's assume the LLM sends "Iron Sword" as actionId or similar?
      // Actually, perform_action passes the payload through.
      // If we use EntityAdapter, it creates deterministic IDs? No, usually generic IDs or undefined for dynamic items?
      // Let's check EntityAdapter logic again. It usually pushes action objects.
      payload: JSON.stringify({
        actorId: 'hero-1',
        targetId: 'goblin-1',
        // In a real scenario, the LLM would have seen the action ID in `list_entities`.
        // We will inspect the State passed to `dispatch` to verify the action exists.
      }),
    };

    const result = await tool.func(input, mockContext);

    // 3. Verify: The State passed to ActionDispatcher has the correct derived action
    expect(ActionDispatcher).toHaveBeenCalled();
    const dispatchCall = mockDispatch.mock.calls[0]; // [state, command]
    // If dispatch wasn't called, test fails safely
    if (!dispatchCall) throw new Error('Dispatch not called');

    const [state, command] = dispatchCall;
    const hero = state.entities.find((e: { id: string; actions: any[] }) => e.id === 'hero-1');

    expect(hero).toBeDefined();
    // Verify Action Derivation
    expect(hero.actions).toHaveLength(1); // Unarmed strike + Sword? Adapter adds Unarmed if empty.
    // If inventory item is added, it might be 2 actions (Sword + Unarmed) or just Sword.
    // Adapter logic: "Always add Unarmed Strike if no actions".
    // Wait, if inventory item adds an action, Unarmed might NOT be added depending on logic.
    // Logic: if (!blueprint?.structuredActions && s.inventory) { ... }
    // if (actions.length === 0) { add Unarmed }
    // So if Sword is added, Unarmed is NOT added.

    expect(hero.actions[0].name).toBe('Iron Sword');
    expect(hero.actions[0].damage).toEqual(expect.arrayContaining([expect.objectContaining({ dice: '1d8' })]));

    // Verify Command matches
    expect(command.payload.actorId).toBe('hero-1');
  });

  it('should preserve structuredActions (Spells) from blueprint', async () => {
    // 1. Setup: Monster with Fireball in structuredActions
    const fireballAction = {
      id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      damage: [{ dice: '8d6', type: 'fire' }],
      description: 'Big boom',
    };

    const mockRoom = {
      documentId: 'room-123',
      entity_sheets: [
        {
          documentId: 'wizard-npc',
          type: 'npc',
          name: 'Wizard',
          stats: { intelligence: 18 },
          inventory: [],
          // Simulation: Populate returns the structured actions component data
          structuredActions: [fireballAction],
        },
      ],
    };

    vi.mocked(mockContext.strapi.documents('api::room.room').findOne).mockResolvedValue(mockRoom);

    const tool = performActionTool(mockContext);
    await tool.func(
      {
        commandType: 'CAST_SPELL',
        payload: JSON.stringify({ actorId: 'wizard-npc', actionId: 'spell-fireball' }),
      },
      mockContext
    );

    const [state] = mockDispatch.mock.calls[0];
    const wizard = state.entities.find((e: { id: string; actions: any[] }) => e.id === 'wizard-npc');

    expect(wizard.actions).toHaveLength(1);
    expect(wizard.actions[0].name).toBe('Fireball');
    expect(wizard.actions[0].type).toBe('spell');
  });
});
