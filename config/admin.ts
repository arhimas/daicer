export default ({ env }) => ({
  url: '/admin',
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  watchIgnoreFiles: [
    '**/script/**',
    '**/scripts/**',
    '**/studyCase/**',
    '**/__tests__/**',
    '**/coverage/**',
    '**/.test-results-*.json',
    '**/dist/**',
  ],
  preview: {
    enabled: true,
    config: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:1337'], // Adjust allowed origins as needed
      async handler(uid, { documentId, locale, status }) {
        if (uid === 'api::world.world') {
          return `http://localhost:3000/preview/world/${documentId}?locale=${locale}`;
        }
        return null;
      },
    },
  },
});
