export default function AttractionsList({ attractions }) {
  if (!attractions?.length) return null;

  return (
    <div>
      <h2>Top Attractions</h2>

      <ul className="attractions-list">
        {attractions.map((item, i) => (
          <li
            key={i}
            className="attraction-row"
            tabIndex={0}
          >
            {/* IMAGE */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="attraction-thumb"
              />
            ) : (
              <div className="attraction-thumb placeholder" />
            )}

            {/* TEXT */}
            <div className="attraction-content">
              <span className="attraction-name">{item.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}