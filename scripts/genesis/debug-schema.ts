/* eslint-disable */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { SpellSchema } from '../../src/features/genesis-core/data/schemas/spell-schema';

const filePath = path.resolve(process.cwd(), 'src/features/genesis-core/data/5e-2014/5e-SRD-Spells.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

try {
    z.array(SpellSchema).parse(data);
    console.log('✅ Spells Valid');
} catch (e) {
    if (e instanceof z.ZodError) {
        // Log just the first error to avoid massive output
        console.error('❌ Validation Error (First 5):');
        console.error(JSON.stringify(e.issues.slice(0, 5), null, 2));
    } else {
        console.error(e);
    }
}
