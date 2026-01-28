const mock = function() { return mock; };

// Safe URL Proxy for Browser
// If code imports { URL } from 'url', we want it to use the native browser URL
// NOT our recursive mock which breaks 'new URL()'
export const URL = typeof globalThis !== 'undefined' ? globalThis.URL : mock;
export const URLSearchParams = typeof globalThis !== 'undefined' ? globalThis.URLSearchParams : mock;

// Node.js specific methods (safe to stub as empty for browser)
export const fileURLToPath = () => '';
export const pathToFileURL = () => '';
export const parse = () => mock;
export const resolve = () => '';
export const format = () => '';

// PostCSS / SourceMap stubs
mock.SourceMapConsumer = function() { return mock; };
mock.SourceMapGenerator = function() { return mock; };
mock.parse = () => mock;
mock.root = mock;

export default {
    URL,
    URLSearchParams,
    fileURLToPath,
    pathToFileURL,
    parse,
    resolve,
    format,
    SourceMapConsumer: mock.SourceMapConsumer,
    SourceMapGenerator: mock.SourceMapGenerator,
};
