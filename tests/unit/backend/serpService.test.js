import https from 'https';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventEmitter from 'events';
import { fetchAttractions } from '../../../backend/services/serpService.js'; 

describe('serpService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('SERPAPI_API_KEY', 'test-key');
  });

  const mockHttpsGet = (responseBody, isError = false) => {
    vi.spyOn(https, 'get').mockImplementation((url, options, callback) => {
      const req = new EventEmitter();
      const res = new EventEmitter();
      process.nextTick(() => {
        if (isError) {
          req.emit('error', new Error('Network Error'));
        } else {
          if (typeof options === 'function') options(res);
          else callback(res);
          res.emit('data', responseBody);
          res.emit('end');
        }
      });
      return req;
    });
  };

  it('throws error when SERPAPI_API_KEY is missing', async () => {
    vi.stubEnv('SERPAPI_API_KEY', ''); 
    await expect(fetchAttractions('London')).rejects.toThrow(/SERPAPI_API_KEY/);
  });

  it('handles local_results as { places: [...] } structure', async () => {
    const mockResponse = JSON.stringify({
      local_results: { places: [{ title: 'Place A' }] }
    });
    mockHttpsGet(mockResponse);
    const result = await fetchAttractions('City');
    expect(result[0].name).toBe('Place A');
  });

  it('generates slugified ID if place_id is missing', async () => {
    const mockResponse = JSON.stringify({
      local_results: [{ title: 'Batu Caves 123!' }] 
    });
    mockHttpsGet(mockResponse);
    const result = await fetchAttractions('KL');
    // attraction-{index}-{slugified-title}
    expect(result[0].id).toBe('attraction-0-batu-caves-123');
  });

  it('normalizes opening hours from the hours array', async () => {
    const mockResponse = JSON.stringify({
      local_results: [{
        title: 'Museum',
        hours: [{ day: 'Mon', hours: 'Closed' }]
      }]
    });
    mockHttpsGet(mockResponse);
    const result = await fetchAttractions('City');
    expect(result[0].openingHours).toBe('Mon: Closed');
  });

  it('picks the best available image through the fallback chain', async () => {
    const mockResponse = JSON.stringify({
      local_results: [{
        title: 'Sight',
        photos: [{ thumbnail: 'thumb1.jpg' }, { image: 'image2.jpg' }]
      }]
    });
    mockHttpsGet(mockResponse);
    const result = await fetchAttractions('City');
    expect(result[0].image).toBe('thumb1.jpg');
    expect(result[0].photos).toContain('image2.jpg');
  });

  it('returns empty array and warns on no results', async () => {
    const mockResponse = JSON.stringify({ local_results: [] });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockHttpsGet(mockResponse);
    const result = await fetchAttractions('Empty');
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('covers all remaining branches in normalizeAttraction (Line 32)', async () => {
    const mockResponse = JSON.stringify({
      local_results: [
        {
          title: 'Branch Test',
          operating_hours: { Tuesday: '10am-4pm' },
          photos: [{ image: 'fallback-image.jpg' }],
          type: 'Park'
        }
      ]
    });

    mockHttpsGet(mockResponse);

    const result = await fetchAttractions('Test');

    expect(result[0].openingHours).toBe('Tuesday: 10am-4pm');
    expect(result[0].image).toBe('fallback-image.jpg');
    expect(result[0].id).toContain('attraction-0-branch-test');
  });

  it('handles the case where local_results is completely missing', async () => {
    const mockResponse = JSON.stringify({}); 
    mockHttpsGet(mockResponse);

    const result = await fetchAttractions('NothingCity');
    expect(result).toEqual([]);
  });
});