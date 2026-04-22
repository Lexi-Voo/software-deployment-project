export default function CityCard({ info, image }) {
  if (!info) return null;

  return (
    <div className="city-card" style={{ position: "relative", overflow: "hidden" }}>
      <h2 className="city-title" style={{ 
        background: "linear-gradient(135deg, #14b8a6, #6366f1)", 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        {info.title}
      </h2>

      {image && (
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          <img
            src={image}
            alt={info.title}
            className="city-image"
            style={{ transition: "transform 0.3s ease" }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          />
          <div style={{ 
            position: "absolute", 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: "60%", 
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" 
          }}></div>
        </div>
      )}

      <p className="city-desc" style={{ 
        lineHeight: "1.7", 
        fontSize: "15px", 
        color: "#374151",
        textAlign: "left"
      }}>
        {info?.extract || "No description available"}
      </p>
    </div>
  );
}