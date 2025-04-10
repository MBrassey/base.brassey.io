import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#000102",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Background hexagon grid pattern */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                border: "1px solid #4B7F9B",
                margin: "1px",
              }}
            />
          ))}
      </div>

      {/* Main block element */}
      <div
        style={{
          width: "20px",
          height: "20px",
          background: "#4B7F9B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(45deg)",
          boxShadow: "0 0 5px rgba(75, 127, 155, 0.5)",
        }}
      >
        {/* Inner chain link */}
        <div
          style={{
            width: "10px",
            height: "10px",
            border: "2px solid #000102",
          }}
        />
      </div>

      {/* Connecting line element */}
      <div
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#4B7F9B",
          bottom: "4px",
          right: "4px",
        }}
      />
    </div>,
    {
      ...size,
      emoji: "twemoji",
    },
  )
}

