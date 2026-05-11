const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const https = require("https");
const Redis = require("ioredis");
const { fetchAttractions } = require("./services/serpService");

dotenv.config();

// ─────────────────────────────────────────────
// Redis connection
// Local:  REDIS_URL=redis://redis:6379
// Azure:  REDIS_URL=rediss://:password@gofly-redis-dev.redis.cache.windows.net:6380
// ─────────────────────────────────────────────
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

// ─────────────────────────────────────────────
// Express setup
// ─────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Health check — required by Docker and Azure Container Apps
// ─────────────────────────────────────────────
app.get("/health", (req, res) => res.sendStatus(200));

// ─────────────────────────────────────────────
// Utility: HTTP GET
// ─────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
          resolve(data);
        });
      })
      .on("error", reject);
  });
}

// ─────────────────────────────────────────────
// Utility: Geocode city name to lat/lng
// ─────────────────────────────────────────────
async function geocodeCity(city) {
  const query = encodeURIComponent(city);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`;

  const raw = await httpGet(url);
  const json = JSON.parse(raw);
  const first = json.results?.[0];

  return {
    lat: first?.latitude ?? null,
    lng: first?.longitude ?? null,
  };
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "backend running" });
});

// ─────────────────────────────────────────────
// GET /api/city?name=Paris
// Returns city info from SerpAPI with Redis caching
// ─────────────────────────────────────────────
app.get("/api/city", async (req, res) => {
  const city = req.query.name;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  // Check Redis cache first — avoids SerpAPI call if already fetched
  const cacheKey = `city:${city.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }
  } catch (cacheErr) {
    // If Redis is unavailable, log and continue to fetch from SerpAPI
    console.error("Redis cache read failed:", cacheErr.message);
  }

  try {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SERPAPI_API_KEY is not set in .env" });
    }

    const query = encodeURIComponent(`${city} city`);
    const url = `https://serpapi.com/search.json?engine=google&q=${query}&hl=en&gl=us&api_key=${apiKey}`;

    const raw = await httpGet(url);
    const json = JSON.parse(raw);

    const kg = json.knowledge_graph || {};

    const knownForButton = Array.isArray(json.things_to_know?.buttons)
      ? json.things_to_know.buttons.find((b) => b.text === "Known For")
      : null;

    const snippet =
      knownForButton?.title?.ai_overview?.text_blocks?.find(
        (block) => block.type === "paragraph" && block.snippet
      )?.snippet ||
      kg.description ||
      `${city} is a travel destination worth exploring.`;

    const kgWebResults = Array.isArray(kg.web_results) ? kg.web_results : [];
    const carouselImages = Array.isArray(kgWebResults[0]?.carousel)
      ? kgWebResults[0].carousel
      : [];
    const headerImages = Array.isArray(kg.header_images) ? kg.header_images : [];

    const isUsefulImage = (url) => {
      if (!url) return false;
      const blockedPatterns = [
        "ssl.gstatic.com/kpui/social/",
        "gstatic.com/kpui/social/",
        "favicon",
        "logo",
        "icon",
        "fb_32x32",
      ];
      return !blockedPatterns.some((pattern) => url.includes(pattern));
    };

    const bestImage =
      carouselImages.find((item) => isUsefulImage(item.image))?.image ||
      headerImages.find((item) => isUsefulImage(item.image))?.image ||
      null;

    let lat = kg.coordinates?.latitude ?? kg.gps_coordinates?.latitude ?? null;
    let lng = kg.coordinates?.longitude ?? kg.gps_coordinates?.longitude ?? null;

    if (lat == null || lng == null) {
      const fallbackCoords = await geocodeCity(city);
      lat = fallbackCoords.lat;
      lng = fallbackCoords.lng;
    }

    const result = {
      name: kg.title || city,
      title: kg.title || city,
      type: kg.type || "City",
      extract: snippet,
      description: snippet,
      image: bestImage,
      lat,
      lng,
    };

    // Save result to Redis cache for 1 hour (3600 seconds)
    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
      console.log(`Cache set: ${cacheKey}`);
    } catch (cacheErr) {
      console.error("Redis cache write failed:", cacheErr.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("City route failed:", error);
    return res.status(500).json({
      error: "Failed to fetch city info",
      details: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/attractions?city=Paris
// Returns attractions from SerpAPI with Redis caching
// ─────────────────────────────────────────────
app.get("/api/attractions", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  // Check Redis cache first
  const cacheKey = `attractions:${city.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }
  } catch (cacheErr) {
    console.error("Redis cache read failed:", cacheErr.message);
  }

  try {
    const attractions = await fetchAttractions(city);

    // Save result to Redis cache for 1 hour
    try {
      await redis.set(cacheKey, JSON.stringify(attractions), "EX", 3600);
      console.log(`Cache set: ${cacheKey}`);
    } catch (cacheErr) {
      console.error("Redis cache write failed:", cacheErr.message);
    }

    return res.json(attractions);
  } catch (error) {
    console.error("Attractions route failed:", error);
    return res.status(500).json({
      error: "Failed to fetch attractions",
      details: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});