import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapSection({
  attractions = [],
  selectedAttraction,
  onSelect,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
      center: [101.6869, 3.139], // default fallback
      zoom: 4,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const validAttractions = attractions.filter(
      (a) => a.lng != null && a.lat != null
    );

    validAttractions.forEach((attraction, index) => {
      const isSelected = selectedAttraction?.id === attraction.id;

      const el = document.createElement("div");
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.background = isSelected ? "#2563eb" : "#ef4444";
      el.style.color = "white";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontWeight = "bold";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
      el.innerText = String(index + 1);

      el.addEventListener("click", () => onSelect(attraction));

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div>
          <strong>${index + 1}. ${attraction.name}</strong>
          ${attraction.briefIntro ? `<p>${attraction.briefIntro}</p>` : ""}
          ${attraction.address ? `<p>${attraction.address}</p>` : ""}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([attraction.lng, attraction.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (selectedAttraction?.lng != null && selectedAttraction?.lat != null) {
      map.flyTo({
        center: [selectedAttraction.lng, selectedAttraction.lat],
        zoom: 13,
        essential: true,
      });
    } else if (validAttractions.length > 0) {
      map.flyTo({
        center: [validAttractions[0].lng, validAttractions[0].lat],
        zoom: 12,
        essential: true,
      });
    }
  }, [attractions, selectedAttraction, onSelect]);

  return (
    <div>
      <h2>🗺️ Map</h2>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "450px", borderRadius: "12px" }}
      />
    </div>
  );
}