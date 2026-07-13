import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Range } from './Range';

// jsdom lacks a PointerEvent that carries clientX, so dispatch a real
// MouseEvent under a pointer* type — React reads clientX from the native event.
function firePointer(el: Element, type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: 1, configurable: true });
  fireEvent(el, event);
}

function mockTrackRect(container: HTMLElement, width = 100, left = 0) {
  const track = container.querySelector('.range__track') as HTMLElement;
  track.getBoundingClientRect = () =>
    ({ left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON() {} }) as DOMRect;
}

describe('Range (continuous)', () => {
  it('renders two sliders seeded from initial values', () => {
    render(<Range min={1} max={100} initialValues={[1, 100]} />);

    const min = screen.getByRole('slider', { name: 'Minimum value' });
    const max = screen.getByRole('slider', { name: 'Maximum value' });
    expect(min).toHaveAttribute('aria-valuenow', '1');
    expect(max).toHaveAttribute('aria-valuenow', '100');
  });

  it('updates the dragged handle value and toggles the dragging state', () => {
    const { container } = render(<Range min={1} max={100} initialValues={[1, 100]} />);
    mockTrackRect(container);

    const min = screen.getByRole('slider', { name: 'Minimum value' });

    firePointer(min, 'pointerdown', 1);
    expect(min).toHaveClass('range__handle--dragging');

    firePointer(min, 'pointermove', 60);
    expect(min).toHaveAttribute('aria-valuenow', '60');

    firePointer(min, 'pointerup', 60);
    expect(min).not.toHaveClass('range__handle--dragging');
  });

  it('keeps the handles from crossing', () => {
    const { container } = render(<Range min={1} max={100} initialValues={[1, 100]} />);
    mockTrackRect(container);

    const min = screen.getByRole('slider', { name: 'Minimum value' });

    firePointer(min, 'pointerdown', 1);
    firePointer(min, 'pointermove', 200);

    expect(min).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute('aria-valuenow', '100');
  });
});

describe('Range editable labels', () => {
  async function editLabel(name: string, text: string, confirm: '{Enter}' | 'blur') {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name }));
    const input = screen.getByRole('spinbutton', { name });
    await user.clear(input);
    await user.type(input, text);
    if (confirm === '{Enter}') {
      await user.keyboard('{Enter}');
    } else {
      fireEvent.blur(input);
    }
    return user;
  }

  it('enters edit mode on click and commits a new value with Enter', async () => {
    render(<Range min={1} max={100} initialValues={[20, 80]} />);

    await editLabel('Minimum value', '40', '{Enter}');

    expect(screen.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute('aria-valuenow', '40');
    // back to a button (edit mode exited)
    expect(screen.getByRole('button', { name: 'Minimum value' })).toHaveTextContent('40');
  });

  it('commits on blur as well as Enter', async () => {
    render(<Range min={1} max={100} initialValues={[20, 80]} />);

    await editLabel('Maximum value', '65', 'blur');

    expect(screen.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute('aria-valuenow', '65');
  });

  it('cancels with Escape without applying the typed value', async () => {
    const user = userEvent.setup();
    render(<Range min={1} max={100} initialValues={[20, 80]} />);

    await user.click(screen.getByRole('button', { name: 'Minimum value' }));
    const input = screen.getByRole('spinbutton', { name: 'Minimum value' });
    await user.clear(input);
    await user.type(input, '55');
    await user.keyboard('{Escape}');

    expect(screen.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute('aria-valuenow', '20');
  });

  it('clamps an out-of-range value to the bounds', async () => {
    render(<Range min={1} max={100} initialValues={[20, 80]} />);

    await editLabel('Minimum value', '-30', '{Enter}');

    expect(screen.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('prevents a label edit from crossing the other handle', async () => {
    render(<Range min={1} max={100} initialValues={[20, 80]} />);

    // try to push min past max (80)
    await editLabel('Minimum value', '95', '{Enter}');

    expect(screen.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute('aria-valuenow', '80');
    expect(screen.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute('aria-valuenow', '80');
  });

  it('renders non-editable labels as plain text when editableLabels is false', () => {
    render(<Range min={1} max={100} initialValues={[20, 80]} editableLabels={false} />);

    expect(screen.queryByRole('button', { name: 'Minimum value' })).not.toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});

describe('Range (stepped)', () => {
  const rangeValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

  it('seeds the handles at the first and last fixed values', () => {
    render(<Range mode="stepped" rangeValues={rangeValues} />);

    expect(screen.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute('aria-valuenow', '1.99');
    expect(screen.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute('aria-valuenow', '70.99');
  });

  it('snaps a drag to the nearest fixed value', () => {
    const { container } = render(<Range mode="stepped" rangeValues={rangeValues} />);
    mockTrackRect(container);

    const min = screen.getByRole('slider', { name: 'Minimum value' });

    // 6 stops → notches at 0/20/40/60/80/100%; clientX 42 → index 2 → 10.99
    firePointer(min, 'pointerdown', 42);
    firePointer(min, 'pointermove', 42);

    expect(min).toHaveAttribute('aria-valuenow', '10.99');
    expect(screen.getByText('10.99')).toBeInTheDocument();
  });

  it('keeps the stepped handles from crossing', () => {
    const { container } = render(<Range mode="stepped" rangeValues={rangeValues} />);
    mockTrackRect(container);

    const min = screen.getByRole('slider', { name: 'Minimum value' });

    firePointer(min, 'pointerdown', 42);
    firePointer(min, 'pointermove', 300); // drag past the max handle

    expect(min).toHaveAttribute('aria-valuenow', '70.99');
    expect(screen.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute('aria-valuenow', '70.99');
  });

  it('renders non-editable, non-clickable text labels', () => {
    render(<Range mode="stepped" rangeValues={rangeValues} />);

    expect(screen.queryByRole('button', { name: 'Minimum value' })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('1.99')).toBeInTheDocument();
    expect(screen.getByText('70.99')).toBeInTheDocument();
  });
});

describe('Range accessibility & keyboard (continuous)', () => {
  function renderRange() {
    render(<Range min={1} max={100} initialValues={[20, 80]} />);
    return {
      min: screen.getByRole('slider', { name: 'Minimum value' }),
      max: screen.getByRole('slider', { name: 'Maximum value' }),
    };
  }

  it('exposes horizontal sliders with the expected aria attributes', () => {
    const { min } = renderRange();
    expect(min).toHaveAttribute('aria-orientation', 'horizontal');
    expect(min).toHaveAttribute('aria-valuemin', '1');
    expect(min).toHaveAttribute('aria-valuemax', '80'); // capped at the other handle
    expect(min).toHaveAttribute('aria-valuenow', '20');
    expect(min).toHaveAttribute('tabindex', '0');
  });

  it('moves one step with ArrowRight/ArrowLeft and ArrowUp/ArrowDown', () => {
    const { min } = renderRange();

    fireEvent.keyDown(min, { key: 'ArrowRight' });
    expect(min).toHaveAttribute('aria-valuenow', '21');

    fireEvent.keyDown(min, { key: 'ArrowLeft' });
    expect(min).toHaveAttribute('aria-valuenow', '20');

    fireEvent.keyDown(min, { key: 'ArrowUp' });
    expect(min).toHaveAttribute('aria-valuenow', '21');

    fireEvent.keyDown(min, { key: 'ArrowDown' });
    expect(min).toHaveAttribute('aria-valuenow', '20');
  });

  it('jumps to the bounds with Home/End', () => {
    const { min, max } = renderRange();

    fireEvent.keyDown(min, { key: 'Home' });
    expect(min).toHaveAttribute('aria-valuenow', '1');

    fireEvent.keyDown(max, { key: 'End' });
    expect(max).toHaveAttribute('aria-valuenow', '100');
  });

  it('does not let keyboard moves cross the other handle', () => {
    const { min, max } = renderRange();

    // End on the min handle is capped at the max handle (80)
    fireEvent.keyDown(min, { key: 'End' });
    expect(min).toHaveAttribute('aria-valuenow', '80');

    // Home on the max handle is capped at the min handle (now 80)
    fireEvent.keyDown(max, { key: 'Home' });
    expect(max).toHaveAttribute('aria-valuenow', '80');
  });
});

describe('Range accessibility & keyboard (stepped)', () => {
  const rangeValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

  it('moves one fixed value per arrow key press', () => {
    render(<Range mode="stepped" rangeValues={rangeValues} />);
    const min = screen.getByRole('slider', { name: 'Minimum value' });

    fireEvent.keyDown(min, { key: 'ArrowRight' });
    expect(min).toHaveAttribute('aria-valuenow', '5.99');

    fireEvent.keyDown(min, { key: 'ArrowRight' });
    expect(min).toHaveAttribute('aria-valuenow', '10.99');

    fireEvent.keyDown(min, { key: 'ArrowLeft' });
    expect(min).toHaveAttribute('aria-valuenow', '5.99');
  });

  it('clamps at the first fixed value with ArrowLeft', () => {
    render(<Range mode="stepped" rangeValues={rangeValues} />);
    const min = screen.getByRole('slider', { name: 'Minimum value' });

    fireEvent.keyDown(min, { key: 'ArrowLeft' });
    expect(min).toHaveAttribute('aria-valuenow', '1.99');
  });

  it('honours Home/End and no-cross across fixed values', () => {
    render(<Range mode="stepped" rangeValues={rangeValues} />);
    const min = screen.getByRole('slider', { name: 'Minimum value' });
    const max = screen.getByRole('slider', { name: 'Maximum value' });

    // End on min is capped at max (70.99)
    fireEvent.keyDown(min, { key: 'End' });
    expect(min).toHaveAttribute('aria-valuenow', '70.99');

    // Home on max is capped at min (now 70.99)
    fireEvent.keyDown(max, { key: 'Home' });
    expect(max).toHaveAttribute('aria-valuenow', '70.99');
  });
});
