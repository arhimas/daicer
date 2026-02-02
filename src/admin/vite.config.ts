import { mergeConfig } from 'vite';

export default (config) => {
  return mergeConfig(config, {
    resolve: {
      alias: [
        { find: 'path', replacement: 'path-browserify' },
        { find: 'fs', replacement: require.resolve('../plugins/map-explorer/admin/src/shims/fs.ts') },
        { find: /^postcss/, replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
        { find: /^source-map/, replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
        { find: /^clean-css/, replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
        { find: 'url', replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
        { find: 'punycode', replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
        {
          find: 'postcss-selector-parser',
          replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
        },
        {
          find: 'postcss-value-parser',
          replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
        },
        { find: 'css-loader', replacement: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts') },
      ],
    },
    optimizeDeps: {
      exclude: [
        'postcss',
        'source-map-js',
        'url',
        'clean-css',
        'prismjs', // PrismJS causes optimization loops
        'punycode',
      ],
    },
    build: {
      rollupOptions: {
        external: ['postcss', 'source-map-js', 'url', 'clean-css', 'punycode'],
      },
      commonjsOptions: {
        ignore: ['postcss', 'source-map-js', 'url', 'clean-css', 'punycode'],
      },
    },
  });
};
