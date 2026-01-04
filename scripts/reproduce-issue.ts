import { performActionTool } from '../backend/src/ai/tools/game/perform-action';
import { ActionDispatcher } from '@daicer/engine';

// Mock Context
const mockContext = {
  strapi: {
    documents: () => ({ findOne: () => ({ entity_sheets: [], config: {} }) }),
    log: { info: console.log, warn: console.warn, error: console.error },
  },
  roomDocumentId: 'room-1',
  user: { documentId: 'u1' },
} as any;

// Override ActionDispatcher if possible?
// We cannot easily override imported module here without mocking framework.
// But we can check what REAL result is.

async function run() {
  console.log('Running Reproduction...');
  try {
    const res = await performActionTool(mockContext).func(
      {
        commandType: 'ATTACK',
        payload: JSON.stringify({ actorId: '1', targetId: '2' }),
      },
      mockContext
    );
    console.log('Tool Result:', res);
  } catch (e) {
    console.error('Tool Threw:', e);
  }
}

run();
