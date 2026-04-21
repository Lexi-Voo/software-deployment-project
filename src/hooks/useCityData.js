import { useState } from "react";
import { getWeather } from "../services/weatherService";
import { getCityInfo } from "../services/wikiService";
import { getAttractions } from "../services/wikidataService";
import { getCityImages } from "../services/unsplashService";

export const useCityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchCity = async ({ city }) => {
    setLoading(true);

    try {
      const weatherRaw = await getWeather(city);
      const info = await getCityInfo(city);
      const rawAttractions = await getAttractions(city);
      const images = await getCityImages(city);

      const safeImages = Array.isArray(images) ? images : [];

      // WEATHER GROUP
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

      const attractions = Array.isArray(rawAttractions)
        ? Array.from(
            new Map(
              rawAttractions
                .map((i) => ({
                  name: i.placeLabel?.value,
                  image: i.image?.value || null,
                }))
                .filter((i) => i.name)
                .map((item) => [item.name, item])
            ).values()
          ).slice(0, 6)
        : [];

      const image =
        safeImages.length > 0
          ? safeImages[Math.floor(Math.random() * safeImages.length)]?.urls?.regular
          : null;

      setData({
        weather: dailyWeather,
        info,
        attractions,
        image,
      });
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, searchCity };
};