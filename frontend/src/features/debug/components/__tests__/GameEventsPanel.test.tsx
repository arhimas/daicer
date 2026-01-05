import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventsPanel } from '../GameEventsPanel';
import type { GameEvent } from '@/types/contracts';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('GameEventsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state', () => {
    render(<GameEventsPanel events={[]} />);
    expect(screen.getByText('No events received...')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Count
  });

  it('should render a single event', () => {
    const event: GameEvent = {
      id: 'e1',
      type: 'ATTACK',
      timestamp: Date.now(),
      payload: { target: 'goblin' },
    };
    render(<GameEventsPanel events={[event]} />);
    expect(screen.getByText('ATTACK')).toBeInTheDocument();
    expect(screen.getByText(/"target": "goblin"/)).toBeInTheDocument();
  });

  it('should render error events with red styling', () => {
    const errorEvent: GameEvent = {
      id: 'e2',
      type: 'ERROR',
      timestamp: Date.now(),
      payload: { message: 'Boom' },
    };
    const { container } = render(<GameEventsPanel events={[errorEvent]} />);

    const typeLabel = screen.getByText('ERROR');
    expect(typeLabel).toHaveClass('text-red-400');

    // Check container border/bg via class check on parent
    // The parent of typeLabel's parent
    // Structure: div.rounded > div.flex > span.type
    // Implementation:
    // <div className={clsx(..., isError ? 'bg-red-900/20 ...' : ...)}>
    //   <div><span>Type</span></div>
    // </div>
    const card = typeLabel.closest('div.rounded.border');
    expect(card).toHaveClass('bg-red-900/20');
    expect(card).toHaveClass('border-red-500/50');
  });

  it('should render normal events with blue/slate styling', () => {
    const event: GameEvent = {
      id: 'e3',
      type: 'MOVE',
      timestamp: Date.now(),
      payload: {},
    };
    render(<GameEventsPanel events={[event]} />);
    const typeLabel = screen.getByText('MOVE');
    expect(typeLabel).toHaveClass('text-aurora-400');

    const card = typeLabel.closest('div.rounded.border');
    expect(card).toHaveClass('bg-midnight-900');
  });

  it('should render payload string directly', () => {
    const event: GameEvent = {
      id: 'e4',
      type: 'LOG',
      timestamp: Date.now(),
      payload: 'Simple string message',
    };
    render(<GameEventsPanel events={[event]} />);
    expect(screen.getByText('Simple string message')).toBeInTheDocument();
  });

  it('should scroll to bottom on new events', () => {
    const event: GameEvent = { id: 'e1', type: 'A', timestamp: 0, payload: '' };
    const { rerender } = render(<GameEventsPanel events={[event]} />);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1);

    const event2 = { id: 'e2', type: 'B', timestamp: 0, payload: '' };
    rerender(<GameEventsPanel events={[event, event2]} />);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('should handle complex nested payload', () => {
    const event: GameEvent = {
      id: 'e5',
      type: 'COMPLEX',
      timestamp: 0,
      payload: { a: { b: { c: [1, 2, 3] } } },
    };
    render(<GameEventsPanel events={[event]} />);
    expect(screen.getByText(/"c": \[\s+1,\s+2,\s+3\s+\]/)).toBeInTheDocument();
  });

  // Cardinality / Performance Check (simulated)
  it('should render 50 events without crashing', () => {
    const events = Array.from({ length: 50 }, (_, i) => ({
      id: `e-${i}`,
      type: 'STRESS',
      timestamp: Date.now(),
      payload: `Event ${i}`,
    }));
    render(<GameEventsPanel events={events} />);
    expect(screen.getByText('50')).toBeInTheDocument(); // Count
    expect(screen.getAllByText('STRESS')).toHaveLength(50);
  });

  it('should identify errors in payload.error', () => {
    const event: GameEvent = {
      id: 'e6',
      type: 'TOOL_Result',
      timestamp: 0,
      payload: { error: 'Something wrong' },
    };
    render(<GameEventsPanel events={[event]} />);
    const typeLabel = screen.getByText('TOOL_Result');
    expect(typeLabel).toHaveClass('text-red-400');
  });

  it('should format timestamp', () => {
    const ts = new Date('2023-01-01T12:00:00Z').getTime();
    const event: GameEvent = { id: 'e7', type: 'TIME', timestamp: ts, payload: '' };
    render(<GameEventsPanel events={[event]} />);
    // Locale time string depends on system, but assuming it renders SOMETHING
    // regex for time format? or just check class presence
    const timeLabel = screen.getByText(/\d+:\d+/);
    expect(timeLabel).toBeInTheDocument();
  });
});
