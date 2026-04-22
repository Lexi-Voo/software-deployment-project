export default function AttractionCard({
  attraction,
  index,
  isSelected,
  onSelect,
}) {
  const representativeImage =
    attraction.image ||
    attraction.photos?.[0] ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

  return (
    <button 
      onClick={() => onSelect(attraction)} 
      style={{ 
        width: "100%", 
        border: "none", 
        background: "white", 
        borderRadius: "12px", 
        boxShadow: isSelected ? "0 8px 25px rgba(0,123,255,0.3)" : "0 4px 15px rgba(0,0,0,0.1)", 
        padding: "12px", 
        textAlign: "left",
        transition: "all 0.3s ease",
        cursor: "pointer",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        minHeight: "120px"
      }}
    >
      <img
        src={representativeImage}
        alt={attraction.name}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "8px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px", color: "#333" }}>
            {index + 1}. {attraction.name}
          </div>
          {attraction.briefIntro && (
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.3", margin: 0 }}>
              {attraction.briefIntro.length > 80 ? `${attraction.briefIntro.substring(0, 80)}...` : attraction.briefIntro}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}