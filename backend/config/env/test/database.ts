import path from 'path';

export default ({ env }) => {
  const filename = path.join(__dirname, '../../../../.tmp/test.db');

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename,
      },
      useNullAsDefault: true,
    },
  };
};
