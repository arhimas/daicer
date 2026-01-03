import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentToolPalette } from '../AgentToolPalette';

// Capture props passed to child
const mockToolbarProps = vi.fn();

vi.mock('@/components/chat/ChatActionToolbar', () => ({
  ChatActionToolbar: (props: any) => {
    mockToolbarProps(props);
    return (
      <div>
        <div data-testid="toolbar">Mock Toolbar</div>
        <button
          data-testid="trigger-cmd"
          onClick={() => props.onCommandSelect({ prefix: 'test_cmd', description: 'Test' })}
        >
          Trigger
        </button>
      </div>
    );
  },
}));

describe('AgentToolPalette', () => {
  const onCommand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the toolbar', () => {
    render(<AgentToolPalette onCommand={onCommand} activeEntity={undefined} activeLocation={null} roomEntities={[]} />);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('should propagate commands from toolbar', () => {
    render(<AgentToolPalette onCommand={onCommand} activeEntity={undefined} activeLocation={null} roomEntities={[]} />);
    fireEvent.click(screen.getByTestId('trigger-cmd'));
    expect(onCommand).toHaveBeenCalledWith('test_cmd');
  });

  it('should pass activeEntity prop correctly', () => {
    const entity = { id: 'e1', name: 'Orc' };
    render(<AgentToolPalette onCommand={onCommand} activeEntity={entity} activeLocation={null} roomEntities={[]} />);
    expect(mockToolbarProps).toHaveBeenCalledWith(
      expect.objectContaining({
        activeEntity: entity,
      })
    );
  });

  it('should pass activeLocation prop correctly', () => {
    const loc = { x: 1, y: 1, z: 1, label: 'Cell' };
    render(<AgentToolPalette onCommand={onCommand} activeEntity={undefined} activeLocation={loc} roomEntities={[]} />);
    expect(mockToolbarProps).toHaveBeenCalledWith(
      expect.objectContaining({
        activeLocation: loc,
      })
    );
  });

  it('should pass roomEntities prop correctly', () => {
    const entities = [{ id: '1' }];
    render(
      <AgentToolPalette onCommand={onCommand} activeEntity={undefined} activeLocation={null} roomEntities={entities} />
    );
    expect(mockToolbarProps).toHaveBeenCalledWith(
      expect.objectContaining({
        roomEntities: entities,
      })
    );
  });
});
