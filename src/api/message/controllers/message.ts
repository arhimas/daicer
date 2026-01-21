/**
 * message controller
 */

import { factories } from '@strapi/strapi';

/**
 * Message Controller.
 * Standard Strapi Core Controller for Message entities (Chat/Logs).
 */
export default factories.createCoreController('api::message.message');
