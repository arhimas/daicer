const fs = require('fs');
const path = require('path');
const adminSrcDir = '/Users/lg/lab/daicer/src/plugins/map-explorer/server/src';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('@/plugins/map-explorer/server/src/')) {
        const regex = /@\/plugins\/map-explorer\/server\/src\/(.*?)(['"])/g;
        let modified = false;

        content = content.replace(regex, (match, p1, quote) => {
          let relPath = path.relative(path.dirname(filePath), path.join(adminSrcDir, p1));
          if (!relPath.startsWith('.')) relPath = './' + relPath;
          modified = true;
          return relPath + quote;
        });

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log('Fixed', filePath);
        }
      }
    }
  }
}
processDirectory(adminSrcDir);
