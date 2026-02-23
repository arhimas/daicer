/* eslint-disable */

import { SourceLoader } from '../../src/features/genesis-core/source-loader';
import { AuditService } from '../../src/features/genesis-core/audit-service';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🔍 Genesis Audit: Scanning Source Data...');

  const loader = new SourceLoader();
  const audit = new AuditService(loader);

  const manifest = await audit.generateManifest();

  console.log('📊 Manifest Generated:');
  console.log(`- Total Entities: ${manifest.counts.total}`);
  Object.entries(manifest.counts).forEach(([type, count]) => {
    if (type !== 'total') console.log(`- ${type}: ${count}`);
  });

  const outputPath = path.resolve(process.cwd(), 'genesis-manifest.json');
  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));

  console.log(`\n💾 Saved to: ${outputPath}`);
}

main().catch(console.error);
