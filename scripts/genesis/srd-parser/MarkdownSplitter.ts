
import fs from 'fs';
// import path from 'path';

export class MarkdownSplitter {
  constructor(private filePath: string) {}

  public readContent(): string {
    return fs.readFileSync(this.filePath, 'utf-8');
  }

  public extractSection(content: string, header: string): string | null {
    // Find start of the section
    // Regex to find "## Header"
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startRegex = new RegExp(`^##\\s+${escapedHeader}`, 'im');
    const startMatch = startRegex.exec(content);
    
    if (!startMatch) {
      console.warn(`[MarkdownSplitter] Header '${header}' not found.`);
      return null;
    }

    const startIndex = startMatch.index;
    // Move index past the header line
    const headerLineEnd = content.indexOf('\n', startIndex);
    const contentStart = headerLineEnd + 1;

    // Find the NEXT "## " header
    // We treat anything starting with "## " as a top-level split point for classes
    // Note: We use 'g' and 'm' to iterate all headers
    const nextHeaderRegex = /^##\s+/gm;
    nextHeaderRegex.lastIndex = contentStart;
    
    const nextMatch = nextHeaderRegex.exec(content);
    
    const endIndex = nextMatch ? nextMatch.index : content.length;
    
    const sectionContent = content.substring(contentStart, endIndex);
    console.log(`[MarkdownSplitter] Extracted '${header}': ${sectionContent.length} chars (Offset ${contentStart} to ${endIndex})`);
    
    return sectionContent.trim();
  }

  public splitClasses(content: string): Record<string, string> {
    console.log(`[MarkdownSplitter] Total content length: ${content.length}`);
    const classes = [
      'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
      'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
    ];
    
    const result: Record<string, string> = {};
    
    for (const className of classes) {
      const section = this.extractSection(content, className);
      if (section && section.length > 0) {
        result[className] = section;
      } else {
        console.warn(`[MarkdownSplitter] Empty section for ${className}`);
      }
    }
    
    return result;
  }
}
