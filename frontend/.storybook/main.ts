import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    // Ensure Vite aliases match main app config
    if (viteConfig.resolve) {
      // eslint-disable-next-line no-param-reassign
      viteConfig.resolve.alias = {
        ...viteConfig.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        daicer: path.resolve(__dirname, '../..'),
      };
    }
    return viteConfig;
  },
};

export default config;
