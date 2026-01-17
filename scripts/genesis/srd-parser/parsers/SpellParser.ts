
import { slugify } from '../types';

export interface SpellData {
  slug: string;
  name: string;
  level: number;
  school: string;
  ritual: boolean;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[]; // slugs
}

export class SpellParser {
  
  public parseSpells(sectionContent: string): SpellData[] {
    // Split by #### Headers
    // Note: The first chunk might be empty text before the first spell.
    // We use a regex to find all start indices of #### 
    
    // We can split by line starting with #### 
    const chunks = sectionContent.split(/^####\s+/gm);
    // Remove the first chunk if it doesn't contain a spell (it's likely preamble)
    if (chunks.length > 0 && !chunks[0].includes('**Casting Time:**')) {
        chunks.shift();
    }
    
    const spells: SpellData[] = [];
    
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      
      const spell = this.parseSpellChunk(chunk);
      if (spell) spells.push(spell);
    }
    
    return spells;
  }

  private parseSpellChunk(chunk: string): SpellData | null {
    const lines = chunk.split('\n');
    const name = lines[0].trim(); // The split consumed the ####, so the first line is name
    
    // Search for metadata lines
    // _1st-level abjuration (ritual)_
    // **Classes:** [Ranger](#section-ranger), ...
    // **Casting Time:** ...
    
    let level = 0;
    let school = '';
    let ritual = false;
    let castingTime = '';
    let range = '';
    let components = '';
    let duration = '';
    const classes: string[] = [];
    let descriptionStartLine = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Type Line: _..._
        if (line.startsWith('_') && line.endsWith('_') && i < 10) {
            // _1st-level abjuration (ritual)_
            // _Conjuration cantrip_
            const typeText = line.replace(/_/g, '').toLowerCase();
            
            if (typeText.includes('cantrip')) {
                level = 0;
                school = typeText.replace(' cantrip', '').trim(); // "conjuration"
            } else {
                // "1st-level abjuration"
                const match = typeText.match(/(\d+)(?:st|nd|rd|th)-level/);
                if (match) {
                    level = parseInt(match[1]);
                }
                // School is distinct from level... "abjuration (ritual)"
                school = typeText.replace(/(\d+)(?:st|nd|rd|th)-level\s+/, '').trim();
            }
            
            if (school.includes('(ritual)')) {
                ritual = true;
                school = school.replace('(ritual)', '').trim();
            }
        }

        // Classes
        if (line.startsWith('**Classes:**')) {
            // [Bard](#section-bard), [Druid](#section-druid)
            const classMatches = line.matchAll(/\[(.*?)\]/g);
            for (const m of classMatches) {
                classes.push(slugify(m[1]));
            }
        }

        if (line.startsWith('**Casting Time:**')) castingTime = line.replace('**Casting Time:**', '').trim();
        if (line.startsWith('**Range:**')) range = line.replace('**Range:**', '').trim();
        if (line.startsWith('**Components:**')) components = line.replace('**Components:**', '').trim();
        if (line.startsWith('**Duration:**')) {
            duration = line.replace('**Duration:**', '').trim();
            descriptionStartLine = i + 1; // Description starts after duration
            break; // Stop parsing metadata
        }
    }
    
    // Description is the rest
    if (descriptionStartLine === -1) {
        console.warn(`[SpellParser] Could not find Duration line for ${name}`);
        return null;
    }
    
    const description = lines.slice(descriptionStartLine).join('\n').trim();

    return {
        slug: slugify(name),
        name: name,
        level,
        school: slugify(school), // normalized slug for school? or keep raw string? Let's genericize.
        ritual,
        casting_time: castingTime,
        range,
        components,
        duration,
        description,
        classes
    };
  }
}
