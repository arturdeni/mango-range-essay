/**
 * @jest-environment node
 */
import { getRangeValues } from './getRangeValues';

describe('getRangeValues', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests the range-values route and returns the parsed values', async () => {
    const payload = { rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] };
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const data = await getRangeValues();

    expect(fetchMock).toHaveBeenCalledWith('/api/range-values', expect.objectContaining({ cache: 'no-store' }));
    expect(data).toEqual(payload);
  });

  it('throws when the response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));

    await expect(getRangeValues()).rejects.toThrow('Failed to load range values: 500');
  });
});
