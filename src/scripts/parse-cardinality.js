const fs = require('fs');

function extractJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const startIdx = content.indexOf('__JSON_START__\n') + '__JSON_START__\n'.length;
  const endIdx = content.indexOf('\n__JSON_END__');
  if (startIdx > -1 && endIdx > -1) {
    return JSON.parse(content.substring(startIdx, endIdx));
  }
  return null;
}

const entities = extractJson('/Users/lg/lab/daicer/.tmp_entities.json')?.data || [];
const items = extractJson('/Users/lg/lab/daicer/.tmp_items.json')?.data || [];

const breakdown = {
  entities: {
    total: entities.length,
    bySize: entities.reduce((acc, e) => {
      const s = e.size || 'Medium';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}),
    byCategory: entities.reduce((acc, e) => {
      const c = e.category || 'Unknown';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  },
  items: {
    total: items.length,
    bySize: items.reduce((acc, i) => {
      const s = i.size || 'Medium';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}),
    byType: items.reduce((acc, i) => {
      const t = i.type || 'Unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {})
  }
};

console.log(JSON.stringify(breakdown, null, 2));
