/* eslint-disable */
import { JsonSchemaBuilder } from '../../src/features/genesis-core/json-schema-builder';
import { SchemaLoader } from '../../src/features/genesis-core/schema-loader';
import fs from 'fs/promises';

async function testSchemaSize() {
    const loader = new SchemaLoader();
    const builder = new JsonSchemaBuilder(loader);
    const schema = await builder.build('api::item.item');
    await fs.writeFile('schema.json', JSON.stringify(schema, null, 2));
    console.log(`Schema dumped to schema.json`);
}

testSchemaSize().catch(console.error);
