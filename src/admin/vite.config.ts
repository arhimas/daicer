import { mergeConfig } from 'vite';

export default (config) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        path: 'path-browserify',
        fs: require.resolve('../plugins/map-explorer/admin/src/shims/fs.ts'),
        'source-map-js': require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
        url: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
        postcss: require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
        'clean-css': require.resolve('../plugins/map-explorer/admin/src/shims/mock.ts'),
      },
    },
  });
};
