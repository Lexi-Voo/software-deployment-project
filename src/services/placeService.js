const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export async function getCityInfo(city) {
  const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    city
  )}&type=city&limit=1&lang=en&apiKey=${API_KEY}`;

  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) {
    throw new Error("Geoapify geocoding API failed");
  }

  const geoData = await geoRes.json();
  const cityProps = geoData.features?.[0]?.properties;

  if (!cityProps?.place_id) {
    return {
      name: city,
      country: "",
      description: `${city} is a travel destination worth exploring.`,
      lat: null,
      lng: null,
      formatted: city,
      placeId: null,
    };
  }

  const detailUrl = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(
    cityProps.place_id
  )}&lang=en&apiKey=${API_KEY}`;

  const detailRes = await fetch(detailUrl);
  if (!detailRes.ok) {
    throw new Error("Geoapify city details API failed");
  }

  const detailData = await detailRes.json();
  const detailsFeature = detailData.features?.find(
    (f) => f.properties?.feature_type === "details"
  );
  const details = detailsFeature?.properties || {};

  const result = {
    name: details.city || cityProps.city || city,
    country: details.country || cityProps.country || "",
    description:
      details.description ||
      `${city} is a travel destination worth exploring.`,
    lat: details.lat ?? cityProps.lat ?? null,
    lng: details.lon ?? cityProps.lon ?? null,
    formatted: details.formatted || cityProps.formatted || city,
    placeId: cityProps.place_id,
  };

  return result;
}