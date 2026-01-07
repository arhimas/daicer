'use strict';

module.exports = {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'POST',
        path: '/search',
        handler: 'searchController.search',
        config: {
          policies: [],
          auth: false,
        },
      },
    ],
  },
};
