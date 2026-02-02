
import { SPELLS as LegacySpells } from '../../genesis/seed-data/spells';
import fs from 'fs';
import path from 'path';

function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function parseCastingTime(s: string) {
    // "1 action", "1 bonus action", "10 minutes"
    const match = s.match(/(\d+)\s+(.+)/);
    if (!match) return { time_value: 1, time_unit: 'action' };
    
    let unit = match[2].trim().toLowerCase();
    if (unit.endsWith('s')) unit = unit.slice(0, -1); // minute -> minute
    
    // safe map
    const validUnits = ["action", "bonus_action", "reaction", "minute", "hour", "day"];
    // map "action" -> "action"
    // map "bonus action" -> "bonus_action"
    unit = unit.replace(' ', '_');
    
    return {
        time_value: parseInt(match[1]),
        time_unit: validUnits.includes(unit) ? unit : 'action'
    };
}

const NewSpells = LegacySpells.map((old: any) => {
    // Casting
    const casting = parseCastingTime(old.casting_time || "1 action");
    
    return {
        slug: old.slug,
        name: old.name,
        level: old.level,
        school: capitalize(old.school),
        description: old.description,
        casting_config: {
            time_value: casting.time_value,
            time_unit: casting.time_unit,
            ritual: old.ritual || false,
            concentration: (old.duration || "").includes("Concentration")
        },
        range_config: {
            // Simplified
            type: (old.range || "").includes("Self") ? "self" : "point",
            distance: parseInt((old.range || "0").match(/\d+/) || "0")
        },
        duration_config: {
            type: (old.duration || "").includes("Instantaneous") ? "instantaneous" : "timed",
            value: parseInt((old.duration || "0").match(/\d+/) || "1"),
            unit: (old.duration || "round").includes("minute") ? "minute" : "round" // naive
        },
        tags: old.classes || [] // Mapping classes to tags relation for now as legacy used 'classes' field mostly for filtering
    };
});

const fileContent = `
import { SeedSpell } from '../schemas/molecules';

export const SPELLS: SeedSpell[] = ${JSON.stringify(NewSpells, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../../genesis/vault/spells.ts'), fileContent);
console.log(`Migrated ${NewSpells.length} spells to vault/spells.ts`);
