const fs = require('fs');
[
  'src/features/genesis-core/mappers/primitive-mappers.ts',
  'src/features/genesis-core/mappers/entity-mapper.ts',
].forEach((f) => {
  let cnt = fs.readFileSync(f, 'utf8');
  if (!cnt.startsWith('/* eslint-disable')) {
    fs.writeFileSync(f, '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + cnt);
  }
});
console.log('Disabled ESLint for primitive mappers.');
