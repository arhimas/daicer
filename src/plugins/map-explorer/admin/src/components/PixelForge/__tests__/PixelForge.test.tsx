// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PixelForge } from '..';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// --- Mocks ---
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockModifiedData = { name: 'Test Entity', category: 'Creature', documentId: 'doc-123' };

import { useParams } from 'react-router-dom';
import { useForm } from '@strapi/admin/strapi-admin';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

vi.mock('@strapi/admin/strapi-admin', () => ({
  useFetchClient: () => ({
    post: mockPost,
    get: mockGet,
  }),
  useForm: vi.fn(),
}));

vi.mock('@strapi/content-manager/strapi-admin', () => ({
  unstable_useContentManagerContext: () => ({
    form: { values: mockModifiedData },
    model: { uid: 'api::creature.creature' },
  }),
}));

vi.mock('@strapi/design-system', () => {
  return {
    Box: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
    Flex: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Typography: ({ children }: any) => <span>{children}</span>,
    Button: ({ onClick, children, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Textarea: ({ onChange, value, placeholder }: any) => (
      <textarea onChange={onChange} value={value} placeholder={placeholder} />
    ),
    SingleSelect: ({ children, onChange, placeholder }: any) => (
      <select onChange={(e) => onChange(e.target.value)} defaultValue="">
        <option value="" disabled>{placeholder}</option>
        {children}
      </select>
    ),
    SingleSelectOption: ({ children, value }: any) => <option value={value}>{children}</option>,
  };
});

vi.mock('@strapi/icons', () => ({
  Magic: () => <span>Icon-Magic</span>,
  Pin: () => <span>Icon-Pin</span>,
  Trash: () => <span>Icon-Trash</span>,
  Check: () => <span>Icon-Check</span>,
}));

describe('PixelForge SOTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { results: [] } });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(useParams).mockReturnValue({ slug: 'api::creature.creature' });
    vi.mocked(useForm).mockReturnValue({ values: mockModifiedData } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render initial state', () => {
    render(<PixelForge name="test" value="{}" onChange={vi.fn()} />);
    expect(screen.getByText('Image & Anchors Forge')).toBeDefined();
    expect(screen.getByText('Generate Image')).toBeDefined();
    expect(screen.getByText('No Image (Upload or Generate)')).toBeDefined();
  });

  it('should auto-center terrain on mount', async () => {
    const onChange = vi.fn();
    // Temporarily mock useParams to return terrain
    vi.mocked(useParams).mockReturnValue({ slug: 'api::terrain.terrain' });
    
    render(<PixelForge name="test" value="{}" onChange={onChange} />);
    
    // Auto-center uses a 100ms timeout
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    }, { timeout: 500 });

    const lastCall = onChange.mock.calls[0][0];
    const parsed = JSON.parse(lastCall.target.value);
    expect(parsed.metadata.sockets).toEqual([{ x: 16, y: 16, label: 'center' }]);
  });

  it('should dispatch AI generation request', async () => {
    mockPost.mockResolvedValue({ data: { jobId: 'job-123' } });
    const validInitialValue = JSON.stringify({
      prompt: 'A golden dragon',
      metadata: {}
    });
    render(<PixelForge name="test" value={validInitialValue} onChange={vi.fn()} />);

    // Click Generate
    const genBtn = screen.getByText('Generate Image');
    fireEvent.click(genBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/map-explorer/forge/dispatch',
        expect.objectContaining({
          prompt: '[Creature] - Test Entity',
          archetype: 'Humanoid', // Default for Sprite logic in code
          action: 'generate_image',
        })
      );
    });
  });

  it('should parse an existing sprite image URL and render it', () => {
    // Form is mocked to return mockModifiedData, we need to sneak in a sprite object
    const mockSpriteData = { ...mockModifiedData, sprite: { url: 'http://test.image' } };
    vi.mocked(useForm).mockReturnValue({ values: mockSpriteData } as any);

    render(<PixelForge name="test" value="{}" onChange={vi.fn()} />);
    
    const img = screen.getByAltText('Asset Sprite');
    expect(img).toBeDefined();
    expect((img as HTMLImageElement).src).toBe('http://test.image/');
  });
  
  it('should add an anchor when clicking the image', async () => {
    const onChange = vi.fn();
    // provide a sprite so the image renders and we can click it
    const mockSpriteData = { ...mockModifiedData, sprite: { url: 'http://test.image' } };
    vi.mocked(useForm).mockReturnValue({ values: mockSpriteData } as any);
    
    // Provide a mocked dictionary result
    mockGet.mockResolvedValue({ data: { results: [{ id: 1, name: 'head', slug: 'head' }] } });

    // Mock naturalWidth/Height for the click math
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { get: () => 32 });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', { get: () => 32 });
    
    render(<PixelForge name="test" value="{}" onChange={onChange} />);
    
    // Wait for the dict fetch on mount
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    const img = screen.getByAltText('Asset Sprite');
    
    // Mock getBoundingClientRect
    img.getBoundingClientRect = vi.fn(() => ({
      width: 256,
      height: 256,
      top: 0,
      left: 0,
      bottom: 256,
      right: 256,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));

    fireEvent.click(img, { clientX: 128, clientY: 128 });
    
    // Validate overlay
    expect(screen.getByText('Link Anchor at [16, 16]')).toBeDefined();
    
    // Interact with Select
    const select = screen.getByDisplayValue('Select Anchor Dictionary');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Confirm Selection
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(onChange).toHaveBeenCalled();
    
    const lastCall = onChange.mock.calls[0][0];
    const parsed = JSON.parse(lastCall.target.value);
    
    // Center of 256 clicked -> ratio (32/256 = 0.125) -> x = 128 * 0.125 = 16
    expect(parsed.metadata.sockets[0].x).toBe(16);
    expect(parsed.metadata.sockets[0].y).toBe(16);
    expect(parsed.metadata.sockets[0].label).toBe('head');
    expect(parsed.metadata.sockets[0].id).toBe(1);
  });
});
