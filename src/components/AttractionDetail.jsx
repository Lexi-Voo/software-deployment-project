import { useEffect, useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

export default function AttractionDetail({ attraction }) {
  if (!attraction) return null;

  const image =
    attraction.detailImage ||
    attraction.photos?.[0] ||
    attraction.image ||
    FALLBACK_IMAGE;

  const [imgSrc, setImgSrc] = useState(image);

  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  const detailRows = [
    attraction.address && {
      icon: "📍",
      label: "Address",
      value: attraction.address,
    },
    attraction.openingHours && {
      icon: "🕒",
      label: "Hours",
      value: attraction.openingHours,
    },
    attraction.contactNumber &&
      attraction.contactNumber !== "Not available" && {
        icon: "📞",
        label: "Phone",
        value: attraction.contactNumber,
      },
    attraction.website &&
      attraction.website !== "Not available" && {
        icon: "🌐",
        label: "Website",
        value: attraction.website,
        isLink: true,
      },
    attraction.rating && {
      icon: "⭐",
      label: "Rating",
      value: attraction.reviewCount
        ? `${attraction.rating} / 5 (${attraction.reviewCount.toLocaleString()} reviews)`
        : `${attraction.rating} / 5`,
    },
    attraction.price && {
      icon: "💰",
      label: "Price",
      value: attraction.price,
    }
  ].filter(Boolean);

  const hasDetails = detailRows.length > 0;
  const hasDescription =
    attraction.description && attraction.description.trim() !== "";

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#fafaf8",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          height: "320px",
        }}
      >
        <img
          src={imgSrc}
          alt={attraction.name}
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            background: "#f3f4f6",
          }}
        />
      </div>

      <div style={{ padding: "16px 4px 0" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "26px",
            fontWeight: "400",
            letterSpacing: "-0.3px",
            lineHeight: "1.2",
            color: "#1fa8a1",
          }}
        >
          {attraction.name}
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "24px 0 0",
        }}
      >
        {hasDescription && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "20px",
            }}
          >
            <Label>About</Label>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "14px",
                lineHeight: "1.75",
                color: "#555",
              }}
            >
              {attraction.description}
            </p>
          </div>
        )}

        {hasDetails && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "20px",
            }}
          >
            <Label>Details</Label>
            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {detailRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fafaf8",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "sans-serif",
                      fontWeight: "700",
                      color: "#1fa8a1",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    {row.icon} {row.label}
                  </div>

                  {row.isLink ? (
                    <a
                      href={row.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        textDecoration: "none",
                        borderBottom: "1px solid #ccc",
                        wordBreak: "break-all",
                        lineHeight: "1.5",
                      }}
                    >
                      {row.value}
                    </a>
                  ) : (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        lineHeight: "1.5",
                      }}
                    >
                      {row.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "10px",
          fontFamily: "sans-serif",
          fontWeight: "700",
          color: "#1fa8a1",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#ececec" }} />
    </div>
  );
}