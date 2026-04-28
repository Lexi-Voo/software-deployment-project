import { useEffect, useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

export default function CityCard({ info, image }) {
  const [imgSrc, setImgSrc] = useState(image || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(image || FALLBACK_IMAGE);
  }, [image]);

  if (!info) return null;
  
  return (
    <div
      className="city-card"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h2
        className="city-title"
        style={{
          background: "linear-gradient(135deg, #14b8a6, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {info.title || info.name}
      </h2>

      <div
        style={{
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          marginBottom: "16px",
          width: "100%",
          height: "260px",
          background: "#f3f4f6",
        }}
      >
        <img
          src={imgSrc}
          alt={info.title || info.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            transition: "transform 0.3s ease",
            background: "#f3f4f6",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      <p
        className="city-desc"
        style={{
          lineHeight: "1.7",
          fontSize: "15px",
          color: "#374151",
          textAlign: "left",
        }}
      >
        {info?.extract || info?.description || "No description available"}
      </p>
    </div>
  );
}