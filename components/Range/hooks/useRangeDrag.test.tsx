import { fireEvent, render, screen } from '@testing-library/react';
import { useRangeDrag } from './useRangeDrag';
import { percentToValue, snapToStep } from '../lib/valueMath';

// Continuous scale over [1, 100] with integer steps, matching Exercise 1.
const valueFromPercent = (percent: number) => snapToStep(percentToValue(percent, 1, 100), 1, 1);

// jsdom lacks a PointerEvent that carries clientX, so dispatch a real
// MouseEvent under a pointer* type — React reads clientX from the native event.
function firePointer(el: Element, type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: 1, configurable: true });
  fireEvent(el, event);
}

function Harness({
  onChange,
  initialValues = [1, 100],
}: {
  onChange?: (values: [number, number]) => void;
  initialValues?: [number, number];
}) {
  const { trackRef, minValue, maxValue, activeHandle, getHandleProps } = useRangeDrag({
    min: 1,
    max: 100,
    initialValues,
    valueFromPercent,
    onChange,
  });

  return (
    <div>
      <div data-testid="track" ref={trackRef} />
      <div data-testid="min-handle" {...getHandleProps('min')} />
      <div data-testid="max-handle" {...getHandleProps('max')} />
      <output data-testid="min-value">{minValue}</output>
      <output data-testid="max-value">{maxValue}</output>
      <output data-testid="active">{activeHandle ?? 'none'}</output>
    </div>
  );
}

// jsdom gives every element a zero-sized rect; fake a 100px-wide track so a
// clientX maps 1:1 to a percentage.
function mockTrackRect(width = 100, left = 0) {
  const track = screen.getByTestId('track');
  track.getBoundingClientRect = () =>
    ({ left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON() {} }) as DOMRect;
  return track;
}

describe('useRangeDrag', () => {
  it('marks a handle active on pointer down and clears it on pointer up', () => {
    render(<Harness />);
    mockTrackRect();
    const minHandle = screen.getByTestId('min-handle');

    firePointer(minHandle, 'pointerdown', 1);
    expect(screen.getByTestId('active')).toHaveTextContent('min');

    firePointer(minHandle, 'pointerup', 1);
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });

  it('translates pointer X into a snapped value while dragging', () => {
    render(<Harness />);
    mockTrackRect();
    const minHandle = screen.getByTestId('min-handle');

    firePointer(minHandle, 'pointerdown', 1);
    firePointer(minHandle, 'pointermove', 60);

    // percent 60 → percentToValue(60,1,100)=60.4 → snapToStep step 1 → 60
    expect(screen.getByTestId('min-value')).toHaveTextContent('60');
    expect(screen.getByTestId('max-value')).toHaveTextContent('100');
  });

  it('ignores pointer move when the handle is not active', () => {
    render(<Harness />);
    mockTrackRect();
    const minHandle = screen.getByTestId('min-handle');

    firePointer(minHandle, 'pointermove', 60);

    expect(screen.getByTestId('min-value')).toHaveTextContent('1');
  });

  it('prevents the min handle from crossing the max handle', () => {
    render(<Harness />);
    mockTrackRect();
    const minHandle = screen.getByTestId('min-handle');

    firePointer(minHandle, 'pointerdown', 1);
    firePointer(minHandle, 'pointermove', 200);

    // clamped to the current max value (100), handles may meet but not cross
    expect(screen.getByTestId('min-value')).toHaveTextContent('100');
    expect(screen.getByTestId('max-value')).toHaveTextContent('100');
  });

  it('prevents the max handle from crossing the min handle', () => {
    render(<Harness />);
    mockTrackRect();
    const maxHandle = screen.getByTestId('max-handle');

    firePointer(maxHandle, 'pointerdown', 100);
    firePointer(maxHandle, 'pointermove', -50);

    // min stays at its initial value (1), max clamped down to it
    expect(screen.getByTestId('max-value')).toHaveTextContent('1');
    expect(screen.getByTestId('min-value')).toHaveTextContent('1');
  });

  it('reopens the range from the max bound by dragging the buried min handle left', () => {
    // Both handles sit on the max bound. The top ('max') handle receives the
    // click, but a leftward first move must grab the buried min handle.
    render(<Harness initialValues={[100, 100]} />);
    mockTrackRect();
    const maxHandle = screen.getByTestId('max-handle');

    firePointer(maxHandle, 'pointerdown', 100);
    firePointer(maxHandle, 'pointermove', 40);

    expect(screen.getByTestId('active')).toHaveTextContent('min');
    expect(Number(screen.getByTestId('min-value').textContent)).toBeLessThan(100);
    expect(screen.getByTestId('max-value')).toHaveTextContent('100');
  });

  it('reopens the range from the min bound by dragging the max handle right', () => {
    render(<Harness initialValues={[1, 1]} />);
    mockTrackRect();
    const maxHandle = screen.getByTestId('max-handle');

    firePointer(maxHandle, 'pointerdown', 1);
    firePointer(maxHandle, 'pointermove', 60);

    expect(screen.getByTestId('active')).toHaveTextContent('max');
    expect(screen.getByTestId('min-value')).toHaveTextContent('1');
    expect(Number(screen.getByTestId('max-value').textContent)).toBeGreaterThan(1);
  });

  it('reports value changes through onChange', () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    mockTrackRect();
    const minHandle = screen.getByTestId('min-handle');

    firePointer(minHandle, 'pointerdown', 1);
    firePointer(minHandle, 'pointermove', 60);

    expect(onChange).toHaveBeenLastCalledWith([60, 100]);
  });
});
