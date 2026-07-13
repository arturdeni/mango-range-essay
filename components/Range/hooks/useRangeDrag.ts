'use client';

import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { clamp } from '../lib/valueMath';

export type HandleId = 'min' | 'max';

interface UseRangeDragOptions {
  /** Lower bound of the position coordinate (a value in continuous mode, an index in stepped mode). */
  min: number;
  /** Upper bound of the position coordinate. */
  max: number;
  initialValues: [number, number];
  /** Converts a 0–100 track percentage into a snapped position on the active scale. */
  valueFromPercent: (percent: number) => number;
  onChange?: (values: [number, number]) => void;
}

interface HandlePointerProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
}

interface UseRangeDragResult {
  trackRef: RefObject<HTMLDivElement | null>;
  minValue: number;
  maxValue: number;
  activeHandle: HandleId | null;
  getHandleProps: (handle: HandleId) => HandlePointerProps;
  setValue: (handle: HandleId, value: number) => void;
}

interface Values {
  minValue: number;
  maxValue: number;
}

export function useRangeDrag({
  min,
  max,
  initialValues,
  valueFromPercent,
  onChange,
}: UseRangeDragOptions): UseRangeDragResult {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HandleId | null>(null);
  const [activeHandle, setActiveHandle] = useState<HandleId | null>(null);

  const [values, setValues] = useState<Values>({
    minValue: initialValues[0],
    maxValue: initialValues[1],
  });
  // Mirror of `values` read synchronously across a rapid pointermove burst so
  // successive moves clamp against the freshest value, not a stale render.
  const valuesRef = useRef<Values>(values);

  function commit(next: Values) {
    const prev = valuesRef.current;
    if (next.minValue === prev.minValue && next.maxValue === prev.maxValue) return;
    valuesRef.current = next;
    setValues(next);
    onChange?.([next.minValue, next.maxValue]);
  }

  function applyValue(handle: HandleId, value: number) {
    const prev = valuesRef.current;
    if (handle === 'min') {
      commit({ minValue: clamp(value, min, prev.maxValue), maxValue: prev.maxValue });
    } else {
      commit({ minValue: prev.minValue, maxValue: clamp(value, prev.minValue, max) });
    }
  }

  function clientXToPercent(clientX: number): number | null {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return null;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function moveHandle(handle: HandleId, clientX: number) {
    const percent = clientXToPercent(clientX);
    if (percent === null) return;
    applyValue(handle, valueFromPercent(percent));
  }

  function getHandleProps(handle: HandleId): HandlePointerProps {
    return {
      onPointerDown(event) {
        const el = event.currentTarget;
        if (typeof el.setPointerCapture === 'function' && event.pointerId != null) {
          el.setPointerCapture(event.pointerId);
        }
        activeRef.current = handle;
        setActiveHandle(handle);
        moveHandle(handle, event.clientX);
      },
      onPointerMove(event) {
        if (activeRef.current !== handle) return;
        moveHandle(handle, event.clientX);
      },
      onPointerUp(event) {
        const el = event.currentTarget;
        if (
          typeof el.releasePointerCapture === 'function' &&
          event.pointerId != null &&
          el.hasPointerCapture?.(event.pointerId)
        ) {
          el.releasePointerCapture(event.pointerId);
        }
        activeRef.current = null;
        setActiveHandle(null);
      },
    };
  }

  return {
    trackRef,
    minValue: values.minValue,
    maxValue: values.maxValue,
    activeHandle,
    getHandleProps,
    setValue: applyValue,
  };
}
