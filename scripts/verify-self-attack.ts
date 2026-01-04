import { ActionDispatcher } from '@daicer/engine';

const dispatcher = new ActionDispatcher();
const actorId = 'actor1';
const state = {
  entities: [
    {
      id: actorId,
      type: 'monster',
      hp: 10,
      sheet: { currentHp: 10, structuredActions: [{ id: 'a1', type: 'melee', damage: [{ dice: '1d6' }] }] },
    },
  ],
  room: { config: {} },
};

const command = { type: 'ATTACK', payload: { actorId: actorId, targetId: actorId } }; // Self attack

const result = dispatcher.dispatch(state as any, command as any);
console.log('Result Self Attack:', JSON.stringify(result, null, 2));
