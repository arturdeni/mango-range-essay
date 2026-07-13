import { render, screen } from '@testing-library/react';
import { RangeHandle } from './RangeHandle';

describe('RangeHandle', () => {
  const baseProps = {
    percent: 40,
    value: 34,
    min: 1,
    max: 100,
    label: 'Minimum value',
  };

  it('exposes the slider role with its aria value attributes', () => {
    render(<RangeHandle {...baseProps} />);

    const handle = screen.getByRole('slider', { name: 'Minimum value' });
    expect(handle).toHaveAttribute('aria-valuemin', '1');
    expect(handle).toHaveAttribute('aria-valuemax', '100');
    expect(handle).toHaveAttribute('aria-valuenow', '34');
  });

  it('is focusable via tabIndex', () => {
    render(<RangeHandle {...baseProps} />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '0');
  });

  it('positions itself with a left percentage', () => {
    render(<RangeHandle {...baseProps} />);
    expect(screen.getByRole('slider')).toHaveStyle({ left: '40%' });
  });

  it('has no dragging modifier by default', () => {
    render(<RangeHandle {...baseProps} />);
    const handle = screen.getByRole('slider');
    expect(handle).toHaveClass('range__handle');
    expect(handle).not.toHaveClass('range__handle--dragging');
  });

  it('applies the dragging modifier when isDragging is true', () => {
    render(<RangeHandle {...baseProps} isDragging />);
    expect(screen.getByRole('slider')).toHaveClass('range__handle--dragging');
  });
});
