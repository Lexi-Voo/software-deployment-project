const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export async function getCityImages(city) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    city
  )}&per_page=6&orientation=landscape&client_id=${ACCESS_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Unsplash city image API failed");
  }

  const data = await res.json();
  return data.results || [];
}

export async function getAttractionImageFromUnsplash(attractionName, city) {
  const queries = [
    `"${attractionName}" ${city}`,
    `${attractionName} ${city} tourist attraction`,
    `${attractionName} ${city} landmark`,
  ];

  for (const query of queries) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape&client_id=${ACCESS_KEY}`;

    const res = await fetch(url);

    if (!res.ok) continue;

    const data = await res.json();

    const image =
      data.results?.[0]?.urls?.regular ||
      data.results?.[0]?.urls?.small ||
      null;

    if (image) return image;
  }

  return null;
}