const https = require("https");

async function fetchCityInfo(city) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set in .env");

  const query = encodeURIComponent(city);
  const url = `https://serpapi.com/search.json?engine=google&q=${query}&hl=en&gl=us&api_key=${apiKey}`;

  const raw = await httpGet(url);
  const json = JSON.parse(raw);

  const kg = json.knowledge_graph || {};

  // Image: header_images is array of { image, source }
  const image =
    kg.header_images?.[0]?.image ||
    kg.thumbnail?.image ||
    json.inline_images?.[0]?.original ||
    null;

  const description =
    kg.description ||
    kg.snippet ||
    `${city} is a wonderful travel destination.`;

  let lat = null;
  let lng = null;
  try {
    const geoRaw = await httpGet(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { "User-Agent": "TravelPlannerApp/1.0" }
    );
    const geoJson = JSON.parse(geoRaw);
    if (geoJson[0]) {
      lat = parseFloat(geoJson[0].lat);
      lng = parseFloat(geoJson[0].lon);
    }
  } catch (e) {
    console.warn("[cityService] Nominatim geocoding failed:", e.message);
  }

  return {
    name: kg.title || city,
    title: kg.title || city,
    country: kg.type || "",
    extract: description,
    description,
    image,
    lat,
    lng,
  };
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

module.exports = { fetchCityInfo };