const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

const ATTRACTION_FALLBACKS = [
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
];

export async function getAttractions(cityInfo) {
  if (!cityInfo?.lat || !cityInfo?.lng) return [];

  const radiusMeters = 12000;

  const url = `https://api.geoapify.com/v2/places?categories=tourism.sights,tourism.attraction,tourism.information&filter=place:${cityInfo.placeId}&limit=20&lang=en&apiKey=${API_KEY}`;

  console.log(`Fetching attractions for ${cityInfo.name} with place_id: ${cityInfo.placeId}, url:`, url);

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Geoapify attractions API failed: ${errorText}`);
  }

  const data = await res.json();

  console.log(`API returned ${data.features?.length || 0} features`);

  const attractions = (data.features || []).map((feature, index) => {
    const p = feature.properties || {};
    const fallbackImage =
      ATTRACTION_FALLBACKS[index % ATTRACTION_FALLBACKS.length];

    return {
      id: p.place_id || `${p.name || "attraction"}-${index}`,
      rank: index + 1,
      name: p.name_international?.en || p.name || "Unknown attraction",
      briefIntro: p.formatted || "",
      address: p.formatted || "",
      lat: p.lat ?? null,
      lng: p.lon ?? null,
      image: p.wiki_and_media?.image || fallbackImage,
      photos: [fallbackImage],
      openingHours: p.opening_hours || "",
      contactNumber: p.contact?.phone || p.contact?.phone_other?.[0] || "",
      website: p.website || p.heritage?.website || p.brand_details?.website || p.operator_details?.website || "",
      whyYouShouldGo: [], // Can be populated based on categories or description
      knowBeforeYouGo: [], // Can be populated with general tips
    };
  });

  // Deduplicate by id
  const uniqueAttractions = [];
  const seenIds = new Set();
  for (const attraction of attractions) {
    if (!seenIds.has(attraction.id)) {
      seenIds.add(attraction.id);
      uniqueAttractions.push(attraction);
    }
  }

  console.log(`Found ${uniqueAttractions.length} unique attractions`);

  return uniqueAttractions;
}

export async function getAttractionDetails(placeId, fallbackImage = "") {
  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(
    placeId
  )}&lang=en&apiKey=${API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Geoapify place details API failed: ${errorText}`);
  }

  const data = await res.json();
  const detailsFeature = data.features?.find(
    (f) => f.properties?.feature_type === "details"
  );
  const details = detailsFeature?.properties || {};

  const image =
    details.wiki_and_media?.image ||
    fallbackImage ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

  return {
    id: details.place_id || placeId,
    name: details.name || "Unknown attraction",
    description:
        details.description ||
        details.heritage?.description ||
        details.historic?.inscription ||
        "",
    address: details.formatted || "",
    openingHours: details.opening_hours || "",
    contactNumber:
        details.contact?.phone ||
        details.contact?.phone_other?.[0] ||
        "Not available",
    website:
        details.website ||
        details.heritage?.website ||
        details.brand_details?.website ||
        details.operator_details?.website ||
        "Not available",
    lat: details.lat ?? null,
    lng: details.lon ?? null,
    image,
    photos: [image],
  };
}
