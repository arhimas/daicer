
import { ClassFeature } from '../types';

export class FeatureParser {
  /**
   * Extracts features from the markdown content.
   * It looks for headers like "### Feature Name" or "#### Feature Name".
   */
  public parseFeatures(content: string, className: string): ClassFeature[] {
    const features: ClassFeature[] = [];
    
    // Split by level-3 or level-4 headers
    const featureRegex = /^(#{3,4})\s+(.+)$/gm;
    let match;
    
    // We want to skip headers that are NOT features (e.g. "Class Features", "Hit Points", "Equipment", "Spellcasting" sometimes)
    // But Spellcasting IS a feature, just treated specially.
    // "Ability Score Improvement" is a feature.
    
    const ignoredHeaders = new Set([
      'Class Features', 'Hit Points', 'Proficiencies', 'Equipment', 
      'Creating a ' + className, 'Quick Build', 'Multiclassing',
      className + ' Traits', // for races
    ]);

    const sections: { title: string; level: number; start: number; end: number }[] = [];
    
    while ((match = featureRegex.exec(content)) !== null) {
      if (!ignoredHeaders.has(match[2].trim())) {
         sections.push({
           title: match[2].trim(),
           level: match[1].length,
           start: match.index,
           end: 0 // to be filled
         });
      }
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      section.end = (i < sections.length - 1) ? sections[i+1].start : content.length;
      
      const fullText = content.substring(section.start, section.end);
      // Remove the header line
      const description = fullText.replace(/^(#{3,4})\s+.+$/m, '').trim();
      
      features.push({
        name: section.title,
        level: this.guessLevelFromText(description) || 1, // Fallback to 1 if not found
        description,
        is_subclass_feature: section.level === 4 // Assumption: #### are subclass features or sub-features
      });
    }

    return features;
  }

  private guessLevelFromText(text: string): number | null {
    // Matches "Starting at 2nd level", "At 3rd level", "Beginning at 10th level"
    const regex = /(?:Starting|Beginning|At|When you reach) (?:at|when you reach)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+level/i;
    const match = text.match(regex);
    if (match) return parseInt(match[1]);
    
    // Check for "At x level" (uncommon but possible)
    return null;
  }
}
