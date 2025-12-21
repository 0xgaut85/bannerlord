"use client"

import { useState } from "react"
import { UserSearch, UserRatingsList } from "@/components/players"

export default function PlayersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  return (
    <div className="page-transition max-w-4xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#5a5a5a] mb-4">
          Player Lists
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1a1a1a] mb-3">
          Search Players
        </h1>
        <p className="text-[#5a5a5a]">
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
          <div className="text-center py-20 text-[#8a8a8a]">
            <p className="font-display text-xl mb-2">Search for a user</p>
            <p className="text-sm">
              Enter at least 2 characters to search
            </p>
          </div>
        </>
      )}
    </div>
  )
}
