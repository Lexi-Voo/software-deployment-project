import { describe, it, expect, vi, beforeEach } from 'vitest';
  vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
});

import { getCityInfo } from '../../../src/services/placeService.js';

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

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/city?name=Test%20City');
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