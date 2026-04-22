import { useState } from "react";
import { getWeather } from "../services/weatherService";
import { getCityInfo } from "../services/placeService";
import { getAttractions } from "../services/geoapifyService";
import {
  getCityImages,
  getAttractionImageFromUnsplash,
} from "../services/unsplashService";
import { getAttractionImageFromWiki } from "../services/wikidataService";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

export const useCityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchCity = async ({ city }) => {
    setLoading(true);

    try {
      let weatherRaw = null;
      let info = null;
      let images = [];
      let rawAttractions = [];

      // Weather
      try {
        weatherRaw = await getWeather(city);
      } catch (error) {
        console.error("Weather fetch failed:", error);
        weatherRaw = { list: [] };
      }

      // City info
      try {
        info = await getCityInfo(city);
      } catch (error) {
        console.error("City info fetch failed:", error);
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

      // City images
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

      // Weather grouping
      const dailyMap = {};
      weatherRaw?.list?.forEach((item) => {
        const date = item.dt_txt?.split(" ")[0];
        if (date && !dailyMap[date]) {
          dailyMap[date] = item;
        }
      });

      const dailyWeather = Object.keys(dailyMap).map((date) => ({
        date,
        ...dailyMap[date],
      }));

      // Attraction images
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

  return { data, loading, searchCity };
};