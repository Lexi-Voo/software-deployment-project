import https from 'https';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventEmitter from 'events';
import { fetchCityInfo } from "./cityService.js";

describe('cityService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('SERPAPI_API_KEY', 'test-key');
  });

  it('throws error when SERPAPI_API_KEY is missing', async () => {
    vi.stubEnv('SERPAPI_API_KEY', ''); 
    await expect(fetchCityInfo('Test City')).rejects.toThrow('SERPAPI_API_KEY is not set');
  });

  const mockHttpsSequence = (configs) => {
    let callCount = 0;
    vi.spyOn(https, 'get').mockImplementation((url, options, callback) => {
      const config = configs[callCount++];
      const requestEmitter = new EventEmitter();
      const responseEmitter = new EventEmitter();
      responseEmitter.statusCode = config.statusCode || 200;

      process.nextTick(() => {
        if (config.error) {
          requestEmitter.emit('error', new Error(config.error));
        } else {
          if (typeof options === 'function') {
            options(responseEmitter);
          } else {
            callback(responseEmitter);
          }
          responseEmitter.emit('data', config.body || '');
          responseEmitter.emit('end');
        }
      });

      return requestEmitter;
    });
  };

  it('fetches and normalizes city info successfully', async () => {
    const serpResponse = JSON.stringify({
      knowledge_graph: { title: 'Test City', type: 'City', description: 'Cool place' },
      header_images: [{ image: 'img.jpg' }]
    });
    const geoResponse = JSON.stringify([{ lat: '1.23', lon: '4.56' }]);

    mockHttpsSequence([{ body: serpResponse }, { body: geoResponse }]);

    const result = await fetchCityInfo('Test City');

    expect(result.name).toBe('Test City');
    expect(result.lat).toBe(1.23);
    expect(result.lng).toBe(4.56);
  });

  it('handles geocoding empty results gracefully', async () => {
    const serpResponse = JSON.stringify({ knowledge_graph: { title: 'Test City' } });
    const geoResponse = JSON.stringify([]); // Empty array from Nominatim

    mockHttpsSequence([{ body: serpResponse }, { body: geoResponse }]);

    const result = await fetchCityInfo('Test City');

    expect(result.name).toBe('Test City');
    expect(result.lat).toBeNull();
  });

  it('logs a warning and continues when geocoding throws a hard error (Line 40)', async () => {
    const serpResponse = JSON.stringify({ knowledge_graph: { title: 'Test City' } });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockHttpsSequence([
      { body: serpResponse }, 
      { error: 'Network Connection Refused' }
    ]);

    const result = await fetchCityInfo('Test City');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[cityService] Nominatim geocoding failed:'),
      'Network Connection Refused'
    );

    expect(result.name).toBe('Test City');
    expect(result.lat).toBeNull(); 

    warnSpy.mockRestore();
  });

  it('throws error when SERPAPI_API_KEY is missing', async () => {
    delete process.env.SERPAPI_API_KEY;
    await expect(fetchCityInfo('Test City')).rejects.toThrow('SERPAPI_API_KEY is not set');
  });

  it('uses fallback description when no data is found in SerpAPI', async () => {
    const emptySerp = JSON.stringify({});
    const geoResponse = JSON.stringify([]);

    mockHttpsSequence([{ body: emptySerp }, { body: geoResponse }]);

    const result = await fetchCityInfo('Unknown');
    expect(result.description).toBe('Unknown is a wonderful travel destination.');
  });
});