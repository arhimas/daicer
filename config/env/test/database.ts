import path from 'path';

export default ({ env }) => {
  const filename = env('DATABASE_FILENAME', ':memory:');
  const client = env('DATABASE_CLIENT', 'sqlite');

  return {
    connection: {
      client,
      connection: {
        filename,
      },
      useNullAsDefault: true,
    },
  };
};
