"use client"

import { useState } from "react"
import { UserSearch, UserRatingsList } from "@/components/players"

export default function PlayersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Player Lists
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
            Users Rankings
          </h1>
          <p className="text-white/60">
            Find users and view their rating lists
          </p>
        </div>
        
        {selectedUserId ? (
          <UserRatingsList 
            userId={selectedUserId} 
            onBack={() => setSelectedUserId(null)} 
          />
        ) : (
          <>
            {/* Search */}
            <div className="mb-8">
              <UserSearch onSelectUser={setSelectedUserId} />
            </div>
            
            {/* Empty state */}
            <div className="text-center py-20 text-white/40">
              <p className="font-display text-xl mb-2">Search for a user</p>
              <p className="text-sm">
                Enter at least 2 characters to search
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
