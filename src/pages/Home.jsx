import { useState } from "react";
import { useCityData } from "../hooks/useCityData";
import { getAttractionDetails } from "../services/geoapifyService";
import CityCard from "../components/CityCard";
import AttractionsList from "../components/AttractionsList";
import AttractionDetail from "../components/AttractionDetail";
import MapSection from "../components/MapSection";
import "../styles/app.css";

export default function Home() {
  const [city, setCity] = useState("");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const { data, loading, searchCity } = useCityData();

  const handleSearch = async () => {
    if (!city.trim()) return;
    await searchCity({ city });
    setSelectedAttraction(null);
  };

  const handleSelectAttraction = async (attraction) => {
    try {
      const fullDetails = await getAttractionDetails(
        attraction.id,
        attraction.image
      );

      setSelectedAttraction({
        ...attraction,
        ...fullDetails,
        photos:
          fullDetails.photos?.length > 0
            ? fullDetails.photos
            : attraction.photos || [],
      });
    } catch (error) {
      console.error("Failed to load attraction details:", error);
      setSelectedAttraction(attraction);
    }
  };

  return (
    <div>
      <div className="hero">
        <div className="container">
          <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "16px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
            🌍 Travel Dashboard
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.9, marginBottom: "32px" }}>
            Search cities, explore weather and attractions instantly
          </p>
          <div className="search" style={{ animation: "fadeInUp 0.8s ease-out" }}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter a city name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              style={{ fontSize: "16px", padding: "12px 16px" }}
            />
            <button onClick={handleSearch} style={{ fontSize: "16px", padding: "12px 24px" }}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "16px" }}>🌍</div>
            <p style={{ fontSize: "18px", color: "var(--muted)" }}>Loading your travel data...</p>
          </div>
        )}

        <div className="page">
          {data && (
            <div className="card">
              <h2> ⛅ Weather Forecast</h2>
              <div className="weather-grid">
                {data.weather.map((day, i) => (
                  <div className="weather-card" key={i}>
                    <b>{day.date.slice(5)}</b>
                    <p>{day.weather?.[0]?.description}</p>
                    <h3>{day.main?.temp}°C</h3>
                    <small>Humidity: {day.main?.humidity}%</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && (
            <div className="city-attractions-grid">
              <div className="card city-card-panel">
                <CityCard info={data.info} image={data.image} />
              </div>

              <div className="card attractions-card-panel">
                <AttractionsList
                  attractions={data.attractions}
                  selectedAttractionId={selectedAttraction?.id}
                  onSelect={handleSelectAttraction}
                />
              </div>
            </div>
          )}

          {selectedAttraction ? (
            <div style={{ marginTop: "20px" }}>
              <AttractionDetail attraction={selectedAttraction} />
            </div>
          ) : null}

          {data?.attractions?.length ? (
            <div style={{ marginTop: "20px" }}>
              <div className="card">
                <MapSection
                  attractions={data.attractions}
                  selectedAttraction={selectedAttraction}
                  onSelect={handleSelectAttraction}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}