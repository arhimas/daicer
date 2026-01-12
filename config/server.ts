export default ({ env }) => {
  // Lazy load cron tasks to avoid test harness issues
  const cronTasks = process.env.NODE_ENV === 'test' ? {} : require('./cron-tasks').default;

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url: env('PUBLIC_URL', 'http://localhost:1337'), // Fixes 'missing absolute url' warning
    app: {
      keys: env.array('APP_KEYS'),
    },
    logger: {
      config: {
        level: 'debug',
      },
    },
    cron: {
      enabled: true,
      tasks: cronTasks,
    },
  };
};
