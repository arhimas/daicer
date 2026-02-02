// Robust Safe Mock
// Uses Proxy to trap all access, calls, and assignments.
// Prevents "Cannot read properties of undefined" and "Cannot set properties of undefined".

const createMock = () => {
    const fn = function() {}; 
    
    // Use unknown for the proxy type to satisfy lint, as it's a catch-all mock
    const proxy: unknown = new Proxy(fn, {
        get: (_target, prop) => {
            // Primitives for safety
            if (prop === 'toString') return () => 'mock';
            if (prop === 'valueOf') return () => 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (prop === 'then') return (resolve: (arg0: any) => any) => resolve(proxy);
            if (prop === Symbol.toPrimitive) return () => 0;
             // Recursive Mock
            return proxy;
        },
        apply: (_target, _thisArg, _argumentsList) => {
            return proxy;
        },
        construct: (_target, _args) => {
            return proxy as object;
        },
        set: (_target, _prop, _value) => {
            // Swallow assignments to pretend they succeeded
            return true;
        }
    });
    return proxy;
};

const mock = createMock();

// Safe URL Proxy for Browser
export const URL = typeof globalThis !== 'undefined' && globalThis.URL ? globalThis.URL : mock;
export const URLSearchParams = typeof globalThis !== 'undefined' && globalThis.URLSearchParams ? globalThis.URLSearchParams : mock;

// Node.js overrides
export const fileURLToPath = () => '';
export const pathToFileURL = () => '';
export const parse = () => mock;
export const resolve = () => '';
export const format = () => '';

// Library overrides
export const SourceMapConsumer = mock;
export const SourceMapGenerator = mock;
export const SourceNode = mock;

// PostCSS overrides
export const comment = mock;
export const root = mock;
export const atRule = mock;
export const decl = mock;
export const rule = mock;
export const plugin = mock;
export const vendor = mock;
export const list = mock;
export const cssSyntaxError = mock;
export const stringify = mock;
export const input = mock;
export const result = mock;
export const warning = mock;
export const container = mock;
export const node = mock;

export default mock;
