"use client"

import { Tab, RATER_NAMES } from "../types"

interface CodeEntryScreenProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  accessCode: string
  setAccessCode: (code: string) => void
  codeError: string
  onSubmit: () => void
}

export function CodeEntryScreen({
  activeTab,
  setActiveTab,
  accessCode,
  setAccessCode,
  codeError,
  onSubmit,
}: CodeEntryScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header with tabs */}
      <div className="text-center py-12 sm:py-16">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4">
          Expert Selection
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-8">
          Curated Rankings
        </h1>
        
        {/* Tabs */}
        <div className="flex justify-center gap-2 px-4">
          <button
            onClick={() => setActiveTab("rankings")}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-white/10 text-white/70 hover:bg-white/20"
          >
            Rankings
          </button>
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-violet-500 text-white shadow-xl"
          >
            Rate
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-md w-full">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
            Rater Access Required
          </p>
          <p className="text-white/50 text-center mb-8">
            Enter your access code to rate players
          </p>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter access code..."
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 text-center text-lg tracking-widest"
            />
            {codeError && (
              <p className="text-red-400 text-center text-sm">{codeError}</p>
            )}
            <button
              onClick={onSubmit}
              className="w-full py-3 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-xl transition-all shadow-xl"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SlotSelectionScreenProps {
  onSelectSlot: (slot: string) => void
  onViewRankings: () => void
}

export function SlotSelectionScreen({ onSelectSlot, onViewRankings }: SlotSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-lg w-full">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
          Rater Mode
        </p>
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          ⭐ Select Your Slot
        </h1>
        <p className="text-white/50 text-center mb-8">
          Choose which rater position you are
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {RATER_NAMES.slice(0, 9).map((slot, index) => (
            <button
              key={slot}
              onClick={() => onSelectSlot(slot)}
              className="px-4 py-4 bg-white/5 hover:bg-violet-500/30 border border-white/10 hover:border-violet-500/50 rounded-xl text-white font-medium transition-all text-lg"
            >
              Rater {index + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={onViewRankings}
          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
        >
          View Rankings Instead
        </button>
      </div>
    </div>
  )
}

interface NameEntryScreenProps {
  isStreamer: boolean
  selectedSlot: string
  customName: string
  setCustomName: (name: string) => void
  onContinue: () => void
  onBack: () => void
  onViewRankings: () => void
}

export function NameEntryScreen({
  isStreamer,
  selectedSlot,
  customName,
  setCustomName,
  onContinue,
  onBack,
  onViewRankings,
}: NameEntryScreenProps) {
  const slotIndex = RATER_NAMES.indexOf(selectedSlot) + 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-md w-full">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
          {isStreamer ? "Streamer Mode" : `Rater ${slotIndex}`}
        </p>
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isStreamer ? "🎬 Welcome Streamer" : "✏️ Enter Your Name"}
        </h1>
        <p className="text-white/50 text-center mb-8">
          {isStreamer ? "You'll be shown as the Streamer" : "This name will be displayed next to your ratings"}
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 text-lg"
          />
          <button
            onClick={onContinue}
            disabled={!customName.trim()}
            className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed shadow-xl"
          >
            Continue
          </button>
          {!isStreamer && (
            <button
              onClick={onBack}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              ← Back to Slot Selection
            </button>
          )}
          <button
            onClick={onViewRankings}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-all"
          >
            View Rankings Instead
          </button>
        </div>
      </div>
    </div>
  )
}

