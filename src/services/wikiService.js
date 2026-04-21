export const getCityInfo = async (city) => {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
  );

  if (!res.ok) throw new Error("Wikipedia API failed");

  return res.json();
};