import {
  clamp,
  valueToPercent,
  percentToValue,
  snapToStep,
  clampIndex,
  indexToPercent,
  percentToIndex,
  nearestIndex,
} from './valueMath';

describe('clamp', () => {
  it('returns the value when inside the interval', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('clamps to the lower bound', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('clamps to the upper bound', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('returns the bounds themselves unchanged', () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });

  it('falls back to min when the interval is inverted', () => {
    expect(clamp(50, 100, 0)).toBe(100);
  });

  // Non-crossing of the two handles is expressed through clamp: each handle is
  // clamped against the other's current value.
  describe('handle non-crossing', () => {
    it('prevents the lower handle from passing the upper one', () => {
      const upperValue = 60;
      expect(clamp(80, 1, upperValue)).toBe(60);
    });

    it('prevents the upper handle from passing the lower one', () => {
      const lowerValue = 40;
      expect(clamp(20, lowerValue, 100)).toBe(40);
    });

    it('allows the handles to meet at the same value', () => {
      expect(clamp(50, 1, 50)).toBe(50);
    });
  });
});

describe('valueToPercent', () => {
  it('maps min to 0% and max to 100%', () => {
    expect(valueToPercent(1, 1, 100)).toBe(0);
    expect(valueToPercent(100, 1, 100)).toBe(100);
  });

  it('maps the midpoint to 50%', () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
  });

  it('clamps out-of-range values into [0, 100]', () => {
    expect(valueToPercent(-20, 0, 100)).toBe(0);
    expect(valueToPercent(120, 0, 100)).toBe(100);
  });

  it('returns 0 for a degenerate interval instead of NaN', () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
  });
});

describe('percentToValue', () => {
  it('maps 0% to min and 100% to max', () => {
    expect(percentToValue(0, 1, 100)).toBe(1);
    expect(percentToValue(100, 1, 100)).toBe(100);
  });

  it('maps 50% to the midpoint', () => {
    expect(percentToValue(50, 0, 100)).toBe(50);
  });

  it('clamps out-of-range percentages before mapping', () => {
    expect(percentToValue(-10, 0, 100)).toBe(0);
    expect(percentToValue(140, 0, 100)).toBe(100);
  });

  it('round-trips with valueToPercent', () => {
    const value = 37;
    expect(percentToValue(valueToPercent(value, 1, 100), 1, 100)).toBeCloseTo(value);
  });
});

describe('snapToStep', () => {
  it('snaps to the nearest integer for step = 1', () => {
    expect(snapToStep(33.6, 1, 1)).toBe(34);
    expect(snapToStep(33.2, 1, 1)).toBe(33);
  });

  it('snaps relative to min, not to zero', () => {
    // stops at 5, 10, 15, ... starting from min = 5
    expect(snapToStep(12, 5, 5)).toBe(10);
    expect(snapToStep(13, 5, 5)).toBe(15);
  });

  it('returns the value unchanged when step is non-positive', () => {
    expect(snapToStep(33.6, 0, 1)).toBe(33.6);
    expect(snapToStep(33.6, -1, 1)).toBe(33.6);
  });
});

describe('clampIndex', () => {
  it('keeps a valid index unchanged', () => {
    expect(clampIndex(3, 6)).toBe(3);
  });

  it('clamps to the last valid index', () => {
    expect(clampIndex(9, 6)).toBe(5);
  });

  it('clamps negative indices to 0', () => {
    expect(clampIndex(-2, 6)).toBe(0);
  });

  it('rounds fractional indices', () => {
    expect(clampIndex(2.4, 6)).toBe(2);
    expect(clampIndex(2.6, 6)).toBe(3);
  });

  it('returns 0 for an empty range', () => {
    expect(clampIndex(3, 0)).toBe(0);
  });
});

describe('indexToPercent', () => {
  // Exercise 2 layout: 6 fixed values → notches every 20%.
  it('spreads stops at equal intervals regardless of magnitude', () => {
    expect(indexToPercent(0, 6)).toBe(0);
    expect(indexToPercent(1, 6)).toBe(20);
    expect(indexToPercent(2, 6)).toBe(40);
    expect(indexToPercent(5, 6)).toBe(100);
  });

  it('clamps an out-of-range index', () => {
    expect(indexToPercent(10, 6)).toBe(100);
  });

  it('collapses a single-stop range to 0%', () => {
    expect(indexToPercent(0, 1)).toBe(0);
  });
});

describe('percentToIndex', () => {
  it('is the inverse of indexToPercent at the notches', () => {
    expect(percentToIndex(0, 6)).toBe(0);
    expect(percentToIndex(20, 6)).toBe(1);
    expect(percentToIndex(100, 6)).toBe(5);
  });

  it('snaps to the nearest notch between stops', () => {
    expect(percentToIndex(9, 6)).toBe(0); // closer to 0% than 20%
    expect(percentToIndex(11, 6)).toBe(1); // closer to 20% than 0%
  });

  it('clamps out-of-range percentages', () => {
    expect(percentToIndex(-5, 6)).toBe(0);
    expect(percentToIndex(130, 6)).toBe(5);
  });

  it('returns 0 for a single-stop range', () => {
    expect(percentToIndex(50, 1)).toBe(0);
  });
});

describe('nearestIndex', () => {
  const values = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

  it('finds the exact match', () => {
    expect(nearestIndex(30.99, values)).toBe(3);
  });

  it('finds the closest value when there is no exact match', () => {
    expect(nearestIndex(9, values)).toBe(2); // closest to 10.99
    expect(nearestIndex(45, values)).toBe(4); // closest to 50.99
  });

  it('clamps below the first and above the last stop', () => {
    expect(nearestIndex(-100, values)).toBe(0);
    expect(nearestIndex(1000, values)).toBe(5);
  });

  it('resolves ties to the lower index', () => {
    // 8.49 is exactly halfway between 5.99 (index 1) and 10.99 (index 2).
    expect(nearestIndex(8.49, values)).toBe(1);
  });

  it('returns 0 for an empty array', () => {
    expect(nearestIndex(5, [])).toBe(0);
  });
});
