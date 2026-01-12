import { describe, it, expect } from 'vitest';
import { codeIngestionService } from '../code-ingestion-service';

describe('CodeIngestionService', () => {
  describe('isValidFile', () => {
    it('should accept valid source files', () => {
      expect(codeIngestionService.isValidFile('src/index.ts')).toBe(true);
      expect(codeIngestionService.isValidFile('src/services/api.js')).toBe(true);
    });

    it('should reject excluded patterns', () => {
      expect(codeIngestionService.isValidFile('node_modules/foo/index.ts')).toBe(false);
      expect(codeIngestionService.isValidFile('dist/index.js')).toBe(false);
      expect(codeIngestionService.isValidFile('src/utils.test.ts')).toBe(false);
      expect(codeIngestionService.isValidFile('src/types.d.ts')).toBe(false);
    });
  });

  describe('generateSnippetData', () => {
    it('should return null for tiny files', () => {
      const content = 'too short';
      const result = codeIngestionService.generateSnippetData('short.ts', content);
      expect(result).toBeNull();
    });

    it('should generate correct metadata for valid files', () => {
      const content = 'const x = 1; '.repeat(10); // > 50 chars
      const result = codeIngestionService.generateSnippetData('src/main.ts', content);
      
      expect(result).not.toBeNull();
      expect(result!.title).toBe('[Code] src/main.ts');
      expect(result!.sourceType).toBe('source-code');
      expect(result!.embeddingText).toContain('File: src/main.ts');
      expect(result!.content).toBe(content);
    });

    it('should truncate extremely large files', () => {
      const largeContent = 'a'.repeat(30050);
      const result = codeIngestionService.generateSnippetData('large.ts', largeContent);
      
      expect(result).not.toBeNull();
      expect(result!.content.length).toBeLessThan(largeContent.length);
      expect(result!.content).toContain('...[Truncated]');
      expect(result!.content.length).toBe(30000 + 15); // 30000 + length of suffix (\n...[Truncated] = 15 chars)
    });
  });
});
