export const getCityImages = async (city) => {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${city}&per_page=15&orientation=landscape&client_id=${key}`
  );

  if (!res.ok) throw new Error("Unsplash API failed");

  const data = await res.json();

  return data.results || [];
};