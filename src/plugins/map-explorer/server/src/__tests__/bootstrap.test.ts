
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bootstrap from '../bootstrap';
import fs from 'fs';

// Mock fs
vi.mock('fs');
vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
  }
}));

describe('Map Explorer Bootstrap', () => {
  let mockStrapi: any;

  beforeEach(() => {
    mockStrapi = {
      plugin: vi.fn().mockReturnValue({
        service: vi.fn().mockReturnValue({
          initialize: vi.fn(),
        }),
      }),
      db: {
        query: vi.fn().mockReturnValue({
          findOne: vi.fn(),
          create: vi.fn(),
        }),
      },
      log: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
      },
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize queue service', async () => {
    (fs.existsSync as any).mockReturnValue(false);
    await bootstrap({ strapi: mockStrapi });
    expect(mockStrapi.plugin).toHaveBeenCalledWith('map-explorer');
    expect(mockStrapi.plugin().service().initialize).toHaveBeenCalled();
  });

  it('should seed prompts if missing', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify([{ key: 'sys_p1', text: 'Prompt 1' }]));
    
    // Mock findOne -> null (missing)
    mockStrapi.db.query().findOne.mockResolvedValue(null);

    await bootstrap({ strapi: mockStrapi });
    
    expect(mockStrapi.db.query().create).toHaveBeenCalledWith({
      data: expect.objectContaining({ key: 'sys_p1', text: 'Prompt 1' })
    });
  });

  it('should skip existing prompts', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify([{ key: 'sys_p1', text: 'Prompt 1' }]));
    
    // Mock findOne -> exists
    mockStrapi.db.query().findOne.mockResolvedValue({ id: 1 });

    await bootstrap({ strapi: mockStrapi });
    
    expect(mockStrapi.db.query().create).not.toHaveBeenCalled();
    expect(mockStrapi.log.debug).toHaveBeenCalledWith(expect.stringContaining('exists'));
  });

  it('should handle errors gracefully', async () => {
    (fs.existsSync as any).mockImplementation(() => {
      throw new Error('FS Error');
    });

    await bootstrap({ strapi: mockStrapi });
    
    expect(mockStrapi.log.error).toHaveBeenCalledWith('Failed to seed prompts', expect.any(Error));
  });
});
