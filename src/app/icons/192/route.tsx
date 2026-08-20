import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          fontSize: 108,
        }}
      >
        🚕
      </div>
    ),
    {
      width: 192,
      height: 192,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
