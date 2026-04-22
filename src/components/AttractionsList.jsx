import AttractionCard from "./AttractionCard";

export default function AttractionsList({
  attractions = [],
  selectedAttractionId,
  onSelect,
}) {
  if (!attractions.length) {
    return (
      <div>
        <h2>⭐ Top Attractions</h2>
        <p>No attractions found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px", color: "#333" }}>⭐ Top Attractions</h2>

      <div style={{ 
        display: "flex", 
        gap: "16px", 
        overflowX: "auto", 
        padding: "10px 0",
        scrollbarWidth: "thin",
        scrollbarColor: "#ccc transparent"
      }}
      className="scrollable-attractions"
      >
        {attractions.map((attraction, index) => (
          <div 
            key={attraction.id || `${attraction.name}-${index}`} 
            style={{ 
              minWidth: "280px", 
              flexShrink: 0,
              transition: "transform 0.2s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <AttractionCard
              attraction={attraction}
              index={index}
              isSelected={attraction.id === selectedAttractionId}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}