const https = require("https");

async function fetchAttractions(city) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set in .env");

  const query = encodeURIComponent(`Tourist attractions in ${city}`);
  const url = `https://serpapi.com/search.json?engine=google_maps&q=${query}&hl=en&gl=us&api_key=${apiKey}`;

  const raw = await httpGet(url);
  const json = JSON.parse(raw);

  // Google Maps engine: local_results is a direct array
  // Google Search engine: local_results is { places: [...] }
  const lr = json.local_results;
  const results = Array.isArray(lr) ? lr : (lr?.places || []);

  if (!results.length) {
    console.warn(`[SerpAPI] No local_results for: ${city}`);
    return [];
  }

  return results.map((r, i) => normalizeAttraction(r, i));
}

function normalizeAttraction(r, index) {
  const id = r.place_id || `attraction-${index}-${slugify(r.title || "")}`;

  const openingHours = Array.isArray(r.hours)
    ? r.hours.map((h) => `${h.day}: ${h.hours}`).join(" | ")
    : r.operating_hours
    ? Object.entries(r.operating_hours).map(([d, h]) => `${d}: ${h}`).join(" | ")
    : null;

  const photoList =
    Array.isArray(r.photos)
      ? r.photos.map((p) => p.thumbnail || p.image).filter(Boolean)
      : [];

  const bestImage =
    r.thumbnail_large ||
    r.thumbnail ||
    photoList[0] ||
    null;

  return {
    id,
    name: r.title || "Unknown",
    briefIntro: r.description || r.type || null,
    description: r.description || null,
    address: r.address || null,
    lat: r.gps_coordinates?.latitude ?? null,
    lng: r.gps_coordinates?.longitude ?? null,
    rating: r.rating ?? null,
    reviewCount: r.reviews ?? null,
    image: bestImage,
    detailImage: bestImage,
    photos: bestImage
      ? [bestImage, ...photoList.filter((img) => img !== bestImage)]
      : photoList,
    website: r.website || null,
    contactNumber: r.phone || null,
    openingHours,
    type: r.type || null,
    price: r.price || null,
    extractedPrice: r.extracted_price ?? null,
  };
}
function slugify(str = "") {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function httpGet(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: extraHeaders }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

module.exports = { fetchAttractions };