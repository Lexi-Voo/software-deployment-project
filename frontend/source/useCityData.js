import { useState } from "react";
import { getWeather, getHWeather } from "../services/weatherService";
import { getCityInfo } from "../services/placeService";
import { getAttractions } from "../services/attractionsService";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

export const useCityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapToLastYear = (date) => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  };

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getFallbackCityInfo = (city) => ({
    name: city,
    title: city,
    type: "City",
    extract: `${city} is a travel destination worth exploring.`,
    description: `${city} is a travel destination worth exploring.`,
    image: null,
    lat: null,
    lng: null,
  });

  const searchCity = async ({ city, startDate, endDate }) => {
    setLoading(true);
    setError(null);

    try {
      let info = null;
      let rawAttractions = [];
      let weatherRaw = [];

      // --- City info (via backend → SerpAPI) ---
      try {
        info = await getCityInfo(city);
      } catch (err) {
        console.error("City info fetch failed:", err);
        info = getFallbackCityInfo(city);
      }

      let lat = info?.lat;
      let lon = info?.lng;

      try {
        rawAttractions = await getAttractions(city);
      } catch (err) {
        console.error("Attractions fetch failed:", err);
        rawAttractions = [];
      }

      // Fallback: if city coordinates are missing, use first attraction coordinates
      if ((lat == null || lon == null) && Array.isArray(rawAttractions) && rawAttractions.length > 0) {
        const firstAttractionWithCoords = rawAttractions.find(
          (item) => item.lat != null && item.lng != null
        );

        if (firstAttractionWithCoords) {
          lat = firstAttractionWithCoords.lat;
          lon = firstAttractionWithCoords.lng;

          console.log("Using attraction coordinates as weather fallback:", {
            city,
            attraction: firstAttractionWithCoords.name,
            lat,
            lon,
          });
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const defaultEnd = new Date(today);
      defaultEnd.setDate(today.getDate() + 5);

      const start = startDate ? new Date(startDate) : today;
      const end = endDate ? new Date(endDate) : defaultEnd;
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const forecastLimit = new Date(today);
      forecastLimit.setDate(today.getDate() + 16);
      const withinForecast = start >= today && end <= forecastLimit;

      // --- Weather (Open-Meteo, called directly from frontend) ---
      try {
        if (!lat || !lon) {
          weatherRaw = [];
        } else if (withinForecast) {
          weatherRaw = await getWeather(lat, lon, formatDate(start), formatDate(end));
        } else {
          const shiftedStart = mapToLastYear(start);
          const shiftedEnd = mapToLastYear(end);
          weatherRaw = await getHWeather(lat, lon, formatDate(shiftedStart), formatDate(shiftedEnd));
        }
      } catch (err) {
        console.error("Weather fetch failed, trying historical fallback:", err);
        if (lat && lon) {
          try {
            const shiftedToday = mapToLastYear(today);
            weatherRaw = await getHWeather(lat, lon, formatDate(shiftedToday), formatDate(shiftedToday));
          } catch (_) {
            weatherRaw = [];
          }
        } else {
          weatherRaw = [];
        }
      }

      // --- Attractions (via backend → SerpAPI Google Maps) ---
      try {
        rawAttractions = await getAttractions(city);
      } catch (err) {
        console.error("Attractions fetch failed:", err);
        rawAttractions = [];
      }

      const dailyWeather = Array.isArray(weatherRaw) ? weatherRaw : [];

      // Normalize attraction images — SerpAPI thumbnails are already direct URLs
      const attractionsWithImages = rawAttractions.map((item) => {
        const finalImage =
          item.detailImage ||
          item.image ||
          (Array.isArray(item.photos) && item.photos.length > 0
            ? item.photos[0]
            : null);

        return {
          ...item,
          image: finalImage,
          detailImage: item.detailImage || finalImage,
          photos:
            Array.isArray(item.photos) && item.photos.length > 0
              ? item.photos
              : finalImage
              ? [finalImage]
              : [],
        };
      });

      const cityImage = info?.image || PLACEHOLDER;

      const result = {
        weather: dailyWeather,
        info,
        attractions: attractionsWithImages,
        image: cityImage,
      };

      setData(result);
      return result;
    } catch (err) {
      console.error("Failed to fetch city data:", err);
      setError(err.message || "Failed to fetch city data");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, searchCity, error };
};