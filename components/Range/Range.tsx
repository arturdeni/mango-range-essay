'use client';

import { useMemo } from 'react';
import { RangeTrack } from './RangeTrack';
import { RangeHandle } from './RangeHandle';
import { RangeLabel } from './RangeLabel';
import { useRangeDrag } from './hooks/useRangeDrag';
import { useRangeKeyboard } from './hooks/useRangeKeyboard';
import { continuousScale, steppedScale, type RangeScale } from './lib/rangeScale';
import './Range.css';

/** Turns a numeric value into its display string (e.g. `(v) => `${v}€``). */
type FormatValue = (value: number) => string;

interface ContinuousRangeProps {
  mode?: 'continuous';
  min: number;
  max: number;
  step?: number;
  initialValues?: [number, number];
  editableLabels?: boolean;
  formatValue?: FormatValue;
}

interface SteppedRangeProps {
  mode: 'stepped';
  rangeValues: number[];
  initialValues?: [number, number];
  editableLabels?: boolean;
  formatValue?: FormatValue;
}

type RangeProps = ContinuousRangeProps | SteppedRangeProps;

export function Range(props: RangeProps) {
  const { initialValues, formatValue } = props;
  // Pull the discriminated fields out so the memo closes over primitives (and
  // stable references) only — the raw `props` object is a new identity each
  // render and would defeat the memo.
  const mode = props.mode ?? 'continuous';
  const rangeValues = props.mode === 'stepped' ? props.rangeValues : undefined;
  const min = props.mode === 'stepped' ? undefined : props.min;
  const max = props.mode === 'stepped' ? undefined : props.max;
  const step = props.mode === 'stepped' ? undefined : props.step;

  const scale = useMemo<RangeScale>(() => {
    if (mode === 'stepped') {
      return steppedScale(rangeValues ?? [], initialValues);
    }
    return continuousScale(min ?? 0, max ?? 0, step ?? 1, initialValues);
  }, [mode, rangeValues, min, max, step, initialValues]);

  const editableLabels = props.editableLabels ?? scale.editable;

  const { trackRef, minValue, maxValue, activeHandle, getHandleProps, setValue } = useRangeDrag({
    min: scale.boundMin,
    max: scale.boundMax,
    initialValues: scale.initialPositions,
    valueFromPercent: scale.valueFromPercent,
  });

  const { getKeyDownHandler } = useRangeKeyboard({
    min: scale.boundMin,
    max: scale.boundMax,
    minValue,
    maxValue,
    step: scale.positionStep,
    setValue,
  });

  const minPercent = scale.positionToPercent(minValue);
  const maxPercent = scale.positionToPercent(maxValue);
  const minDisplay = scale.positionToValue(minValue);
  const maxDisplay = scale.positionToValue(maxValue);
  const lowerBound = scale.positionToValue(scale.boundMin);
  const upperBound = scale.positionToValue(scale.boundMax);

  return (
    <div className="range">
      <RangeLabel
        value={minDisplay}
        min={lowerBound}
        max={maxDisplay}
        editable={editableLabels}
        format={formatValue}
        ariaLabel="Minimum value"
        onCommit={(next) => setValue('min', scale.valueToPosition(next))}
      />
      <RangeTrack ref={trackRef} fillStartPercent={minPercent} fillEndPercent={maxPercent}>
        <RangeHandle
          percent={minPercent}
          value={minDisplay}
          valueText={formatValue?.(minDisplay)}
          min={lowerBound}
          max={maxDisplay}
          label="Minimum value"
          isDragging={activeHandle === 'min'}
          onKeyDown={getKeyDownHandler('min')}
          {...getHandleProps('min')}
        />
        <RangeHandle
          percent={maxPercent}
          value={maxDisplay}
          valueText={formatValue?.(maxDisplay)}
          min={minDisplay}
          max={upperBound}
          label="Maximum value"
          isDragging={activeHandle === 'max'}
          onKeyDown={getKeyDownHandler('max')}
          {...getHandleProps('max')}
        />
      </RangeTrack>
      <RangeLabel
        value={maxDisplay}
        min={minDisplay}
        max={upperBound}
        editable={editableLabels}
        format={formatValue}
        ariaLabel="Maximum value"
        onCommit={(next) => setValue('max', scale.valueToPosition(next))}
      />
    </div>
  );
}
