import contentAPIRoutes from '@/plugins/queue-dashboard/server/src/routes/content-api';
import admin from './admin';

const routes = {
  'content-api': contentAPIRoutes,
  admin: admin,
};

export default routes;
