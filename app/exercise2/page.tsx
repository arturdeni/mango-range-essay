'use client';

import { useEffect, useState } from 'react';
import { Range } from '@/components/Range/Range';
import { getRangeValues, type RangeValues } from '@/lib/api/getRangeValues';

const formatEuro = (value: number) => `${value}€`;

export default function Exercise2Page() {
  const [data, setData] = useState<RangeValues | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getRangeValues(controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Exercise 2 — Fixed values range</h1>
      {error && <p role="alert">Could not load the range values.</p>}
      {!error && !data && <p>Loading…</p>}
      {data && <Range mode="stepped" rangeValues={data.rangeValues} formatValue={formatEuro} />}
    </main>
  );
}
