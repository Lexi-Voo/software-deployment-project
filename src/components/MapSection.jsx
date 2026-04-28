import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapSection({ attractions = [], selectedAttraction, onSelect }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      // Free OpenStreetMap raster tiles — no API key needed
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [101.6869, 3.139],
      zoom: 4,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const valid = attractions.filter((a) => a.lat != null && a.lng != null);

    valid.forEach((attraction, index) => {
      const isSelected = selectedAttraction?.id === attraction.id;

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: isSelected ? "#2563eb" : "#14b8a6",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "13px",
        border: "2px solid white",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3)"
          : "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });
      el.innerText = String(index + 1);

      el.addEventListener("click", () => onSelect(attraction));

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; max-width: 200px;">
          <strong style="font-size:14px;">${index + 1}. ${attraction.name}</strong>
          ${attraction.briefIntro ? `<p style="font-size:12px;margin:6px 0 0;color:#555;">${attraction.briefIntro}</p>` : ""}
          ${attraction.address ? `<p style="font-size:11px;margin:4px 0 0;color:#888;">${attraction.address}</p>` : ""}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([attraction.lng, attraction.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (selectedAttraction?.lng != null && selectedAttraction?.lat != null) {
      map.flyTo({ center: [selectedAttraction.lng, selectedAttraction.lat], zoom: 13, essential: true });
    } else if (valid.length > 0) {
      map.flyTo({ center: [valid[0].lng, valid[0].lat], zoom: 12, essential: true });
    }
  }, [attractions, selectedAttraction, onSelect]);

  return (
    <div>
      <h2>🗺️ Map</h2>
      <div ref={mapContainer} style={{ width: "100%", height: "450px", borderRadius: "12px" }} />
    </div>
  );
}