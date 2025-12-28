"use client"

import { Flag } from "@/components/ui"
import { cleanPlayerName } from "@/lib/utils"
import { PlayerNotes } from "../types"

interface PlayerNotesModalProps {
  notes: PlayerNotes
  onClose: () => void
}

export function PlayerNotesModal({ notes, onClose }: PlayerNotesModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-violet-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                {notes.player.nationality && (
                  <Flag code={notes.player.nationality} size="md" />
                )}
                <div>
                  <h2 className="text-2xl font-display text-white">
                    {cleanPlayerName(notes.player.name)}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    {notes.player.category} · {notes.player.clan || "FA"}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right mr-4">
              <div className="text-3xl font-bold text-violet-400">
                {Math.round(notes.player.rating)}
              </div>
              <div className="text-white/50 text-xs">
                Curated Rating
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-semibold text-white mb-4">
            Rater Comments ({notes.ratings.filter(r => r.note).length})
          </h3>
          
          {notes.ratings.length === 0 ? (
            <p className="text-white/50 text-center py-8">No ratings yet</p>
          ) : (
            <div className="space-y-4">
              {notes.ratings.map(rating => (
                <div 
                  key={rating.id}
                  className="bg-black/30 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-violet-400 font-semibold">
                      {rating.raterName}
                    </span>
                    <div className="flex items-center gap-2">
                      {rating.score && (
                        <span className="text-white font-bold">
                          {rating.score}
                        </span>
                      )}
                      <span className="text-white/30 text-xs">
                        {new Date(rating.sessionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {rating.note ? (
                    <p className="text-white/70 text-sm italic">
                      &quot;{rating.note}&quot;
                    </p>
                  ) : (
                    <p className="text-white/30 text-sm">No comment</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

