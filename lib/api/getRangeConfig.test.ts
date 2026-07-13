/**
 * @jest-environment node
 */
import { getRangeConfig } from './getRangeConfig';

describe('getRangeConfig', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests the range-config route and returns the parsed config', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ min: 1, max: 100 }), { status: 200 }));

    const config = await getRangeConfig();

    expect(fetchMock).toHaveBeenCalledWith('/api/range-config', expect.objectContaining({ cache: 'no-store' }));
    expect(config).toEqual({ min: 1, max: 100 });
  });

  it('throws when the response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));

    await expect(getRangeConfig()).rejects.toThrow('Failed to load range config: 500');
  });
});
