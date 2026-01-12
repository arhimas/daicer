import type { Core } from '@strapi/strapi';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info('Queue Dashboard Plugin: Bootstrapping... 🚀');
  
  // Register permission actions.
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the Queue Dashboard',
      uid: 'read',
      pluginName: 'queue-dashboard',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
  strapi.log.info('Queue Dashboard Plugin: Permissions registered ✅');
};

export default bootstrap;
