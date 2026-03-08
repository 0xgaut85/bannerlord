"use client"

type OverlayVariant = "ruby" | "gold" | "legend"

const variantConfig = {
  ruby: {
    conic: "ruby-conic",
    radial: "ruby-radial",
    shimmer: "ruby-shimmer",
    noise: "ruby-noise",
    conicOpacity: 0.35,
    pulseColor: "rgba(220,40,60,0.2)",
    pulseColorInner: "rgba(139,0,0,0.1)",
  },
  gold: {
    conic: "gold-conic",
    radial: "gold-radial",
    shimmer: "gold-shimmer",
    noise: "ruby-noise",
    conicOpacity: 0.3,
    pulseColor: "rgba(255,223,0,0.15)",
    pulseColorInner: "rgba(200,170,0,0.08)",
  },
  legend: {
    conic: "legend-conic",
    radial: "legend-radial",
    shimmer: "legend-shimmer",
    noise: "ruby-noise",
    conicOpacity: 0.25,
    pulseColor: "rgba(192,168,120,0.15)",
    pulseColorInner: "rgba(140,120,80,0.08)",
  },
}

export function HolographicOverlay({ variant = "ruby" }: { variant?: OverlayVariant }) {
  const cfg = variantConfig[variant]

  return (
    <>
      <div
        className={`absolute inset-0 ${cfg.conic} pointer-events-none z-[5] rounded-[inherit]`}
        style={{ mixBlendMode: "color-dodge", opacity: cfg.conicOpacity }}
      />
      <div
        className={`absolute inset-0 ${cfg.radial} pointer-events-none z-[6] rounded-[inherit]`}
        style={{ mixBlendMode: "overlay" }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[7] rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse at 60% 70%, ${cfg.pulseColor} 0%, ${cfg.pulseColorInner} 40%, transparent 70%)`,
          mixBlendMode: "screen",
          animation: "rubyPulse 3s ease-in-out infinite",
        }}
      />
      <div
        className={`absolute inset-0 ${cfg.noise} pointer-events-none z-[8] rounded-[inherit]`}
        style={{ mixBlendMode: "overlay" }}
      />
    </>
  )
}
