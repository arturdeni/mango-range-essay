import type { ReactNode, Ref } from 'react';
import './Range.css';

interface RangeTrackProps {
  fillStartPercent: number;
  fillEndPercent: number;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function RangeTrack({ fillStartPercent, fillEndPercent, children, ref }: RangeTrackProps) {
  const left = Math.min(fillStartPercent, fillEndPercent);
  const width = Math.abs(fillEndPercent - fillStartPercent);

  return (
    <div className="range__track" ref={ref}>
      <div className="range__fill" style={{ left: `${left}%`, width: `${width}%` }} />
      {children}
    </div>
  );
}
