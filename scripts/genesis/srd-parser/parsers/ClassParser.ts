
import { ClassValidationData, ParseResult } from '../types';
import { FeatureParser } from './FeatureParser';

export class ClassParser {
  private featureParser = new FeatureParser();

  public parse(className: string, content: string): ParseResult {
    const slug = className.toLowerCase();
    
    return {
      classData: {
        slug,
        name: className,
        hit_die: this.extractHitDie(content),
        proficiency_choices: this.extractSkillChoices(content),
        proficiencies: {
          armor: this.extractProficiencies(content, 'Armor'),
          weapons: this.extractProficiencies(content, 'Weapons'),
          tools: this.extractProficiencies(content, 'Tools'),
          saving_throws: this.extractProficiencies(content, 'Saving Throws'),
        },
        equipment: this.extractEquipment(content),
        progression: this.extractProgressionTable(content)
      },
      features: this.featureParser.parseFeatures(content, className)
    };
  }

  private extractHitDie(content: string): number {
    const match = content.match(/\*\*Hit Dice:\*\* 1d(\d+)/);
    return match ? parseInt(match[1]) : 8; // Default to d8
  }

  private extractProficiencies(content: string, type: string): string[] {
    const regex = new RegExp(`\\*\\*${type}:\\*\\* (.*)`);
    const match = content.match(regex);
    if (!match) return [];
    return match[1].split(',').map(s => s.trim());
  }

  private extractSkillChoices(content: string): string[] {
    const match = content.match(/\*\*Skills:\*\* Choose .*? from (.*)/);
    if (!match) return [];
    return match[1].split(',').map(s => s.replace('and ', '').trim());
  }

  private extractEquipment(content: string): string[] {
    const startRegex = /#### Equipment/;
    const match = content.match(startRegex);
    if (!match || match.index === undefined) return [];
    
    // Search for bullet points after "Equipment" header
    const section = content.substring(match.index);
    const bullets = section.match(/- \(._\) .*/g);
    
    return bullets ? bullets.map(b => b.replace(/^- /, '').trim()) : [];
  }

  private extractProgressionTable(content: string): ClassValidationData['progression'] {
     const progression: ClassValidationData['progression'] = [];
     
     const tableMatch = content.match(/<table[\s\S]*?<\/table>/);
     if (!tableMatch) return [];
     const tableContent = tableMatch[0];

     // Find Header Row to identify "Features" column index
     // <th align="left">Features</th>
     const headerMatch = tableContent.match(/<thead>[\s\S]*?<\/thead>/);
     let featuresColIndex = 2; // Default to 2
     
     if (headerMatch) {
        const headerRow = headerMatch[0];
        const thMatches = headerRow.match(/<th[^>]*>(.*?)<\/th>/g);
        if (thMatches) {
           const headers = thMatches.map(h => h.replace(/<[^>]+>/g, '').trim().toLowerCase());
           // console.log('[ClassParser] Headers:', headers);
           const foundIndex = headers.findIndex(h => h.includes('features'));
           if (foundIndex !== -1) featuresColIndex = foundIndex;
        }
     }
     
     // console.log(`[ClassParser] "Features" column index: ${featuresColIndex}`);

     const tbodyMatch = tableContent.match(/<tbody>([\s\S]*?)<\/tbody>/);
     if (!tbodyMatch) return [];

     const rows = tbodyMatch[1].split('</tr>');

     rows.forEach(row => {
        if (!row.trim()) return;
        
        const colMatches = row.match(/<td[^>]*>(.*?)<\/td>/g);
        if (!colMatches) return;
        
        const cols = colMatches.map(c => c.replace(/<[^>]+>/g, '').trim());
        
        if (cols.length <= featuresColIndex) return; // Row doesn't have enough cols?
        
        // Col 0: Level
        const levelStr = cols[0].replace(/(st|nd|rd|th)/g, '');
        const level = parseInt(levelStr);
        if (isNaN(level)) return;
        
        // Col 1: PB
        const pb = parseInt(cols[1].replace('+', ''));
        
        // Features Column
        const featuresRaw = cols[featuresColIndex];
        
        // Special case: "Favored Enemy and Natural Explorer improvements"
        // Identify " and " separators that function as commas
        let splitFeatures = featuresRaw.split(',');
        
        // Flatten handling for specific " and " cases if they aren't comma separated
        splitFeatures = splitFeatures.flatMap(f => {
             const trimmed = f.trim();
             if (trimmed.includes(' and ') && trimmed.includes('improvements')) {
                 // e.g. "Favored Enemy and Natural Explorer improvements"
                 // -> "Favored Enemy improvement", "Natural Explorer improvement"
                 const parts = trimmed.replace(' improvements', '').split(' and ');
                 return parts.map(p => p + ' improvement');
             }
             return trimmed;
        });

        const features = splitFeatures
            .map(s => this.normalizeFeatureName(s.trim()))
            .filter(s => s !== '—' && s !== '');

        progression.push({
          level,
          pb,
          features,
        });
     });
     
     return progression;
  }

  private normalizeFeatureName(name: string): string {
    // 1. Typos & Known Fixes
    if (name === 'Divine Spite') return 'Divine Smite';
    if (name === 'Signature Spell') return 'Signature Spells'; // Plural in header
    
    // 2. Formatting (remove parens like (d6), (1/rest))
    const normalized = name.replace(/\s*\(.*?\)/g, '');
    
    // 3. Improvements mapping
    // "Wild Shape improvement" -> "Wild Shape"
    // "Divine Intervention improvement" -> "Divine Intervention"
    // "Unarmored Movement improvement" -> "Unarmored Movement"
    // "Aura improvements" -> "Aura of Protection" (Level 18 is a scaling of Auras) - or better, just "Aura of Protection" and "Aura of Courage" are base features. 
    // Actually, "Aura improvements" expands range to 30ft. It applies to both.
    // For now, let's strictly map them if the prefix exists.
    
    if (normalized.endsWith(' improvement') || normalized.endsWith(' improvements')) {
        let base = normalized.replace(/ improvements?$/, '');
        if (base === 'Aura') base = 'Aura of Protection'; 
        return base;
    }
    
    if (normalized === 'Favored Enemy and Natural Explorer') {
        // Range Level 6: "Favored Enemy and Natural Explorer improvements"
        // This is a double feature line.
        // We can't split it easily here because array logic happened earlier.
        // But wait, the list was joined? No, split by comma.
        // If the table cell said "Favored Enemy and Natural Explorer improvements", it didn't have a comma.
        // We should split this manually.
    }
    
    return normalized;
  }
  
  // Override the split logic in extractProgressionTable to also split by " and " for known dual entries?
  // "Favored Enemy and Natural Explorer improvements" -> ["Favored Enemy", "Natural Explorer"]

}
