import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'stream',
        'assert',
        'events',
        'util',
        'node:fs',
        'node:path',
        'node:url',
        
        // Server-only dependencies to exclude from Admin bundle
        'pngjs',
        '@google/genai',
        'bullmq', 

        // any other potential leaks
        'clean-css'
      ],
    },
  },
  resolve: {
      alias: {
        fs: require.resolve('./admin/src/shims/fs.ts'),
        path: require.resolve('path-browserify'),
        os: false,
        crypto: false,
      'sanitize-html': false,
      postcss: false,
      'source-map-js': false,
      url: false,
    },
  },
  define: {
    'process.env': {},
  },
});
