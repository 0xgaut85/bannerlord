"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button, Card, Input, Badge } from "@/components/ui"
import { EligibilityProgress } from "@/components/rating"
import { Division } from "@prisma/client"

const divisions: Division[] = ["A", "B", "C", "D", "E", "F"]

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [team, setTeam] = useState("")
  const [division, setDivision] = useState<Division | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load current profile data
  useEffect(() => {
    if (session?.user) {
      setTeam(session.user.team || "")
      setDivision(session.user.division || "")
    }
  }, [session])
  
  const handleSave = async () => {
    if (!team.trim()) {
      setError("Please enter your team name")
      return
    }
    if (!division) {
      setError("Please select your division")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: team.trim(), division }),
      })
      
      if (!res.ok) {
        throw new Error("Failed to save profile")
      }
      
      // Update session
      await update()
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Authentication Required
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1a1a1a] mb-4">
          Sign in to View Profile
        </h1>
        <p className="text-[#5a5a5a] mb-10">
          Connect your Discord account to manage your profile
        </p>
        <Button onClick={() => signIn("discord")} size="lg" variant="primary">
          Sign in with Discord
        </Button>
      </div>
    )
  }
  
  // Loading
  if (status === "loading") {
    return (
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20">
        <div className="h-96 glass rounded-xl animate-pulse" />
      </div>
    )
  }
  
  return (
    <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4">
          Your Profile
        </p>
        <h1 className="font-display text-4xl font-semibold text-[#1a1a1a]">
          Profile Settings
        </h1>
      </div>
      
      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/30">
          {session?.user?.image ? (
            <Image 
              src={session.user.image} 
              alt="" 
              width={64}
              height={64}
              className="w-16 h-16 rounded-full ring-2 ring-white/50 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#c9a962]/20 flex items-center justify-center">
              <span className="font-display text-xl font-semibold text-[#c9a962]">
                {(session?.user?.discordName || session?.user?.name || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1a1a1a]">
              {session?.user?.discordName || session?.user?.name || "Unknown"}
            </h2>
            <p className="text-[#8a8a8a] text-sm">
              Connected via Discord
            </p>
          </div>
        </div>
        
        {/* Form */}
        <div className="space-y-5">
          <Input
            id="team"
            label="Team Name"
            placeholder="Enter your team name"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-3">
              Division
            </label>
            <div className="grid grid-cols-6 gap-2">
              {divisions.map((d) => (
                <button
                  key={d}
                  onClick={() => setDivision(d)}
                  className={`
                    py-3 rounded-xl font-semibold text-lg transition-all duration-300
                    ${division === d 
                      ? "glass-button-primary text-white" 
                      : "glass text-[#5a5a5a] hover:text-[#1a1a1a]"
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#8a8a8a]">
              Division affects your vote weight: A (100%) · B (75%) · C/D (50%) · E/F (25%)
            </p>
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-4 glass rounded-xl border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Success */}
          {isSaved && (
            <div className="p-4 glass rounded-xl border border-[#c9a962]/30 text-[#a68b47] text-sm">
              Profile saved successfully
            </div>
          )}
          
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="w-full"
            size="lg"
            variant="primary"
          >
            Save Profile
          </Button>
        </div>
      </Card>
      
      {/* Status */}
      {session?.user?.isProfileComplete && (
        <div className="text-center">
          <Badge variant="division" className="px-5 py-2">
            Profile Complete — Ready to Rate
          </Badge>
        </div>
      )}
    </div>
  )
}
