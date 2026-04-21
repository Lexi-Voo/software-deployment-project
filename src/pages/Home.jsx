import { useState } from "react";
import { useCityData } from "../hooks/useCityData";
import CityCard from "../components/CityCard";
import AttractionsList from "../components/AttractionsList";

import "../styles/app.css";

export default function Home() {
  const [city, setCity] = useState("");
  const { data, loading, searchCity } = useCityData();

  const handleSearch = () => {
    if (city.trim()) {
      searchCity({ city });
    }
  };

  return (
    <div>
      <div className="hero">
        <div className="container">
          <h1>🌍 Travel Dashboard</h1>
          <p>Search cities, explore weather and attractions instantly</p>
        </div>
      </div>

      <div className="container">
        <div className="search">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="container">
          <p>Loading...</p>
        </div>
      )}

      <div className="container">
        <div className="page">
          {data && (
            <div className="card">
              <h2>🌦 Weather Forecast</h2>

              <div className="weather-grid">
                {data.weather.map((day, i) => (
                  <div className="weather-card" key={i}>
                    <b>{day.date.slice(5)}</b>
                    <p>{day.weather[0].description}</p>
                    <h3>{day.main.temp}°C</h3>
                    <small>Humidity: {day.main.humidity}%</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
              }}
            >
              <div className="card">
                <CityCard info={data.info} image={data.image} />
              </div>

              <div className="card">
                <AttractionsList attractions={data.attractions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}