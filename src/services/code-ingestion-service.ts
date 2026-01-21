export interface CodeSnippetData {
  /** The title of the snippet, usually prefixed with [Code]. */
  title: string;
  /** The truncated or full content of the file. */
  content: string;
  /** The type of source, typically 'source-code'. */
  sourceType: 'source-code';
  /** The formatted text used for generating embeddings. */
  embeddingText: string;
}

/**
 * Service responsible for ingesting raw source code files into the Knowledge Base.
 * It handles validation, truncation, and metadata formatting to prepare code for RAG.
 */
export class CodeIngestionService {
  /**
   * Transforms raw file content into a structured Knowledge Snippet object.
   * Handles truncation, metadata tagging, and title formatting.
   *
   * @param relativePath - The file path relative to the project root.
   * @param content - The raw string content of the file.
   * @returns A structured CodeSnippetData object or null if validation fails.
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
   * Excludes node_modules, dist, tests, and declaration files.
   *
   * @param relativePath - The file path to check.
   * @returns True if the file should be ingested, false otherwise.
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
