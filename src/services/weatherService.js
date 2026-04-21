export const getWeather = async (city) => {
  const key = import.meta.env.VITE_WEATHER_API_KEY;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`
  );

  if (!res.ok) throw new Error("Weather API failed");

  return res.json();
};