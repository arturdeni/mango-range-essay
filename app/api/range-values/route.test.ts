/**
 * @jest-environment node
 */
import { GET } from './route';

describe('GET /api/range-values', () => {
  it('responds 200 with JSON content type', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns the exact fixed rangeValues shape', async () => {
    const res = await GET();
    await expect(res.json()).resolves.toEqual({
      rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
    });
  });
});
