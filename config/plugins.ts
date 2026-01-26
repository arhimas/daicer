export default ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        bucketName: env('GCS_BUCKET_NAME'),
        publicFiles: env.bool('GCS_PUBLIC_FILES', true),
        uniform: env.bool('GCS_UNIFORM', false),
        baseUrl: env('GCS_BASE_URL'),
        serviceAccount: env.json('GCS_SERVICE_ACCOUNT'),
      },
    },
  },
  'semantic-search': {
    enabled: true,
    resolve: './src/plugins/semantic-search',
  },
  'queue-dashboard': {
    enabled: true,
    resolve: './src/plugins/queue-dashboard',
  },
  'map-explorer': {
    enabled: true,
    resolve: './src/plugins/map-explorer',
    config: {
        redis: {
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env.int('REDIS_PORT', 6379),
            db: env.int('REDIS_DB', 0),
            password: env('REDIS_PASSWORD', undefined),
            maxRetriesPerRequest: null,
        }
    }
  },
  redis: {
    enabled: true,
    config: {
      connections: {
        default: {
          connection: {
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env.int('REDIS_PORT', 6379),
            db: env.int('REDIS_DB', 0),
            password: env('REDIS_PASSWORD', undefined),
            maxRetriesPerRequest: null, // Critical for BullMQ
          },
          settings: {
            debug: false,
          },
        },
      },
    },
  },
  bullmq: {
    enabled: true,
    config: {
      connectionName: 'default',
    },
  },
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 15,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
});
