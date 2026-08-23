import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 112,
          color: "#f5f1e9",
          background: "#191714",
          fontFamily: "serif",
          fontSize: 268,
          fontStyle: "italic",
        }}
      >
        W
      </div>
    ),
    size,
  );
}
