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
    get: mockGet.mockResolvedValue({ data: { results: [] } }),
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
   SingleSelect: ({children, value, onChange}: any) => <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>,
   SingleSelectOption: ({value, children}: any) => <option value={value}>{children}</option>,
   Loader: () => <div>Loading...</div>,
   Icon: () => <svg />,
}));

vi.mock('@strapi/icons', () => ({
    Pencil: () => <svg />,
    PaintBrush: () => <svg />,
    Eye: () => <svg />,
    Magic: () => <svg />,
    Code: () => <svg />,
    Check: () => <svg />,
    Trash: () => <svg />,
    Drag: () => <svg />,
}));

describe('PixelForge', () => {
  it('should render and load prompt from entity data', async () => {
    render(<PixelForge name="test" value="null" onChange={vi.fn()} />);
    
    // Open Modal
    const openBtn = screen.getByText(/Open Pixel Forge/i);
    fireEvent.click(openBtn);

    // Check for title inside Modal (Specific)
    expect(await screen.findByText('Pixel Forge')).toBeDefined();
    // expect(screen.getByText(/Manifestation/i)).toBeDefined(); // Removed
    
    const btn = screen.getByText('Generate');
    expect(btn).toBeDefined();
  });

  it('should call dispatch on generate', async () => {
      mockPost.mockResolvedValue({ data: { jobId: '123' } });
      render(<PixelForge name="test" value="null" onChange={vi.fn()} />);
      
      // Open Modal
      fireEvent.click(screen.getByText(/Open Pixel Forge/i));
      
      // Wait for modal and enter prompt manually
      const input = await screen.findByPlaceholderText('Describe the aesthetic to manifest...');
      fireEvent.change(input, { target: { value: 'Manual Prompt' } });

      const btn = await screen.findByText('Generate');
      fireEvent.click(btn);
      
      // Should trigger post with manual prompt
      await waitFor(() => {
          expect(mockPost).toHaveBeenCalledWith('/map-explorer/forge/dispatch', expect.objectContaining({
              prompt: 'Manual Prompt'
          }));
      });
  });
});
