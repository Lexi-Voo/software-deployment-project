import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAttractions } from './attractionsService.js';

describe('attractionsService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
  });

  it('fetches attractions successfully', async () => {
    const mockData = [{ id: '1', name: 'Museum' }];
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await getAttractions('Kuala Lumpur');

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/attractions?city=Kuala%20Lumpur`;
    expect(fetch).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockData);
  });

  it('handles API errors', async () => {
    fetch.mockResolvedValue({
      ok: false,
      text: async () => 'Not Found',
    });

    await expect(getAttractions('Invalid')).rejects.toThrow(/Attractions API failed: Not Found/);
  });
});