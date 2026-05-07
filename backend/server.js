const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const https = require("https");
const { fetchAttractions } = require("./services/serpService");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.sendStatus(200));

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

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "backend running" });
});

app.get("/api/city", async (req, res) => {
  try {
    const city = req.query.name;

    if (!city) {
      return res.status(400).json({
        error: "City name is required",
      });
    }

    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "SERPAPI_API_KEY is not set in .env",
      });
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

    const headerImages = Array.isArray(kg.header_images)
      ? kg.header_images
      : [];

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

    let lat =
      kg.coordinates?.latitude ??
      kg.gps_coordinates?.latitude ??
      null;

    let lng =
      kg.coordinates?.longitude ??
      kg.gps_coordinates?.longitude ??
      null;

    if (lat == null || lng == null) {
      const fallbackCoords = await geocodeCity(city);
      lat = fallbackCoords.lat;
      lng = fallbackCoords.lng;
    }

    return res.json({
      name: kg.title || city,
      title: kg.title || city,
      type: kg.type || "City",
      extract: snippet,
      description: snippet,
      image: bestImage,
      lat,
      lng,
    });
  } catch (error) {
    console.error("City route failed:", error);
    return res.status(500).json({
      error: "Failed to fetch city info",
      details: error.message,
    });
  }
});

app.get("/api/attractions", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({
        error: "City is required",
      });
    }

    const attractions = await fetchAttractions(city);

    return res.json(attractions);
  } catch (error) {
    console.error("Attractions route failed:", error);
    return res.status(500).json({
      error: "Failed to fetch attractions",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});