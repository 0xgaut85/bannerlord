"use client"

import { Card } from "@/components/ui"

export default function QAPage() {
  return (
    <div className="page-transition max-w-3xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Information
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1a1a1a] mb-3">
          How Rankings Work
        </h1>
        <p className="text-[#5a5a5a]">
          Everything you need to know about the voting system
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-display font-medium text-[#1a1a1a] mb-3">
            How is the score calculated?
          </h2>
          <p className="text-[#5a5a5a] leading-relaxed">
            Each player&apos;s score is calculated from the <span className="text-[#1a1a1a] font-medium">weighted average</span> of all eligible votes they have received. This ensures that votes from more experienced players (in higher divisions) carry more weight in the final ranking.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-display font-medium text-[#1a1a1a] mb-3">
            What are the vote weights?
          </h2>
          <div className="space-y-2 text-[#5a5a5a]">
            <p>The weight of a vote depends on the division of the voter:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division A</span>
                <span className="font-semibold text-[#c9a962]">100% weight</span>
              </li>
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division B</span>
                <span className="font-semibold text-[#c9a962]">90% weight</span>
              </li>
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division C</span>
                <span className="font-semibold text-[#c9a962]">80% weight</span>
              </li>
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division D</span>
                <span className="font-semibold text-[#c9a962]">70% weight</span>
              </li>
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division E</span>
                <span className="font-semibold text-[#c9a962]">60% weight</span>
              </li>
              <li className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-[#e5e5e5]">
                <span>Division F & lower</span>
                <span className="font-semibold text-[#c9a962]">50% weight</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-display font-medium text-[#1a1a1a] mb-3">
            Who is eligible to vote?
          </h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">
            To prevent manipulation and ensure quality rankings, a user&apos;s votes are only counted in the global ranking once they have rated a minimum number of players across all classes.
          </p>
          <div className="bg-[#1a1a1a] text-white p-4 rounded-lg">
            <p className="text-sm uppercase tracking-wider text-[#8a8a8a] mb-2">Requirements</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-display font-semibold text-[#c9a962]">10</div>
                <div className="text-xs text-[#8a8a8a]">Infantry</div>
              </div>
              <div>
                <div className="text-2xl font-display font-semibold text-[#c9a962]">5</div>
                <div className="text-xs text-[#8a8a8a]">Cavalry</div>
              </div>
              <div>
                <div className="text-2xl font-display font-semibold text-[#c9a962]">5</div>
                <div className="text-xs text-[#8a8a8a]">Archers</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-display font-medium text-[#1a1a1a] mb-3">
            Can I rate myself?
          </h2>
          <p className="text-[#5a5a5a] leading-relaxed">
            No. The system automatically detects if a player&apos;s name exactly matches your profile name or Discord name (case-insensitive) and will require you to skip that player. This prevents self-promotion and ensures fair rankings.
          </p>
        </Card>
      </div>
    </div>
  )
}

