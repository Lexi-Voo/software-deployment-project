import { useState } from "react";
import { getWeather } from "../services/weatherService";
import { getCityInfo } from "../services/placeService";
import { getAttractions } from "../services/geoapifyService";
import {
  getCityImages,
  getAttractionImageFromUnsplash,
} from "../services/unsplashService";
import { getAttractionImageFromWiki } from "../services/wikidataService";
import { getHWeather } from "../services/weatherService";

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

  const searchCity = async ({ city, startDate, endDate }) => {
    setLoading(true);
    setError(null);

    try {
      let weatherRaw = null;
      let info = null;
      let images = [];
      let rawAttractions = [];

      try {
        info = await getCityInfo(city);
      } catch {
        info = {
          name: city,
          country: "",
          description: `${city} is a travel destination worth exploring.`,
          lat: null,
          lng: null,
          formatted: city,
          placeId: null,
        };
      }

      const lat = info?.lat;
      const lon = info?.lng;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const defaultEnd = new Date(today);
      defaultEnd.setDate(today.getDate() + 5);

      const start = startDate ? new Date(startDate) : today;
      const end = endDate ? new Date(endDate) : defaultEnd;

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const forecastLimit = new Date(today);
      forecastLimit.setDate(today.getDate() + 16);

      const withinForecast =
        start >= today && end <= forecastLimit;

      // =========================
      // WEATHER LOGIC (MERGED)
      // =========================
      try {
        if (!lat || !lon) {
          weatherRaw = [];
        } else {
          if (withinForecast) {
            // ✔️ pulled version behavior (forecast API)
            weatherRaw = await getWeather(
              lat,
              lon,
              format(start),
              format(end)
            );
          } else {
            // ✔️ your version behavior (past fallback)
            const shiftedStart = mapToLastYear(start);
            const shiftedEnd = mapToLastYear(end);

            weatherRaw = await getHWeather(
              lat,
              lon,
              format(shiftedStart),
              format(shiftedEnd)
            );
          }
        }
      } catch {
        const shiftedToday = mapToLastYear(today);

        weatherRaw = await getHWeather(
          lat,
          lon,
          format(shiftedToday),
          format(shiftedToday)
        );
      }

      // CITY IMAGES 

      try {
        images = await getCityImages(city);
      } catch (error) {
        console.error("City image fetch failed:", error);
        images = [];
      }

      // Attractions
      try {
        rawAttractions = await getAttractions(info);
      } catch (error) {
        console.error("Attractions fetch failed:", error);
        rawAttractions = [];
      }

      const safeImages = Array.isArray(images) ? images : [];
      const cityImage =
        safeImages.length > 0
          ? safeImages[Math.floor(Math.random() * safeImages.length)]?.urls?.regular
          : PLACEHOLDER;

      const dailyWeather = Array.isArray(weatherRaw)
        ? weatherRaw
        : [];
      const attractionsWithImages = await Promise.all(
        (rawAttractions || []).map(async (item) => {
          let wikiImage = null;
          let unsplashImage = null;

          try {
            wikiImage = await getAttractionImageFromWiki(item.name, info.name);
          } catch (error) {
            console.error(`Wiki image fetch failed for ${item.name}:`, error);
          }

          const isSimpleQuery = /^[\x00-\x7F\s"'().,&-]+$/.test(item.name);

          if (!wikiImage && isSimpleQuery) {
            try {
              unsplashImage = await getAttractionImageFromUnsplash(
                item.name,
                info.name
              );
            } catch (error) {
              console.error(`Unsplash image fetch failed for ${item.name}:`, error);
            }
          }

          const finalImage = wikiImage || unsplashImage || PLACEHOLDER;

          return {
            ...item,
            image: finalImage,
            photos: [finalImage],
          };
        })
      );

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
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, searchCity, error };
};