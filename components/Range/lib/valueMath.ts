/**
 * Pure value/geometry helpers for the Range component.
 *
 * No React, no DOM: everything here is a deterministic function so it can be
 * unit-tested in isolation. Two families of helpers live here:
 *
 * - Continuous mode  → value ↔ percent mapping over a [min, max] interval,
 *   plus discrete stepping (Exercise 1 uses step = 1).
 * - Stepped mode     → a fixed array of values laid out at *equal* visual
 *   intervals (index-based), independent of their numeric magnitude
 *   (Exercise 2).
 *
 * Non-crossing of the two handles is expressed with `clamp`: the lower handle
 * is clamped to [min, otherValue] and the upper handle to [otherValue, max].
 */

/** Restrict `value` to the inclusive [min, max] interval. */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    // Defensive: callers shouldn't pass an inverted interval, but if they do
    // we honour `min` as the binding bound rather than returning NaN-ish junk.
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/* -------------------------------------------------------------------------- */
/* Continuous mode                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Map a value within [min, max] to a 0–100 percentage along the track.
 * The result is clamped to [0, 100]; a degenerate interval (min === max)
 * maps everything to 0 to avoid a division by zero.
 */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const percent = ((value - min) / (max - min)) * 100;
  return clamp(percent, 0, 100);
}

/**
 * Inverse of {@link valueToPercent}: map a 0–100 percentage back to a value
 * within [min, max]. The percentage is clamped first so out-of-range pointer
 * positions can't produce out-of-range values.
 */
export function percentToValue(percent: number, min: number, max: number): number {
  const bounded = clamp(percent, 0, 100);
  return min + (bounded / 100) * (max - min);
}

/**
 * Snap `value` to the nearest multiple of `step`, measured from `min`.
 * A non-positive `step` disables snapping (the value is returned unchanged),
 * which lets callers opt into fully continuous behaviour.
 *
 * @example snapToStep(33.6, 1, 1) // → 34
 */
export function snapToStep(value: number, step: number, min: number): number {
  if (step <= 0) return value;
  return Math.round((value - min) / step) * step + min;
}

/* -------------------------------------------------------------------------- */
/* Stepped mode (fixed values, equal visual spacing)                          */
/* -------------------------------------------------------------------------- */

/** Restrict an array index to [0, length - 1]. */
export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return clamp(Math.round(index), 0, length - 1);
}

/**
 * Position of the value at `index` as a 0–100 percentage, assuming all
 * `length` stops are spread at equal intervals (0%, …, 100%). A single-stop
 * range collapses to 0%.
 */
export function indexToPercent(index: number, length: number): number {
  if (length <= 1) return 0;
  const clamped = clampIndex(index, length);
  return (clamped / (length - 1)) * 100;
}

/**
 * Inverse of {@link indexToPercent}: which equally-spaced stop a 0–100
 * percentage lands on. Rounds to the nearest stop and clamps to a valid index.
 */
export function percentToIndex(percent: number, length: number): number {
  if (length <= 1) return 0;
  const bounded = clamp(percent, 0, 100);
  return clampIndex(Math.round((bounded / 100) * (length - 1)), length);
}

/**
 * Index of the array entry whose value is numerically closest to `value`.
 * Ties resolve to the lower index. Returns 0 for an empty array.
 */
export function nearestIndex(value: number, values: readonly number[]): number {
  if (values.length === 0) return 0;
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < values.length; i++) {
    const candidate = values[i];
    if (candidate === undefined) continue;
    const distance = Math.abs(candidate - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}
