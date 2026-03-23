import fs from 'fs';
import path from 'path';

const BLUEPRINTS_DIR = path.resolve(__dirname, '../genesis/blueprints/entity');

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('inventory: [')) return false;

  // We are dealing with TS files so we can't just JSON parse.
  // Instead of a dangerous regex, let's find the `inventory: [` start and its closing `],`
  
  const startIdx = content.indexOf('inventory: [');
  if (startIdx === -1) return false;
  
  let endIdx = -1;
  let bracketCount = 0;
  for (let i = startIdx + 11; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') {
       bracketCount--;
       if (bracketCount === 0) {
          endIdx = i;
          break;
       }
    }
  }
  
  if (endIdx === -1) return false;
  
  const invString = content.substring(startIdx + 11, endIdx + 1);
  
  // Quick check for duplicates via regex without replacing yet
  const slotMatches = [...invString.matchAll(/slot:\s*'([^']+)'/g)].map(m => m[1]);
  const hasDuplicates = new Set(slotMatches).size !== slotMatches.length;
  
  if (!hasDuplicates) return false;
  
  // Okay, we need to fix it. Let's do a very careful string replace on the slot fields
  let newInvString = invString;
  const seenSlots = new Set<string>();
  
  // Split the array contents by object brackets
  const objectRegex = /\{[^}]+\}/g;
  newInvString = newInvString.replace(objectRegex, (objStr) => {
    const slotMatch = /slot:\s*'([^']+)'/.exec(objStr);
    if (!slotMatch) return objStr;
    
    const slotName = slotMatch[1];
    if (seenSlots.has(slotName)) {
      // Duplicate!
      console.log(`Fixing duplicate slot ${slotName} -> backpack in ${path.basename(filePath)}`);
      return objStr
        .replace(/slot:\s*'[^']+'/, "slot: 'backpack'")
        .replace(/isEquipped:\s*true/, "isEquipped: false");
    } else {
      seenSlots.add(slotName);
      return objStr;
    }
  });
  
  content = content.substring(0, startIdx + 11) + newInvString + content.substring(endIdx + 1);
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function run() {
  const files = fs.readdirSync(BLUEPRINTS_DIR).filter(f => f.endsWith('.ts'));
  console.log(`Scanning ${files.length} entity blueprints for duplicate inventory slots...`);
  
  let fixedCount = 0;
  for (const file of files) {
    if (processFile(path.join(BLUEPRINTS_DIR, file))) {
      fixedCount++;
    }
  }
  
  console.log(`Finished! Modified ${fixedCount} files.`);
}

run();
