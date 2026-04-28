import { useEffect, useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

export default function AttractionCard({
  attraction,
  index,
  isSelected,
  onSelect,
}) {
  const representativeImage =
    attraction.detailImage ||
    attraction.image ||
    attraction.photos?.[0] ||
    FALLBACK_IMAGE;

  const [imgSrc, setImgSrc] = useState(representativeImage);

  useEffect(() => {
    setImgSrc(representativeImage);
  }, [representativeImage]);

  return (
    <button
      onClick={() => onSelect(attraction)}
      style={{
        width: "430px",
        border: "none",
        background: "white",
        borderRadius: "12px",
        boxShadow: isSelected
          ? "0 8px 25px rgba(0,123,255,0.3)"
          : "0 4px 15px rgba(0,0,0,0.1)",
        padding: "10px",
        textAlign: "left",
        transition: "all 0.3s ease",
        cursor: "pointer",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        minHeight: "120px",
      }}
    >
      <img
        src={imgSrc}
        alt={attraction.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "contain",
          borderRadius: "8px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "#f3f4f6",
          display: "block",
        }}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
            lineHeight: "1.3",
          }}
        >
          {index + 1}. {attraction.name}
        </div>

        {attraction.briefIntro && (
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              lineHeight: "1.4",
              margin: 0,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {attraction.briefIntro}
          </p>
        )}
      </div>
    </button>
  );
}