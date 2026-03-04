import type { Modules } from '@strapi/types';

export type EntityInput = Partial<Modules.EntityService.Params.Data.Input<'api::entity.entity'>>;
export type ActionInput = Modules.EntityService.Params.Data.Input<'api::action.action'>;

export const entity: EntityInput = { slug: 'test', name: 'Test' };
export const action: ActionInput = { slug: 'test', name: 'Test' };
