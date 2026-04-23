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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [uiError, setUiError] = useState("");

  const { data, loading, searchCity } = useCityData();

  const handleSearch = async () => {
    if (!city.trim()) return;

    setUiError("");

    const today = new Date();
    const plus5 = new Date();
    plus5.setDate(today.getDate() + 5);

    const format = (d) => d.toISOString().split("T")[0];

    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (!finalStartDate || !finalEndDate) {
      finalStartDate = format(today);
      finalEndDate = format(plus5);
    }

    const start = new Date(finalStartDate);
    const end = new Date(finalEndDate);

    if (start > end) {
      setUiError("Start date cannot be after end date. Please adjust your selection.");
      return;
    }

    await searchCity({
      city,
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

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
          <h1>
            🌍 Travel Dashboard
          </h1>
          <p>
            Search cities, explore weather and attractions instantly
          </p>

          <div className="search">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter a city name..."
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="container">

        {uiError && (
          <div className="card alert">
            <p>{uiError}</p>
          </div>
        )}

        {loading && (
          <div className="card loading-state">
            <div className="loading-icon">🌍</div>
            <p>Loading your travel data...</p>
          </div>
        )}

        <div className="page">

          {data && (
            <div className="card">
              <h2>⛅ Weather Forecast</h2>

              {data.weather?.length ? (
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
              ) : (
                <p>No weather data available</p>
              )}
            </div>
          )}

          {data && (
            <div className="city-attractions-grid">
              <div className="card">
                <CityCard info={data.info} image={data.image} />
              </div>

              <div className="card">
                <AttractionsList
                  attractions={data.attractions}
                  selectedAttractionId={selectedAttraction?.id}
                  onSelect={handleSelectAttraction}
                />
              </div>
            </div>
          )}

          {selectedAttraction && (
            <div className="detail-section">
              <AttractionDetail attraction={selectedAttraction} />
            </div>
          )}

          {data?.attractions?.length && (
            <div className="detail-section">
              <div className="card">
                <MapSection
                  attractions={data.attractions}
                  selectedAttraction={selectedAttraction}
                  onSelect={handleSelectAttraction}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}