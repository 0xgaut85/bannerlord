"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useDebounce } from "@/hooks/useDebounce"
import { Division } from "@prisma/client"

interface SearchResult {
  id: string
  name: string | null
  discordName: string | null
  team: string | null
  division: Division | null
  image: string | null
  _count: {
    ratings: number
  }
}

interface UserSearchProps {
  onSelectUser: (userId: string) => void
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  
  useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }
      
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    search()
  }, [debouncedQuery])
  
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for a user..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      />
      
      {(results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-slate-800 rounded-xl border border-white/20 p-2 max-h-80 overflow-y-auto shadow-xl">
          {isLoading ? (
            <div className="py-6 text-center text-white/40">
              Searching...
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id)
                    setQuery("")
                    setResults([])
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  {user.image ? (
                    <Image 
                      src={user.image} 
                      alt="" 
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-amber-500">
                        {(user.discordName || user.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {user.discordName || user.name || "Unknown"}
                    </div>
                    <div className="text-sm text-white/50 flex items-center gap-2">
                      {user.team && <span>{user.team}</span>}
                      {user.division && (
                        <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-xs font-medium">
                          Div {user.division}
                        </span>
                      )}
                      <span>{user._count.ratings} ratings</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
