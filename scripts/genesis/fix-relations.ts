/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';

const SEED_DIR = path.join(process.cwd(), 'seed-data');

async function fixSeedData() {
    console.log('🔧 Fixing seed data relations casing...');
    
    // Fix Spells
    const spellDir = path.join(SEED_DIR, 'spell');
    try {
        const spells = await fs.readdir(spellDir);
        for (const file of spells) {
            if (!file.endsWith('.json')) continue;
            const filePath = path.join(spellDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            let changed = false;
            
            // Fix spell school
            if (data.school && typeof data.school === 'string') {
                const lower = data.school.toLowerCase().replace(/ /g, '-');
                if (data.school !== lower) {
                    data.school = lower;
                    changed = true;
                }
            }

            // Fix damage instances' damage_type
            if (Array.isArray(data.damage_instances)) {
                for (const inst of data.damage_instances) {
                    if (inst.damage_type && typeof inst.damage_type === 'string') {
                        const lower = inst.damage_type.toLowerCase().replace(/ /g, '-');
                        if (inst.damage_type !== lower) {
                            inst.damage_type = lower;
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`✅ Fixed casing in ${file}`);
            }
        }
    } catch (e) {
        console.log('Skipped spells or directory not found.');
    }

    // Fix Traits
    const traitDir = path.join(SEED_DIR, 'trait');
    try {
        const traits = await fs.readdir(traitDir);
        for (const file of traits) {
            if (!file.endsWith('.json')) continue;
            const filePath = path.join(traitDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            let changed = false;
            
            // Fix damage instances
            if (Array.isArray(data.damage_instances)) {
                for (const inst of data.damage_instances) {
                    if (inst.damage_type && typeof inst.damage_type === 'string') {
                        const lower = inst.damage_type.toLowerCase().replace(/ /g, '-');
                        if (inst.damage_type !== lower) {
                            inst.damage_type = lower;
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`✅ Fixed casing in ${file}`);
            }
        }
    } catch (e) {
        console.log('Skipped traits or directory not found.');
    }
    
    // Fix Features
    const featureDir = path.join(SEED_DIR, 'feature');
    try {
        const features = await fs.readdir(featureDir);
        for (const file of features) {
            if (!file.endsWith('.json')) continue;
            const filePath = path.join(featureDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            let changed = false;
            
            // Fix damage instances
            if (Array.isArray(data.damage_instances)) {
                for (const inst of data.damage_instances) {
                    if (inst.damage_type && typeof inst.damage_type === 'string') {
                        const lower = inst.damage_type.toLowerCase().replace(/ /g, '-');
                        if (inst.damage_type !== lower) {
                            inst.damage_type = lower;
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`✅ Fixed casing in ${file}`);
            }
        }
    } catch (e) {
        console.log('Skipped features or directory not found.');
    }
    
    console.log('🏁 Finished fixing.');
}

fixSeedData().catch(console.error);

