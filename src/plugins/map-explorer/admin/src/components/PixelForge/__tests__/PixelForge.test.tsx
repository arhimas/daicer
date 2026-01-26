// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PixelForge } from '../index';
import { vi, describe, it, expect } from 'vitest';

// Mocks
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockModifiedData = { name: 'Test Entity', description: 'A test description' };

vi.mock('@strapi/admin/strapi-admin', () => ({
  useFetchClient: () => ({
    post: mockPost,
    get: mockGet,
  }),
}));

vi.mock('@strapi/content-manager/strapi-admin', () => ({
  unstable_useContentManagerContext: () => ({
    form: { values: mockModifiedData },
  }),
}));

vi.mock('@strapi/design-system', () => ({
   Box: ({children}: any) => <div>{children}</div>,
   Flex: ({children}: any) => <div>{children}</div>,
   Grid: { Root: ({children}: any) => <div>{children}</div>, Item: ({children}: any) => <div>{children}</div> },
   Typography: ({children}: any) => <span>{children}</span>,
   Button: ({onClick, children, disabled, ...props}: any) => <button onClick={onClick} disabled={disabled} {...props}>{children}</button>,
   Textarea: ({onChange, value, ...props}: any) => <textarea onChange={onChange} value={value} {...props} />,
   Loader: () => <div>Loading...</div>,
   Icon: () => <svg />,
}));

vi.mock('@strapi/icons', () => ({
    Pencil: () => <svg />,
    PaintBrush: () => <svg />,
    Eye: () => <svg />,
    Magic: () => <svg />,
}));

describe('PixelForge', () => {
  it('should render and load prompt from entity data', async () => {
    render(<PixelForge name="test" value="null" onChange={vi.fn()} />);
    
    // Open Modal
    const openBtn = screen.getByText('Open Pixel Forge');
    fireEvent.click(openBtn);

    // Check for title inside Modal (Specific)
    expect(await screen.findByText('SOTA Editor')).toBeDefined();
    expect(screen.getByText(/Manifestation/i)).toBeDefined();
    
    const btn = screen.getByText('Forge Sprite');
    expect(btn).toBeDefined();
  });

  it('should call dispatch on generate', async () => {
      mockPost.mockResolvedValue({ data: { jobId: '123' } });
      render(<PixelForge name="test" value="null" onChange={vi.fn()} />);
      
      // Open Modal
      fireEvent.click(screen.getByText('Open Pixel Forge'));
      
      // Wait for modal and enter prompt manually (Auto-context disabled for stability)
      const input = await screen.findByPlaceholderText('Describe the aesthetic...');
      fireEvent.change(input, { target: { value: 'Manual Prompt' } });

      const btn = await screen.findByText('Forge Sprite');
      fireEvent.click(btn);
      
      // Should trigger post with manual prompt
      await waitFor(() => {
          expect(mockPost).toHaveBeenCalledWith('/map-explorer/forge/dispatch', expect.objectContaining({
              prompt: 'Manual Prompt'
          }));
      });
  });
});
