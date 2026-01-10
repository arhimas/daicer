 
import fs from 'fs';
import path from 'path';
// import Module from 'module';
import * as ts from 'typescript';

// We need to use require for internal Strapi paths that might not have types
const strapiCoreRoot = path.dirname(require.resolve('@strapi/core/package.json'));
const loadConfigFilePath = path.join(strapiCoreRoot, 'dist', 'utils', 'load-config-file.js');
const configLoaderPath = path.join(strapiCoreRoot, 'dist', 'configuration', 'config-loader.js');

const loadConfigFileModule = require(loadConfigFilePath);
const originalLoadConfigDir = require(configLoaderPath);

export const applyStrapiPatches = () => {
  console.log('[TestHarness] Applying Strapi TS Config Patches...');

  // 0. Register tsconfig-paths
  try {
    const tsConfigPaths = require('tsconfig-paths');
    // Use path.resolve to match how we imported it in setup-strapi
    const tsConfigPath = path.resolve(__dirname, '../../../tsconfig.json');

    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = require(tsConfigPath);

      if (tsConfig && tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
        tsConfigPaths.register({
          baseUrl: path.join(__dirname, '../../../'),
          paths: tsConfig.compilerOptions.paths,
        });
        console.log('[TestHarness] tsconfig-paths registered successfully');
      } else {
        console.log('[TestHarness] tsconfig.json found but no paths defined');
      }
    } else {
      console.warn('[TestHarness] tsconfig.json not found at', tsConfigPath);
    }
  } catch (e) {
    console.warn('[TestHarness] Failed to register tsconfig-paths', e);
  }

  // 1. PATCH: TypeScript Configuration Loader
  if (!loadConfigFileModule.loadConfigFile.__tsRuntimePatched) {
    const strapiUtils = require('@strapi/utils');
    const originalLoadConfigFile = loadConfigFileModule.loadConfigFile;

    const loadTypeScriptConfig = (file: string) => {
      // In our setup, we assume ts-node is handling compilation or we use a simple transpile
      const source = fs.readFileSync(file, 'utf8');

      // Simple transpile for config files
      const output = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2019,
          esModuleInterop: true,
        },
        fileName: file,
        reportDiagnostics: false,
      });

      // Execute the transpiled code
      const Module = require('module');
      const moduleInstance = new Module(file);
      moduleInstance.filename = file;
      moduleInstance.paths = Module._nodeModulePaths(path.dirname(file));
      moduleInstance._compile(output.outputText, file);

      const exported = moduleInstance.exports;
      const resolved = exported && exported.__esModule ? exported.default : exported;

      if (typeof resolved === 'function') {
        return resolved({ env: strapiUtils.env });
      }

      return resolved;
    };

     
    const patchedLoadConfigFile = (file: string) => {
      const extension = path.extname(file).toLowerCase();
      if (['.ts', '.cts', '.mts'].includes(extension)) {
        return loadTypeScriptConfig(file);
      }
      return originalLoadConfigFile(file);
    };

    patchedLoadConfigFile.__tsRuntimePatched = true;
    loadConfigFileModule.loadConfigFile = patchedLoadConfigFile;
    require.cache[loadConfigFilePath].exports = loadConfigFileModule;
  }

  // 2. PATCH: Configuration Directory Scanner
  if (!originalLoadConfigDir.__tsRuntimePatched) {
    const validExtensions = ['.js', '.json', '.ts', '.cts', '.mts'];

     
    const patchedLoadConfigDir = (dir: string) => {
      if (!fs.existsSync(dir)) return {};

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configFiles = entries.reduce((acc: any[], entry) => {
        if (!entry.isFile()) return acc;
        const ext = path.extname(entry.name).toLowerCase();

        // Allow TS extensions
        if (validExtensions.includes(ext)) {
          // Verify it's not a restricted name / collision (simplified logic from original)
          acc.push(entry);
        }
        return acc;
      }, []);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return configFiles.reduce((acc: any, entry) => {
        const ext = path.extname(entry.name);
        const key = path.basename(entry.name, ext);
        const filePath = path.resolve(dir, entry.name);
        // Use our patched loader
        acc[key] = loadConfigFileModule.loadConfigFile(filePath);
        return acc;
      }, {});
    };

    patchedLoadConfigDir.__tsRuntimePatched = true;
    require.cache[configLoaderPath].exports = patchedLoadConfigDir;
  }

  // 3. PATCH: Database Connection Handler
  const databaseConnection = require('@strapi/database/dist/connection.js');
  const knexFactory = require('knex');

  if (!databaseConnection.createConnection.__tsRuntimePatched) {
    databaseConnection.createConnection = (() => {
      const clientMap = {
        sqlite: 'better-sqlite3',
        mysql: 'mysql2',
        postgres: 'pg',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (userConfig: any, strapiConfig: any) => {
        const client = clientMap[userConfig.client] || userConfig.client;

        if (!client) {
          throw new Error(`Unsupported database client ${userConfig.client}`);
        }

        const knexConfig = {
          ...userConfig,
          client,
        };

        if (strapiConfig?.pool?.afterCreate) {
          knexConfig.pool = knexConfig.pool || {};

          const userAfterCreate = knexConfig.pool?.afterCreate;
          const strapiAfterCreate = strapiConfig.pool.afterCreate;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          knexConfig.pool.afterCreate = (conn: any, done: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            strapiAfterCreate(conn, (err: any, nativeConn: any) => {
              if (err) {
                return done(err, nativeConn);
              }

              if (userAfterCreate) {
                return userAfterCreate(nativeConn, done);
              }

              return done(null, nativeConn);
            });
          };
        }

        return knexFactory(knexConfig);
      };
    })();
    databaseConnection.createConnection.__tsRuntimePatched = true;
  }
};
