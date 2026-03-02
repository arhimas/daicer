const fs = require('fs');
const path = require('path');

const scaleFactors = {
  'tiny': 1,
  'small': 1,
  'medium': 1,
  'large': 2,
  'huge': 3,
  'gargantuan': 4
};

const entitiesToScale = [
  'aberration', 'celestial', 'construct', 'dragon', 'elemental',
  'fey', 'fiend', 'giant', 'monstrosity', 'plant', 'undead'
];

const sourceDir = path.join(__dirname, '../data/blueprints/blueprint');

function scaleGrid(originalGrid, scale) {
  if (scale === 1) return originalGrid;
  
  const originalWidth = originalGrid[0].length;
  const originalHeight = originalGrid.length;
  
  const newWidth = originalWidth * scale;
  const newHeight = originalHeight * scale;
  
  const newGrid = [];
  
  for (let y = 0; y < newHeight; y++) {
    const origY = Math.floor(y / scale);
    let newRow = '';
    for (let x = 0; x < newWidth; x++) {
      const origX = Math.floor(x / scale);
      newRow += originalGrid[origY][origX];
    }
    newGrid.push(newRow);
  }
  
  return newGrid;
}

entitiesToScale.forEach(entity => {
  const sourcePath = path.join(sourceDir, entity + '.ts');
  if (!fs.existsSync(sourcePath)) {
    console.warn("Source missed: " + sourcePath);
    return;
  }
  
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Extract configuration from the AST roughly using regex
  const gridMatch = sourceContent.match(/const grid = \[\n([\s\S]*?)\]\.map/);
  if (!gridMatch) return;
  
  const rawRows = gridMatch[1].split(',\n')
    .map(r => r.trim())
    .filter(r => r.length > 0 && r.startsWith('"') && r.endsWith('"'))
    .map(r => r.substring(1, r.length - 1));
  
  Object.keys(scaleFactors).forEach(size => {
    // We already have the medium one acting as the base file, but let's make an explicit -medium just in case,
    // actually, let's keep the base file and generate tiny, small, large, huge, gargantuan
    if (size === 'medium') return;
    
    const scale = scaleFactors[size];
    const newSlug = entity + '-' + size;
    const newName = entity.charAt(0).toUpperCase() + entity.slice(1) + ' (' + size.charAt(0).toUpperCase() + size.slice(1) + ')';
    
    const scaledGrid = scaleGrid(rawRows, scale);
    
    const gridString = scaledGrid.map(row => '  "' + row + '"').join(',\n');
    
    // Replace name, slug, and grid in the original file content
    let newContent = sourceContent
      .replace(/name: '.*'/, "name: '" + newName + "'")
      .replace(/slug: '.*'/, "slug: '" + newSlug + "'")
      .replace(/const grid = \[\n[\s\S]*?\]\.map/, "const grid = [\n" + gridString + "\n].map");
      
    // Scale Anchors
    const anchorMatch = newContent.match(/anchors: {([\s\S]*?)}/);
    if (anchorMatch) {
       let newAnchorsBlock = anchorMatch[1];
       const tupleRegex = /\[(\d+),\s*(\d+)\]/g;
       newAnchorsBlock = newAnchorsBlock.replace(tupleRegex, (match, p1, p2) => {
           return "[" + Math.floor(parseInt(p1) * scale) + ", " + Math.floor(parseInt(p2) * scale) + "]";
       });
       newContent = newContent.replace(/anchors: {([\s\S]*?)}/, "anchors: {" + newAnchorsBlock + "}");
    }
      
    const newFilePath = path.join(sourceDir, newSlug + '.ts');
    fs.writeFileSync(newFilePath, newContent, 'utf8');
    console.log("Generated " + newFilePath);
  });
});
