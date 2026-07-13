export interface RangeValues {
  rangeValues: number[];
}

export async function getRangeValues(signal?: AbortSignal): Promise<RangeValues> {
  const res = await fetch('/api/range-values', { cache: 'no-store', signal });
  if (!res.ok) {
    throw new Error(`Failed to load range values: ${res.status}`);
  }
  return (await res.json()) as RangeValues;
}
