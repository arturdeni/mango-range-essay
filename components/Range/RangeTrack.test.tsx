import { render, screen } from '@testing-library/react';
import { RangeTrack } from './RangeTrack';

describe('RangeTrack', () => {
  it('positions the active fill between the two percentages', () => {
    const { container } = render(<RangeTrack fillStartPercent={20} fillEndPercent={70} />);

    const fill = container.querySelector('.range__fill');
    expect(fill).toHaveStyle({ left: '20%', width: '50%' });
  });

  it('normalises reversed percentages into a positive width', () => {
    const { container } = render(<RangeTrack fillStartPercent={70} fillEndPercent={20} />);

    const fill = container.querySelector('.range__fill');
    expect(fill).toHaveStyle({ left: '20%', width: '50%' });
  });

  it('renders handle children inside the track', () => {
    render(
      <RangeTrack fillStartPercent={0} fillEndPercent={100}>
        <button type="button">handle</button>
      </RangeTrack>,
    );

    expect(screen.getByRole('button', { name: 'handle' })).toBeInTheDocument();
  });
});
