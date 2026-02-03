import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadBase64Image } from '@/utils/upload';
import fs from 'fs';
import os from 'os';
import path from 'path';

vi.mock('fs');
vi.mock('os');
vi.mock('path');

describe('Upload Utils', () => {
  let originalStrapi: any;
  const mockUpload = vi.fn();

  beforeEach(() => {
    originalStrapi = (global as any).strapi;
    (global as any).strapi = {
      log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      plugin: vi.fn(() => ({
        service: vi.fn(() => ({
          upload: mockUpload,
        })),
      })),
    };

    // FS mocks
    (path.join as any).mockImplementation((...args) => args.join('/'));
    (os.tmpdir as any).mockReturnValue('/tmp');
    (fs.writeFileSync as any).mockImplementation(() => {});
    (fs.statSync as any).mockReturnValue({ size: 1000 });
    (fs.createReadStream as any).mockReturnValue('stream');
    (fs.existsSync as any).mockReturnValue(true);
    (fs.unlinkSync as any).mockImplementation(() => {});
  });

  afterEach(() => {
    (global as any).strapi = originalStrapi;
    vi.clearAllMocks();
  });

  it('should upload valid base64 image', async () => {
    const base64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    mockUpload.mockResolvedValue([{ id: 1, url: '/uploads/img.png' }]);

    const result = await uploadBase64Image(base64, 'test');

    expect(result).toEqual({ id: 1, url: '/uploads/img.png' });
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/test.png', expect.any(Buffer));
    expect(mockUpload).toHaveBeenCalled();
  });

  it('should return null for invalid base64', async () => {
    const result = await uploadBase64Image('invalid', 'test');
    expect(result).toBeNull();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('should return null if upload fails', async () => {
    const base64 = 'data:image/png;base64,foo';
    mockUpload.mockRejectedValue(new Error('Upload failed'));

    const result = await uploadBase64Image(base64, 'test');
    expect(result).toBeNull();
    expect((global as any).strapi.log.error).toHaveBeenCalled();
  });
});
