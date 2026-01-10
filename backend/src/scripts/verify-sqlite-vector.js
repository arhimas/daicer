const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const extensionPath = path.join(__dirname, '../extensions/vector.dylib');

console.log('🔍 verifying sqlite-vector extension...');
console.log('Path:', extensionPath);

if (!fs.existsSync(extensionPath)) {
  console.error('❌ Extension file not found! Please download vector.dylib and place it in backend/extensions/');
  process.exit(1);
}

try {
  const db = new Database(':memory:');
  db.loadExtension(extensionPath);
  console.log('✅ Extension loaded successfully.');

  // Test Usage
  console.log('🧪 Testing Vector Operations...');

  db.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, embedding BLOB)');

  // Init
  const init = db.prepare("SELECT vector_init('items', 'embedding', 'type=FLOAT32,dimension=4,distance=COSINE')").get();
  console.log('Initialized:', init);

  // Insert
  // vector_convert_f32 takes a string
  db.prepare('INSERT INTO items (embedding) VALUES (vector_convert_f32(?))').run('[0.1, 0.2, 0.3, 0.4]');
  db.prepare('INSERT INTO items (embedding) VALUES (vector_convert_f32(?))').run('[0.9, 0.8, 0.7, 0.6]');

  // Query
  const result = db
    .prepare(
      `
    SELECT id, vector_distance_cos(embedding, vector_convert_f32(?)) as distance 
    FROM items 
    ORDER BY distance ASC 
    LIMIT 1
  `
    )
    .get('[0.1, 0.2, 0.3, 0.4]');

  console.log('Query Result:', result);

  if (result && result.distance < 0.0001) {
    console.log('✅ Vector search working correctly!');
  } else {
    console.error('❌ Vector search returned unexpected result:', result);
  }

  db.close();
} catch (err) {
  console.error('❌ Verification failed:', err);
}
