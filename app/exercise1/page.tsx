'use client';

import { useEffect, useState } from 'react';
import { Range } from '@/components/Range/Range';
import { getRangeConfig, type RangeConfig } from '@/lib/api/getRangeConfig';

const formatEuro = (value: number) => `${value}€`;

export default function Exercise1Page() {
  const [config, setConfig] = useState<RangeConfig | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getRangeConfig(controller.signal)
      .then(setConfig)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Exercise 1 — Normal range</h1>
      {error && <p role="alert">Could not load the range configuration.</p>}
      {!error && !config && <p>Loading…</p>}
      {config && <Range min={config.min} max={config.max} formatValue={formatEuro} />}
    </main>
  );
}
