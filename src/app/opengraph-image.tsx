import { ImageResponse } from "next/og";

export const alt = "The Wall — your wardrobe, in view";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 78,
          color: "#191714",
          background: "linear-gradient(145deg, #d8d0c3, #f1ece3 48%, #c9beae)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 760 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase" }}>The Wall</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 42,
              fontFamily: "serif",
              fontSize: 92,
              lineHeight: 0.95,
            }}
          >
            <div>Your wardrobe,</div>
            <div>in view.</div>
          </div>
          <div style={{ marginTop: 34, color: "#625b52", fontSize: 26 }}>
            Browse. Build. Save the looks that work.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 238,
            height: 390,
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,.7)",
            borderRadius: 54,
            background: "rgba(255,255,255,.3)",
            boxShadow: "0 32px 60px rgba(49,42,33,.14)",
            fontFamily: "serif",
            fontSize: 150,
            fontStyle: "italic",
          }}
        >
          W
        </div>
      </div>
    ),
    size,
  );
}
