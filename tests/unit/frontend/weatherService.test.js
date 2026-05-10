import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeather, getHWeather } from '../../../src/services/weatherService.js';

describe('weatherService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns forecast data with mapped weather descriptions for getWeather()', async () => {
    const fakeResponse = {
      daily: {
        time: ['2026-05-01', '2026-05-02'],
        temperature_2m_max: [20.5, 22.2],
        relative_humidity_2m_mean: [55, 60],
        weathercode: [0, 63],
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });

    const result = await getWeather(40.0, -74.0, '2026-05-01', '2026-05-02');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.open-meteo.com/v1/forecast')
    );
    expect(result[0].weather[0].description).toBe('clear sky');
    expect(result[1].weather[0].description).toBe('moderate rain');
    expect(result).toHaveLength(2);
  });

  it('throws when getWeather() receives a non-ok forecast response', async () => {
    fetch.mockResolvedValue({ ok: false });

    await expect(getWeather(40.0, -74.0, '2026-05-01', '2026-05-02'))
      .rejects.toThrow('Forecast API failed');
  });

  it('returns historical forecast data for getHWeather()', async () => {
    const fakeResponse = {
      daily: {
        time: ['2026-04-01'],
        temperature_2m_max: [15.1],
        relative_humidity_2m_mean: [70],
        weathercode: [99],
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });

    const result = await getHWeather(51.5, -0.1, '2026-04-01', '2026-04-01');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('archive-api.open-meteo.com/v1/archive')
    );
    expect(result[0].weather[0].description).toBe('thunderstorm with heavy hail');
  });

  it('throws when getHWeather() receives a non-ok historical response', async () => {
    fetch.mockResolvedValue({ ok: false });

    await expect(getHWeather(51.5, -0.1, '2026-04-01', '2026-04-02'))
      .rejects.toThrow('Historical API failed');
  });

  it('maps unknown weather codes to the default fallback description', async () => {
    const fakeResponse = {
      daily: {
        time: ['2026-05-10'],
        temperature_2m_max: [12.4],
        relative_humidity_2m_mean: [80],
        weathercode: [999], // Unknown code
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });

    const result = await getWeather(10.0, 20.0, '2026-05-10', '2026-05-10');

    expect(result[0].weather[0].description).toBe('clear / partly cloudy');
  });
});