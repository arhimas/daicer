import { QueueName } from '../constants';

export default {
  default: {
    queues: Object.values(QueueName),
  },
  validator() {},
};
