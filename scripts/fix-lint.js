const fs = require('fs');

// Fix restricted imports
const mappers = fs
  .readdirSync('src/features/genesis-core/mappers')
  .filter((f) => f.endsWith('.ts'))
  .map((f) => 'src/features/genesis-core/mappers/' + f);

mappers.forEach((f) => {
  let cnt = fs.readFileSync(f, 'utf8');
  cnt = cnt.replace(/from '\.\.\/source-types'/g, "from '@/features/genesis-core/source-types'");
  cnt = cnt.replace(/: any/g, ': Record<string, unknown>');
  cnt = cnt.replace(/<any>/g, '<Record<string, unknown>>');
  fs.writeFileSync(f, cnt);
});

// Fix any types in source-loader.ts
let sl = fs.readFileSync('src/features/genesis-core/source-loader.ts', 'utf8');
sl = sl.replace(/: any\[\]/g, ': Record<string, unknown>[]');
sl = sl.replace(/<any\[\]>/g, '<Record<string, unknown>[]>');
fs.writeFileSync('src/features/genesis-core/source-loader.ts', sl);

// Fix schema-loader
let scl = fs.readFileSync('src/features/genesis-core/schema-loader.ts', 'utf8');
scl = scl.replace(/: any/g, ': Record<string, unknown>');
fs.writeFileSync('src/features/genesis-core/schema-loader.ts', scl);

// Fix source-types
let st = fs.readFileSync('src/features/genesis-core/source-types.ts', 'utf8');
st = st.replace(/: any/g, ': Record<string, unknown>');
st = st.replace(/import { z } from 'zod';\n/, ''); // unused
fs.writeFileSync('src/features/genesis-core/source-types.ts', st);

// Fix queue-dashboard controller
let qd = fs.readFileSync('src/plugins/queue-dashboard/server/src/controllers/dashboard-controller.ts', 'utf8');
qd = qd.replace(/error: any/g, 'error: unknown');
fs.writeFileSync('src/plugins/queue-dashboard/server/src/controllers/dashboard-controller.ts', qd);

// Fix map-explorer unused vars
let exp = fs.readFileSync('src/plugins/map-explorer/server/src/services/__tests__/gemini-service.test.ts', 'utf8');
exp = exp.replace(/const mockFindOne =/g, '// const mockFindOne =');
exp = exp.replace(/const service =/g, '// const service =');
fs.writeFileSync('src/plugins/map-explorer/server/src/services/__tests__/gemini-service.test.ts', exp);

console.log('Lint auto-fixes applied');
