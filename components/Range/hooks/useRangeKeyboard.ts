import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { HandleId } from './useRangeDrag';

interface UseRangeKeyboardOptions {
  /** Lower bound of the position coordinate. */
  min: number;
  /** Upper bound of the position coordinate. */
  max: number;
  minValue: number;
  maxValue: number;
  /** One keyboard step in position space (value step, or one index). */
  step: number;
  setValue: (handle: HandleId, value: number) => void;
}

interface UseRangeKeyboardResult {
  getKeyDownHandler: (handle: HandleId) => (event: ReactKeyboardEvent<HTMLElement>) => void;
}

export function useRangeKeyboard({
  min,
  max,
  minValue,
  maxValue,
  step,
  setValue,
}: UseRangeKeyboardOptions): UseRangeKeyboardResult {
  function getKeyDownHandler(handle: HandleId) {
    return (event: ReactKeyboardEvent<HTMLElement>) => {
      const current = handle === 'min' ? minValue : maxValue;
      let next: number;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - step;
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }

      // Stop the arrow keys / Home / End from scrolling the page.
      event.preventDefault();
      // setValue clamps to the bounds and against the other handle (no-cross).
      setValue(handle, next);
    };
  }

  return { getKeyDownHandler };
}
