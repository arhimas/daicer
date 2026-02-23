const fs = require('fs');

function replaceFile(file, replacer) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. Fix source-loader.test.ts imports
replaceFile('src/features/genesis-core/__tests__/source-loader.test.ts', cnt => 
  cnt.replace(/'\.\.\/source-loader'/g, "'@/features/genesis-core/source-loader'")
);

// 2. audit-service.ts any
replaceFile('src/features/genesis-core/audit-service.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
);

// 3. Unused variables in schemas
replaceFile('src/features/genesis-core/data/schemas/monster-blueprint-schema.ts', cnt => 
  cnt.replace(/APIReferenceSchema(,| )/g, '')  // Simplified just to comment or remove if needed, but let's try basic AST cleanup or disable next line.
     .replace(/import \{.*?\} from '\.\/common-schemas';/, match => match.replace('APIReferenceSchema,', ''))
);
replaceFile('src/features/genesis-core/data/schemas/monster-schema.ts', cnt => 
  cnt.replace(/DamageSchema(,| )/g, '') // remove from imports
     .replace(/import \{.*?\} from '\.\/common-schemas';/, match => match.replace('DamageSchema,', ''))
);

// 4. dry-run-service.ts any and unused `e`
replaceFile('src/features/genesis-core/dry-run-service.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
     .replace(/catch \(e: unknown\)/g, 'catch (_e: unknown)')
     .replace(/catch \(e\)/g, 'catch (_e)')
     .replace(/catch \(error: unknown\)/g, 'catch (_error: unknown)')
     .replace(/catch \(err: unknown\)/g, 'catch (_err: unknown)')
);

// 5. json-schema-builder.ts
replaceFile('src/features/genesis-core/json-schema-builder.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
     .replace(/@ts-ignore/g, '@ts-expect-error')
);

// 6. llm-bridge.ts any
replaceFile('src/features/genesis-core/llm-bridge.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
     .replace(/<any>/g, '<unknown>')
);

// 7. spell-mapper.test.ts restricted imports
replaceFile('src/features/genesis-core/mappers/__tests__/spell-mapper.test.ts', cnt => 
  cnt.replace(/'\.\.\/spell-mapper'/g, "'@/features/genesis-core/mappers/spell-mapper'")
     .replace(/'\.\.\/\.\.\/source-types'/g, "'@/features/genesis-core/source-types'")
);

// 8. action-mapper.ts restricted imports & unused DCMethodSchema
replaceFile('src/features/genesis-core/mappers/action-mapper.ts', cnt => 
  cnt.replace(/'\.\.\/data\/schemas\/common-schemas'/g, "'@/features/genesis-core/data/schemas/common-schemas'")
     .replace(/DCMethodSchema, /g, '')
);

// 9. schema-loader.ts any
replaceFile('src/features/genesis-core/schema-loader.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
);

// 10. queue-dashboard controller any
replaceFile('src/plugins/queue-dashboard/server/src/controllers/dashboard-controller.ts', cnt => 
  cnt.replace(/: any/g, ': unknown')
);

// 11. gemini-service.test.ts cleanup
replaceFile('src/plugins/map-explorer/server/src/services/__tests__/gemini-service.test.ts', cnt => 
  cnt.replace(/\/\/ const service =/g, '/* const service = */') // ensuring it's fully commented or deleted
     .replace(/const service =.*?;/g, '')
);

console.log('Second pass applied.');
