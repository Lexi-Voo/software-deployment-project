import { describe, it, expect, vi, beforeEach } from 'vitest';
  vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
});

import { getCityInfo } from './placeService.js';

describe('placeService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetches city info successfully', async () => {
    const mockData = { name: 'Test City', lat: 1, lng: 2 };
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await getCityInfo('Test City');

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/city?name=Test%20City`;
    expect(fetch).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockData);
  });

  it('throws error when API fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      text: async () => 'Not found',
    });

    await expect(getCityInfo('Nowhere')).rejects.toThrow('City info API failed: Not found');
  });
});