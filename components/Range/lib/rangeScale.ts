import {
  clampIndex,
  indexToPercent,
  nearestIndex,
  percentToIndex,
  percentToValue,
  snapToStep,
  valueToPercent,
} from './valueMath';

/**
 * Adapts a Range mode to the position coordinate the drag hook works in.
 * "Position" is a continuous value in `continuous` mode and an array index in
 * `stepped` mode; the hook stays agnostic and just clamps positions.
 */
export interface RangeScale {
  boundMin: number;
  boundMax: number;
  initialPositions: [number, number];
  /** Snapped position for a 0–100 track percentage (pointer → position). */
  valueFromPercent: (percent: number) => number;
  /** Track percentage for a position (position → render offset). */
  positionToPercent: (position: number) => number;
  /** Displayed value for a position (aria-valuenow / label text). */
  positionToValue: (position: number) => number;
  /** Position for a typed value (label edit → position). */
  valueToPosition: (value: number) => number;
  /** One keyboard step in position space (a value step, or one index). */
  positionStep: number;
  editable: boolean;
}

export function continuousScale(
  min: number,
  max: number,
  step: number,
  initialValues?: [number, number],
): RangeScale {
  return {
    boundMin: min,
    boundMax: max,
    initialPositions: initialValues ?? [min, max],
    valueFromPercent: (percent) => snapToStep(percentToValue(percent, min, max), step, min),
    positionToPercent: (value) => valueToPercent(value, min, max),
    positionToValue: (value) => value,
    valueToPosition: (value) => snapToStep(value, step, min),
    positionStep: step,
    editable: true,
  };
}

export function steppedScale(rangeValues: number[], initialValues?: [number, number]): RangeScale {
  const length = rangeValues.length;
  const toIndex = (value: number) => nearestIndex(value, rangeValues);
  const valueAt = (index: number) => rangeValues[clampIndex(index, length)] ?? rangeValues[0] ?? 0;

  return {
    boundMin: 0,
    boundMax: Math.max(0, length - 1),
    initialPositions: initialValues
      ? [toIndex(initialValues[0]), toIndex(initialValues[1])]
      : [0, Math.max(0, length - 1)],
    valueFromPercent: (percent) => percentToIndex(percent, length),
    positionToPercent: (index) => indexToPercent(index, length),
    positionToValue: valueAt,
    valueToPosition: toIndex,
    positionStep: 1,
    editable: false,
  };
}
