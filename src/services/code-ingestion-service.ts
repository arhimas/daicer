export interface CodeSnippetData {
  title: string;
  content: string;
  sourceType: 'source-code';
  embeddingText: string;
}

export class CodeIngestionService {
  /**
   * Transforms raw file content into a structured Knowledge Snippet object.
   * Handles truncation, metadata tagging, and title formatting.
   */
  generateSnippetData(relativePath: string, content: string): CodeSnippetData | null {
    // 1. Validation
    if (!content || content.trim().length < 50) {
      return null; // Skip empty/tiny files
    }

    // 2. Truncation
    // We enforce a hard limit to avoid blowing up the embedding context manually if needed,
    // though Jina v3 has a large window, we keep it safe for the DB text field too.
    const MAX_CHARS = 30000;
    let safeContent = content;
    if (content.length > MAX_CHARS) {
      safeContent = content.substring(0, MAX_CHARS) + '\n...[Truncated]';
    }

    // 3. Formatting
    const title = `[Code] ${relativePath}`;
    const embeddingText = `File: ${relativePath}\n${safeContent}`;

    return {
      title,
      content: safeContent,
      sourceType: 'source-code',
      embeddingText,
    };
  }

  /**
   * Determines if a file should be processed based on its path.
   */
  isValidFile(relativePath: string): boolean {
    // Basic guards - extended logic can go here (e.g. specific excludes not covered by glob)
    if (relativePath.includes('node_modules')) return false;
    if (relativePath.includes('dist/')) return false;
    if (relativePath.includes('.test.ts') || relativePath.includes('.spec.ts')) return false;
    if (relativePath.endsWith('.d.ts')) return false;

    return true;
  }
}

export const codeIngestionService = new CodeIngestionService();
