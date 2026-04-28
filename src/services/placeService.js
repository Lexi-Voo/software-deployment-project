const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches city info (name, description, image, lat/lng)
 * from our Express backend which uses SerpAPI under the hood.
 */
export async function getCityInfo(city) {
  const res = await fetch(
    `${BASE_URL}/api/city?name=${encodeURIComponent(city)}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`City info API failed: ${text}`);
  }

  return await res.json();
}