const path = require('path');

module.exports = ({ env }) => {
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
