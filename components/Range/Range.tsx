'use client';

import { RangeTrack } from './RangeTrack';
import { RangeHandle } from './RangeHandle';
import { RangeLabel } from './RangeLabel';
import { useRangeDrag } from './hooks/useRangeDrag';
import { useRangeKeyboard } from './hooks/useRangeKeyboard';
import { continuousScale, steppedScale, type RangeScale } from './lib/rangeScale';
import './Range.css';

interface ContinuousRangeProps {
  mode?: 'continuous';
  min: number;
  max: number;
  step?: number;
  initialValues?: [number, number];
  editableLabels?: boolean;
}

interface SteppedRangeProps {
  mode: 'stepped';
  rangeValues: number[];
  initialValues?: [number, number];
  editableLabels?: boolean;
}

type RangeProps = ContinuousRangeProps | SteppedRangeProps;

function buildScale(props: RangeProps): RangeScale {
  if (props.mode === 'stepped') {
    return steppedScale(props.rangeValues, props.initialValues);
  }
  return continuousScale(props.min, props.max, props.step ?? 1, props.initialValues);
}

export function Range(props: RangeProps) {
  const scale = buildScale(props);
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
        ariaLabel="Minimum value"
        onCommit={(next) => setValue('min', scale.valueToPosition(next))}
      />
      <RangeTrack ref={trackRef} fillStartPercent={minPercent} fillEndPercent={maxPercent}>
        <RangeHandle
          percent={minPercent}
          value={minDisplay}
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
        ariaLabel="Maximum value"
        onCommit={(next) => setValue('max', scale.valueToPosition(next))}
      />
    </div>
  );
}
