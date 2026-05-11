export const getWeather = async (lat, lon, startDate, endDate) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,weathercode&timezone=auto&start_date=${startDate}&end_date=${endDate}`
  );

  if (!res.ok) throw new Error("Forecast API failed");

  const data = await res.json();

  return data.daily.time.map((date, i) => ({
    date,
    main: {
      temp: data.daily.temperature_2m_max[i],
      humidity: data.daily.relative_humidity_2m_mean[i],
    },
    weather: [
      {
        description: mapWeatherCode(data.daily.weathercode[i]),
      },
    ],
  }));
};

export const getHWeather = async (lat, lon, startDate, endDate) => {
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,relative_humidity_2m_mean,weathercode&timezone=auto`
  );

  if (!res.ok) throw new Error("Historical API failed");

  const data = await res.json();

  return data.daily.time.map((date, i) => ({
    date,
    main: {
      temp: data.daily.temperature_2m_max[i],
      humidity: data.daily.relative_humidity_2m_mean[i],
    },
    weather: [
      {
        description: mapWeatherCode(data.daily.weathercode[i]),
      },
    ],
  }));
};

function mapWeatherCode(code) {
  const map = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    77: "snow grains",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with slight hail",
    99: "thunderstorm with heavy hail",
  };

  return map[code] ?? "clear / partly cloudy";
}