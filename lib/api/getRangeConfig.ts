export interface RangeConfig {
  min: number;
  max: number;
}

export async function getRangeConfig(signal?: AbortSignal): Promise<RangeConfig> {
  const res = await fetch('/api/range-config', { cache: 'no-store', signal });
  if (!res.ok) {
    throw new Error(`Failed to load range config: ${res.status}`);
  }
  return (await res.json()) as RangeConfig;
}
