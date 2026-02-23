import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DryRunService } from '@/features/genesis-core/dry-run';
import { SchemaLoader } from '@/features/genesis-core/schema-loader';

// Mock SchemaLoader
const mockLoadSchema = vi.fn();

const mockLoader = {
    loadSchema: mockLoadSchema,
    listSchemas: vi.fn()
} as unknown as SchemaLoader;

describe('DryRunService', () => {
    let service: DryRunService;

    beforeEach(() => {
        service = new DryRunService(mockLoader);
        vi.clearAllMocks();
    });

    it('should validate valid simple data', async () => {
        mockLoadSchema.mockResolvedValue({
            attributes: {
                name: { type: 'string', required: true },
                age: { type: 'integer', min: 0 }
            }
        });

        const data = { name: 'Test', age: 25 };
        const result = await service.validate(data, 'test.user');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
        mockLoadSchema.mockResolvedValue({
            attributes: {
                name: { type: 'string', required: true }
            }
        });

        const data = { age: 25 };
        const result = await service.validate(data, 'test.user');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing required field: test.user.name');
    });

    it('should validate enum values', async () => {
        mockLoadSchema.mockResolvedValue({
            attributes: {
                role: { type: 'enumeration', enum: ['admin', 'user'] }
            }
        });

        const data = { role: 'guest' };
        const result = await service.validate(data, 'test.user');

        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Invalid enum value for test.user.role: got 'guest'");
    });

    it('should validate nested components', async () => {
        mockLoadSchema.mockResolvedValue({
            attributes: {
                address: { 
                    type: 'component', 
                    component: 'test.address',
                    __schema: {
                        attributes: {
                            city: { type: 'string', required: true }
                        }
                    }
                }
            }
        });

        const data = { address: { city: '' } }; // Empty string is falsy check? strict check empty string?
        // My implementation checks (value === '') for required strings.
        
        const result = await service.validate(data, 'test.user');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing required field: test.user.address.city');
    });
    
    it('should validate integer ranges', async () => {
         mockLoadSchema.mockResolvedValue({
            attributes: {
                level: { type: 'integer', min: 1, max: 20 }
            }
        });
        
        const resultLow = await service.validate({ level: 0 }, 'test.char');
        expect(resultLow.valid).toBe(false);
        expect(resultLow.errors[0]).toContain('Value too small');

        const resultHigh = await service.validate({ level: 21 }, 'test.char');
        expect(resultHigh.valid).toBe(false);
        expect(resultHigh.errors[0]).toContain('Value too large');
    });
});
