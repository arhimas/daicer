import { ActionDispatcher } from '@daicer/engine';

const dispatcher = new ActionDispatcher();
console.log('Dispatcher created');
const result = dispatcher.dispatch(
  { entities: [] } as any,
  { type: 'ATTACK', payload: { actorId: '1', targetId: '2' } } as any
);
console.log('Result:', JSON.stringify(result, null, 2));

if (typeof result.success === 'undefined') {
  console.error('FATAL: result.success is undefined');
  process.exit(1);
}
console.log('Engine Verified');
