
import fs from 'fs';
import path from 'path';
import { ClassValidationData } from './srd-parser/types';

const CLASSES_DIR = '/Users/lg/lab/daicer/data/library/molecules/classes';
const FEATURES_DIR = '/Users/lg/lab/daicer/data/library/atoms/features';

function main() {
  const classFiles = fs.readdirSync(CLASSES_DIR).filter(f => f.endsWith('.json') && f !== 'srd-classes.json');
  const featureFiles = fs.readdirSync(FEATURES_DIR).filter(f => f.endsWith('.json'));

  const featureMap = new Map<string, string>(); // name -> slug
  
  featureFiles.forEach(f => {
    const content = JSON.parse(fs.readFileSync(path.join(FEATURES_DIR, f), 'utf-8'));
    // Key by "classname-featurename" to avoid collisions? 
    // Actually the usage in Class Progression is just "Feature Name".
    // So distinct classes might have same feature name (e.g. "Spellcasting", "Ability Score Improvement").
    const key = `${content.class.toLowerCase()}:${content.name.toLowerCase()}`;
    featureMap.set(key, content.slug);
  });

  let totalErrors = 0;

  classFiles.forEach(f => {
    const classContent = JSON.parse(fs.readFileSync(path.join(CLASSES_DIR, f), 'utf-8'))[0] as ClassValidationData;
    const slug = classContent.slug;
    
    console.log(`Checking ${classContent.name} (${slug})...`);
    
    const seenFeatures = new Set<string>();
    
    classContent.progression.forEach(level => {
      level.features.forEach(featName => {
        const key = `${slug}:${featName.toLowerCase()}`;
        
        // Handle generic features that might not be class-specific in atomization?
        // Actually our parser generated class-specific atoms for EVERYTHING including "Ability Score Improvement".
        
        if (!featureMap.has(key)) {
           // Try fuzzy match?
           // e.g. "Sacred Oath feature" -> generic placeholder
           if (featName.includes('feature') || featName.includes('Archetype') || featName.includes('Circle') || featName.includes('Path')) {
             // likely a placeholder
           } else {
             console.error(`  [MISSING] Level ${level.level}: '${featName}' not found in atoms (Expected key: ${key})`);
             totalErrors++;
           }
        }
      });
    });
  });

  if (totalErrors > 0) {
    console.error(`\nFound ${totalErrors} missing links.`);
    process.exit(1);
  } else {
    console.log('\nAll links verified successfully!');
  }
}

main();
