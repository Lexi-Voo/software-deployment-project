const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches top attractions for a city from the Express backend.
 * The backend calls SerpAPI Google Maps and returns normalized results.
 */
export async function getAttractions(city) {
  const res = await fetch(
    `${BASE_URL}/api/attractions?city=${encodeURIComponent(city)}`
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Attractions API failed: ${errorText}`);
  }

  return await res.json();
}