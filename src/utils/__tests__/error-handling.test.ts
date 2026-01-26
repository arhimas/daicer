
import { isStrapiError, formatStrapiError, logStrapiError } from '../error-handling';

describe('Error Handling Utils', () => {
  describe('formatStrapiError', () => {
    it('should format a basic Error object', () => {
      const error = new Error('Something went wrong');
      expect(formatStrapiError(error)).toBe('Something went wrong');
    });

    it('should format a string error', () => {
        const error = 'Simple string error';
        expect(formatStrapiError(error)).toBe('Simple string error');
      });

    it('should format a StrapiError with details', () => {
      const strapiError = {
        name: 'ValidationError',
        message: 'Invalid data',
        details: {
          errors: [
            { path: ['field', 'nested'], message: 'Must be unique', name: 'ValidationError' },
            { path: ['other'], message: 'Required', name: 'ValidationError' }
          ]
        }
      };
      
      const formatted = formatStrapiError(strapiError);
      expect(formatted).toContain('field.nested: Must be unique');
      expect(formatted).toContain('other: Required');
    });

    it('should fallback to message if no details', () => {
      const strapiError = {
        name: 'ValidationError',
        message: 'Invalid data containing no details',
      };
      expect(formatStrapiError(strapiError)).toBe('Invalid data containing no details');
    });
  });

  describe('logStrapiError', () => {
    it('should call logger.error with formatted message', () => {
      const mockLogger = { error: vi.fn() };
      const error = new Error('Test Error');
      
      logStrapiError(mockLogger, 'Context', error);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[Context] Failed: Test Error',
        expect.objectContaining({
            stack: expect.any(String)
        })
      );
    });

    it('should log detailed Strapi errors', () => {
        const mockLogger = { error: vi.fn() };
        const strapiError = {
            name: 'APIError',
            message: 'Bad Request',
            details: {
                errors: [{ path: ['id'], message: 'Invalid ID', name: 'Error' }]
            }
        };

        logStrapiError(mockLogger, 'API', strapiError);

        expect(mockLogger.error).toHaveBeenCalledWith(
            '[API] Failed: Bad Request',
            expect.objectContaining({
                details: 'id: Invalid ID'
            })
        );
    });
  });
});
