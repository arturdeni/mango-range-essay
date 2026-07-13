import type { KeyboardEventHandler, PointerEventHandler } from 'react';
import './Range.css';

interface RangeHandleProps {
  percent: number;
  value: number;
  min: number;
  max: number;
  label: string;
  isDragging?: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function RangeHandle({
  percent,
  value,
  min,
  max,
  label,
  isDragging = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
}: RangeHandleProps) {
  const className = isDragging ? 'range__handle range__handle--dragging' : 'range__handle';

  return (
    <div
      className={className}
      style={{ left: `${percent}%` }}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    />
  );
}
