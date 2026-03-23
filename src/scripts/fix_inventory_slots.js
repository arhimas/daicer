const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '../genesis/blueprints/entity');

let changedFiles = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith('.ts')) continue;
  const filePath = path.join(DIR, file);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('inventory: [')) continue;

  const invRegex = /inventory:\s*\[([\s\S]*?)\]\s*,/g;
  
  let hasChanges = false;
  
  const newContent = content.replace(invRegex, (match, arrayContent) => {
    // We are going to strictly split by `{` and `}` blocks
    const items = [];
    let currentBlock = '';
    let inBrace = 0;
    
    for (let i = 0; i < arrayContent.length; i++) {
       const char = arrayContent[i];
       if (char === '{') inBrace++;
       if (inBrace > 0) currentBlock += char;
       if (char === '}') {
          inBrace--;
          if (inBrace === 0) {
             items.push(currentBlock);
             currentBlock = '';
          }
       }
    }
    
    // Check if slots are duplicated
    const slotCounts = {};
    const newItems = items.map(itemStr => {
       const slotMatch = /slot:\s*'([^']+)'/.exec(itemStr);
       if (slotMatch) {
          const slot = slotMatch[1];
          if (slotCounts[slot]) {
             // Duplicate
             slotCounts[slot]++;
             hasChanges = true;
             console.log(`[${file}] Moving duplicate ${slot} to backpack`);
             return itemStr.replace(/slot:\s*'[^']+'/, "slot: 'backpack'")
                           .replace(/isEquipped:\s*true/g, "isEquipped: false");
          } else {
             slotCounts[slot] = 1;
             return itemStr;
          }
       }
       return itemStr;
    });
    
    if (hasChanges) {
       // Re-construct the array with proper commas between items
       return `inventory: [\n${newItems.map(i => `    ${i}`).join(',\n')}\n  ],`;
    }
    
    return match; // No changes
  });
  
  if (hasChanges) {
     fs.writeFileSync(filePath, newContent, 'utf-8');
     changedFiles++;
  }
}

console.log(`Done. Changed ${changedFiles} files.`);
