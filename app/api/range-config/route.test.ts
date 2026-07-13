/**
 * @jest-environment node
 */
import { GET } from './route';

describe('GET /api/range-config', () => {
  it('responds 200 with JSON content type', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns the exact { min, max } config shape', async () => {
    const res = await GET();
    await expect(res.json()).resolves.toEqual({ min: 1, max: 100 });
  });
});
