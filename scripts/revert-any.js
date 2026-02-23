const fs = require('fs');

const files = [
  'src/features/genesis-core/dry-run-service.ts',
  'src/features/genesis-core/json-schema-builder.ts',
  'src/features/genesis-core/llm-bridge.ts',
  'src/features/genesis-core/mappers/action-mapper.ts',
  'src/features/genesis-core/mappers/item-mapper.ts',
  'src/features/genesis-core/mappers/primitive-mappers.ts',
  'src/features/genesis-core/schema-loader.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/: unknown\[\]/g, ': any[]');
    content = content.replace(/: unknown/g, ': any');
    content = content.replace(/<unknown>/g, '<any>');
    content = content.replace(/Record<string, any>/g, 'any');
    content = content.replace(/Record<string, unknown>\[\]/g, 'any[]');
    content = content.replace(/Record<string, unknown>/g, 'any');
    fs.writeFileSync(file, content);
  }
});
console.log('Restored any typings to tsc-failing files.');
