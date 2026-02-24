import type { Modules } from '@strapi/types';

export type EntityInput = Modules.EntityService.Params.Data.Input<'api::entity.entity'>;
export type ActionInput = Modules.EntityService.Params.Data.Input<'api::action.action'>;

export const entity: EntityInput = { hp: 'invalid', toHit: 1 };
export const action: ActionInput = { hp: 10, toHit: 'invalid' };
