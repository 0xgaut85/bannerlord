// Utility functions for curated rankings

export const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

export function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

export function getTierFromRating(rating: number): string {
  if (rating >= 95) return "ICON"
  if (rating >= 92.5) return "S+"
  if (rating >= 90) return "S"
  if (rating >= 87.5) return "A+"
  if (rating >= 85) return "A"
  if (rating >= 82.5) return "B+"
  return "B"
}

// Curated card styling - Light Blue to Deep Purple spectrum with heavy grain
export function getCuratedCardStyle(rating: number) {
  if (rating >= 95) return {
    // ICON - Black with heavy gold gradient
    bg: "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 15%, #0d0d0d 30%, #1f1a0a 50%, #2a1f0a 65%, #1a1505 80%, #0a0a0a 100%)",
    border: "border-amber-400/80",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-100",
    subtext: "text-amber-300",
    noiseOpacity: 0.50,
    overlayGradient: "linear-gradient(180deg, rgba(251,191,36,0.25) 0%, rgba(217,119,6,0.15) 30%, transparent 60%, rgba(180,83,9,0.1) 100%)",
    boxBg: "bg-amber-500/30",
    tierColor: "text-amber-300",
    glowColor: "shadow-amber-500/60",
  }
  if (rating >= 92.5) return {
    // MYTHIC - Deep dark bright purple
    bg: "linear-gradient(145deg, #0a0510 0%, #1a0a2e 20%, #2d0a4a 40%, #4c0a7a 55%, #2d0a4a 70%, #1a0a2e 85%, #0a0510 100%)",
    border: "border-purple-400/70",
    accent: "from-purple-300 via-fuchsia-200 to-purple-300",
    text: "text-white",
    subtext: "text-purple-200",
    noiseOpacity: 0.48,
    overlayGradient: "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(192,38,211,0.15) 40%, transparent 70%)",
    boxBg: "bg-purple-500/25",
    tierColor: "text-purple-300",
    glowColor: "shadow-purple-500/50",
  }
  if (rating >= 90) return {
    // LEGENDARY - Dark purple
    bg: "linear-gradient(145deg, #0f0520 0%, #1e0a35 25%, #2a0f4a 50%, #1e0a35 75%, #0f0520 100%)",
    border: "border-purple-500/60",
    accent: "from-purple-200 via-violet-100 to-purple-200",
    text: "text-white",
    subtext: "text-purple-300",
    noiseOpacity: 0.42,
    overlayGradient: "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, transparent 50%, rgba(109,40,217,0.1) 100%)",
    boxBg: "bg-purple-600/20",
    tierColor: "text-purple-400",
    glowColor: "shadow-purple-600/40",
  }
  if (rating >= 87.5) return {
    // EPIC - Deep dark bright blue
    bg: "linear-gradient(145deg, #020617 0%, #0a1a3a 20%, #0f2a5a 40%, #1e40af 55%, #0f2a5a 70%, #0a1a3a 85%, #020617 100%)",
    border: "border-blue-400/70",
    accent: "from-blue-300 via-sky-200 to-blue-300",
    text: "text-white",
    subtext: "text-blue-200",
    noiseOpacity: 0.40,
    overlayGradient: "linear-gradient(180deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)",
    boxBg: "bg-blue-500/25",
    tierColor: "text-blue-300",
    glowColor: "shadow-blue-500/50",
  }
  if (rating >= 85) return {
    // RARE - Dark blue
    bg: "linear-gradient(145deg, #030712 0%, #0c1a35 25%, #152850 50%, #0c1a35 75%, #030712 100%)",
    border: "border-blue-500/55",
    accent: "from-blue-200 via-indigo-100 to-blue-200",
    text: "text-white",
    subtext: "text-blue-300",
    noiseOpacity: 0.38,
    overlayGradient: "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, transparent 50%, rgba(30,64,175,0.08) 100%)",
    boxBg: "bg-blue-600/20",
    tierColor: "text-blue-400",
    glowColor: "shadow-blue-600/35",
  }
  if (rating >= 82.5) return {
    // UNCOMMON - Deep light bright blue
    bg: "linear-gradient(145deg, #0a1929 0%, #0d3a5c 20%, #0e7490 40%, #22d3ee 55%, #0e7490 70%, #0d3a5c 85%, #0a1929 100%)",
    border: "border-cyan-400/60",
    accent: "from-cyan-300 via-sky-200 to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(34,211,238,0.2) 0%, rgba(14,165,233,0.15) 40%, transparent 70%)",
    boxBg: "bg-cyan-500/25",
    tierColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/45",
  }
  // COMMON - Light blue (below 82.5)
  return {
    bg: "linear-gradient(145deg, #0c4a6e 0%, #0891b2 25%, #67e8f9 50%, #0891b2 75%, #0c4a6e 100%)",
    border: "border-sky-300/50",
    accent: "from-sky-200 via-white to-sky-200",
    text: "text-white",
    subtext: "text-sky-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(125,211,252,0.15) 0%, transparent 50%)",
    boxBg: "bg-sky-400/20",
    tierColor: "text-sky-300",
    glowColor: "shadow-sky-400/30",
  }
}

