export default function CityCard({ info, image }) {
  if (!info) return null;

  return (
    <div className="city-card">
      <h2 className="city-title">{info.title}</h2>

      {image && (
        <img
          src={image}
          alt={info.title}
          className="city-image"
        />
      )}

      <p className="city-desc">
        {info?.extract || "No description available"}
      </p>
    </div>
  );
}