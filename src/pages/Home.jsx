import { useState } from "react";
import { useCityData } from "../hooks/useCityData";
import CityCard from "../components/CityCard";
import AttractionsList from "../components/AttractionsList";
import AttractionDetail from "../components/AttractionDetail";
import MapSection from "../components/MapSection";
import "../styles/app.css";

export default function Home() {
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchedTrip, setSearchedTrip] = useState(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [uiError, setUiError] = useState("");

  const { data, loading, searchCity, error } = useCityData();

  const handleSearch = async () => {
    if (!city.trim()) {
      setUiError("Please enter a city name.");
      return;
    }

    setUiError("");

    const today = new Date();
    const plus5 = new Date();
    plus5.setDate(today.getDate() + 5);

    const format = (d) => d.toISOString().split("T")[0];

    const finalStartDate = startDate || format(today);
    const finalEndDate = endDate || format(plus5);

    const start = new Date(finalStartDate);
    const end = new Date(finalEndDate);

    if (start > end) {
      setUiError("Start date cannot be after end date. Please adjust your selection.");
      return;
    }

    const result = await searchCity({
      city,
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

    if (!result) {
      setUiError("Unable to load city data. Please try again.");
      setSearchedTrip(null);
      setSelectedAttraction(null);
      return;
    }

    setSearchedTrip({
      destination: result.info?.title || result.info?.name || city.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
    });
    setSelectedAttraction(null);
  };

  const handleSelectAttraction = (attraction) => {
    setSelectedAttraction(attraction);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDisplayDate = (date) => {
    if (!date) return "Not selected";
    return new Date(date).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  return (
    <div>
      <div className="hero">
        <div className="container">
          <h1>🌍 Travel Dashboard</h1>
          <p>Search cities, explore weather and attractions instantly</p>

          <div className="search">
            <label className="search-field search-field-city">
              <span>City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter a city name..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </label>

            <label className="search-field">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="search-field">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      <div className="container">
        {uiError && (
          <div className="card alert">
            <p>{uiError}</p>
          </div>
        )}

        {error && !uiError && (
          <div className="card alert">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="card loading-state">
            <div className="loading-icon">🌍</div>
            <p>Loading your travel data...</p>
          </div>
        )}

        <div className="page">
          {data && searchedTrip && (
            <div className="card print-trip-summary">
              <h2>Travel Results</h2>
              <div className="trip-summary-grid">
                <p>
                  <strong>Destination:</strong> {searchedTrip.destination}
                </p>
                <p>
                  <strong>Travel from:</strong>{" "}
                  {formatDisplayDate(searchedTrip.startDate)}
                </p>
                <p>
                  <strong>Travel to:</strong>{" "}
                  {formatDisplayDate(searchedTrip.endDate)}
                </p>
              </div>
            </div>
          )}

          {data && (
            <div className="results-actions">
              <button className="print-button" onClick={handlePrint}>
                Print Results
              </button>
            </div>
          )}

          {data && (
            <div className="card">
              <h2>⛅ Weather Forecast</h2>

              {data.weather?.length ? (
                <div className="weather-grid">
                  {data.weather.map((day, i) => (
                    <div className="weather-card" key={i}>
                      <b>{day.date?.slice(5)}</b>
                      <p>{day.weather?.[0]?.description || "No description"}</p>
                      <h3>{day.main?.temp ?? "--"}°C</h3>
                      <small>Humidity: {day.main?.humidity ?? "--"}%</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No weather data available.</p>
              )}
            </div>
          )}

          {data && (
            <>
              <div className="card">
                <div className="city-attractions-grid">
                  <CityCard info={data.info} image={data.image} />
                </div>
              </div>

              <div className="card">
                <div className="attractions-card-panel">
                  <AttractionsList
                    attractions={data.attractions || []}
                    selectedAttractionId={selectedAttraction?.id}
                    onSelect={handleSelectAttraction}
                  />
                </div>
              </div>
            </>
          )}

          {selectedAttraction && (
            <div className="detail-section">
              <AttractionDetail attraction={selectedAttraction} />
            </div>
          )}

          {data?.attractions?.length > 0 && (
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
