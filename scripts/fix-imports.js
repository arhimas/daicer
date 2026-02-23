const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allTsFiles = walk('src');

allTsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to replace paths like from '../something'
  // Or from '../../something'
  const importRegex = /from\s+['"]((?:\.\.\/)+)(.*?)['"]/g;

  content = content.replace(importRegex, (match, upDirs, restOfPath) => {
    const fileDir = path.dirname(file);
    // Resolve the absolute path
    const resolvedPath = path.resolve(fileDir, upDirs + restOfPath);
    // Relative to src
    const srcPath = path.resolve('src');
    
    // Check if it's inside `src`
    if (resolvedPath.startsWith(srcPath)) {
      let relativeToSrc = resolvedPath.substring(srcPath.length + 1); // e.g. 'features/genesis-core/llm-bridge'
      changed = true;
      return `from '@/${relativeToSrc}'`;
    }
    
    return match; // return original if not pointing inside src
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
});
console.log('Path aliases enforced uniformly.');
