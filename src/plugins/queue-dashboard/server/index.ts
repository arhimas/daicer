import bootstrap from './bootstrap';
import controllers from './controllers';
import routes from './routes';

console.log('Queue Dashboard: server/index.ts loaded 🚀');

export default () => ({
  bootstrap,
  controllers,
  routes,
});
