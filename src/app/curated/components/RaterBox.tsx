"use client"

import { cn } from "@/lib/utils"
import { CuratedRating } from "../types"

interface RaterBoxProps {
  raterName: string
  raterData: CuratedRating | undefined
  isMe: boolean
  isLeft: boolean // Left side or right side of the card
  // For the current user
  myRating: string
  myNote: string
  myConfirmed: boolean
  submittingRating: boolean
  onRatingChange: (value: string) => void
  onNoteChange: (value: string) => void
  onNoteBlur: () => void
  onConfirm: () => void
  onEdit: () => void
}

export function RaterBox({
  raterName,
  raterData,
  isMe,
  isLeft,
  myRating,
  myNote,
  myConfirmed,
  submittingRating,
  onRatingChange,
  onNoteChange,
  onNoteBlur,
  onConfirm,
  onEdit,
}: RaterBoxProps) {
  const isRaterConfirmed = raterData?.confirmed ?? false

  if (isLeft) {
    // Left side layout: Name | Box | Button
    return (
      <div className="flex flex-col items-end gap-1.5">
        {/* Rater row */}
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-base font-semibold w-28 text-right",
            isMe ? "text-violet-400" : "text-white/60"
          )}>
            {raterName} {isMe && "★"}
          </span>
          <div className={cn(
            "w-20 h-12 rounded-xl border-2 flex items-center justify-center transition-colors",
            isRaterConfirmed 
              ? "border-green-500 bg-green-500/20" 
              : raterData?.score 
                ? "border-red-500 bg-red-500/20" 
                : "border-white/20 bg-black/40"
          )}>
            {isMe && !myConfirmed ? (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="--"
                value={myRating}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                  onRatingChange(val)
                }}
                disabled={submittingRating}
                className="w-full h-full bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder-white/30"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {isMe ? myRating || "—" : (raterData?.score ?? "—")}
              </span>
            )}
          </div>
          {isMe ? (
            !myConfirmed ? (
              <button
                onClick={onConfirm}
                disabled={!myRating || submittingRating}
                className="w-10 h-10 text-lg font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center"
              >
                ✓
              </button>
            ) : (
              <button
                onClick={onEdit}
                disabled={submittingRating}
                className="w-10 h-10 text-lg font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors flex items-center justify-center"
              >
                ✎
              </button>
            )
          ) : (
            <div className="w-10" />
          )}
        </div>
        {/* Note box below each rater */}
        <div className="w-full max-w-[280px]">
          {isMe ? (
            <textarea
              placeholder="Your note..."
              value={myNote}
              onChange={(e) => onNoteChange(e.target.value.slice(0, 280))}
              onBlur={onNoteBlur}
              disabled={myConfirmed}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none h-16",
                myConfirmed ? "bg-green-500/10 border border-green-500/40" : "bg-black/30 border border-violet-500/20 focus:border-violet-500"
              )}
            />
          ) : (
            <div className={cn(
              "w-full px-3 py-2 rounded-lg text-sm h-16 overflow-hidden",
              raterData?.note ? "bg-black/20 text-white/50 italic" : "bg-black/10 text-white/20"
            )}>
              {raterData?.note ? `"${raterData.note}"` : "No note"}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Right side layout: Button | Box | Name
  return (
    <div className="flex flex-col items-start gap-1.5">
      {/* Rater row */}
      <div className="flex items-center gap-3">
        {isMe ? (
          !myConfirmed ? (
            <button
              onClick={onConfirm}
              disabled={!myRating || submittingRating}
              className="w-10 h-10 text-lg font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center"
            >
              ✓
            </button>
          ) : (
            <button
              onClick={onEdit}
              disabled={submittingRating}
              className="w-10 h-10 text-lg font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors flex items-center justify-center"
            >
              ✎
            </button>
          )
        ) : (
          <div className="w-10" />
        )}
        <div className={cn(
          "w-20 h-12 rounded-xl border-2 flex items-center justify-center transition-colors",
          isRaterConfirmed 
            ? "border-green-500 bg-green-500/20" 
            : raterData?.score 
              ? "border-red-500 bg-red-500/20" 
              : "border-white/20 bg-black/40"
        )}>
          {isMe && !myConfirmed ? (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="--"
              value={myRating}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                onRatingChange(val)
              }}
              disabled={submittingRating}
              className="w-full h-full bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder-white/30"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {isMe ? myRating || "—" : (raterData?.score ?? "—")}
            </span>
          )}
        </div>
        <span className={cn(
          "text-base font-semibold w-28",
          isMe ? "text-violet-400" : "text-white/60"
        )}>
          {isMe && "★ "}{raterName}
        </span>
      </div>
      {/* Note box below each rater */}
      <div className="w-full max-w-[280px] ml-13">
        {isMe ? (
          <textarea
            placeholder="Your note..."
            value={myNote}
            onChange={(e) => onNoteChange(e.target.value.slice(0, 280))}
            onBlur={onNoteBlur}
            disabled={myConfirmed}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none h-16",
              myConfirmed ? "bg-green-500/10 border border-green-500/40" : "bg-black/30 border border-violet-500/20 focus:border-violet-500"
            )}
          />
        ) : (
          <div className={cn(
            "w-full px-3 py-2 rounded-lg text-sm h-16 overflow-hidden",
            raterData?.note ? "bg-black/20 text-white/50 italic" : "bg-black/10 text-white/20"
          )}>
            {raterData?.note ? `"${raterData.note}"` : "No note"}
          </div>
        )}
      </div>
    </div>
  )
}

