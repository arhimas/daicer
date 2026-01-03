import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeControls } from '../TimeControls';
import { useTimeFrame } from '../../../../contexts/TimeFrameContext';

// Mock context
vi.mock('../../../../contexts/TimeFrameContext', () => ({
  useTimeFrame: vi.fn(),
}));

describe('TimeControls', () => {
  const mockGoLive = vi.fn();
  const mockJumpToFrame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTimeFrame as any).mockReturnValue({
      history: [],
      currentTimeFrame: null,
      jumpToFrame: mockJumpToFrame,
      goLive: mockGoLive,
      isLive: true,
    });
  });

  it('should render no history state', () => {
    (useTimeFrame as any).mockReturnValue({
      history: [],
    });
    render(<TimeControls />);
    expect(screen.getByText('No History Available')).toBeInTheDocument();
  });

  it('should render LIVE state correctly', () => {
    (useTimeFrame as any).mockReturnValue({
      history: [{ id: '1' }, { id: '2' }],
      isLive: true,
      currentTimeFrame: { id: '2', turnNumber: 2 },
      goLive: mockGoLive,
    });
    render(<TimeControls />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();

    // START and NOW labels
    expect(screen.getByText('START')).toBeInTheDocument();
    expect(screen.getByText('NOW (2)')).toBeInTheDocument(); // total 2

    // Slider value should be max
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('1'); // length - 1

    // GO LIVE disabled
    const btn = screen.getByText('GO LIVE');
    expect(btn).toBeDisabled();
  });

  it('should render HIST historical state', () => {
    (useTimeFrame as any).mockReturnValue({
      history: [
        { id: '1', turnNumber: 1 },
        { id: '2', turnNumber: 2 },
      ],
      isLive: false,
      currentTimeFrame: { id: '1', turnNumber: 1 },
      goLive: mockGoLive,
      jumpToFrame: mockJumpToFrame,
    });
    render(<TimeControls />);

    expect(screen.getByText('HIST: T1')).toBeInTheDocument();

    // Slider value should be 0
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('0');

    // GO LIVE enabled
    const btn = screen.getByText('GO LIVE');
    expect(btn).not.toBeDisabled();
  });

  it('should call goLive when clicking button', () => {
    (useTimeFrame as any).mockReturnValue({
      history: [{ id: '1' }],
      isLive: false,
      goLive: mockGoLive,
    });
    render(<TimeControls />);
    fireEvent.click(screen.getByText('GO LIVE'));
    expect(mockGoLive).toHaveBeenCalled();
  });

  it('should scrub slider to jump frame', () => {
    const history = [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }];
    (useTimeFrame as any).mockReturnValue({
      history,
      isLive: false,
      currentTimeFrame: history[0],
      jumpToFrame: mockJumpToFrame,
    });
    render(<TimeControls />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1' } });

    expect(mockJumpToFrame).toHaveBeenCalledWith('f2');
  });

  it('should go live if scrubbed to end', () => {
    const history = [{ id: 'f1' }, { id: 'f2' }];
    (useTimeFrame as any).mockReturnValue({
      history,
      isLive: false,
      currentTimeFrame: history[0],
      jumpToFrame: mockJumpToFrame,
      goLive: mockGoLive,
    });
    render(<TimeControls />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1' } }); // Max index

    expect(mockGoLive).toHaveBeenCalled();
  });

  it('should handle documentId vs id', () => {
    // Test the logic: (f as any).documentId === ... || f.id === ...
    const history = [
      { documentId: 'doc1', id: 'legacy1' },
      { documentId: 'doc2', id: 'legacy2' },
    ];
    (useTimeFrame as any).mockReturnValue({
      history,
      isLive: false,
      currentTimeFrame: { documentId: 'doc2' },
      jumpToFrame: mockJumpToFrame,
    });
    render(<TimeControls />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('1'); // Index 1
  });

  it('should handle undefined history gracefully', () => {
    (useTimeFrame as any).mockReturnValue({
      history: undefined,
    });
    render(<TimeControls />);
    expect(screen.getByText('No History Available')).toBeInTheDocument();
  });
});
