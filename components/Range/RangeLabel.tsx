'use client';

import { useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import './Range.css';

interface RangeLabelProps {
  value: number;
  min: number;
  max: number;
  editable?: boolean;
  ariaLabel: string;
  onCommit: (value: number) => void;
}

export function RangeLabel({ value, min, max, editable = true, ariaLabel, onCommit }: RangeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Escape cancels an edit; the flag lets the shared blur handler know it must
  // discard the input instead of committing it.
  const cancelledRef = useRef(false);

  if (!editable) {
    return <span className="range__label">{value}</span>;
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        className="range__label"
        aria-label={ariaLabel}
        onClick={() => setIsEditing(true)}
      >
        {value}
      </button>
    );
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setIsEditing(false);
      return;
    }
    const raw = event.currentTarget.value.trim();
    const parsed = Number(raw);
    if (raw !== '' && !Number.isNaN(parsed)) {
      onCommit(parsed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      cancelledRef.current = true;
      event.currentTarget.blur();
    }
  }

  return (
    <input
      type="number"
      className="range__label range__label--input"
      aria-label={ariaLabel}
      min={min}
      max={max}
      defaultValue={value}
      autoFocus
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
