import { QueueName } from '@/plugins/queue-dashboard/server/src/constants';

export default {
  default: {
    queues: Object.values(QueueName),
  },
  validator() {},
};
