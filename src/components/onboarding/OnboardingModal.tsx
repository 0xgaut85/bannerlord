"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Division } from "@prisma/client"
import { Button, Card, Input } from "@/components/ui"
import { COUNTRY_NAMES } from "@/lib/utils"

const countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
}))

const divisions: Division[] = ["A", "B", "C", "D", "E", "F"]

export function OnboardingModal() {
  const { data: session, update } = useSession()
  const router = useRouter()
  
  const [name, setName] = useState("")
  const [team, setTeam] = useState("")
  const [division, setDivision] = useState<Division | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Don't show if not logged in or if profile is already complete
  if (!session?.user || session.user.isProfileComplete) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !division) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          team: team.trim(), 
          division 
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      await update() // Refresh session
      router.refresh()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-semibold text-[#1a1a1a] mb-2">
            Complete Your Profile
          </h2>
          <p className="text-[#5a5a5a]">
            Please provide your Bannerlord details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="In-Game Name"
            placeholder="e.g. Harlaus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Clan / Team (Optional)"
            placeholder="e.g. Vlandian Knights"
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
                  type="button"
                  onClick={() => setDivision(d)}
                  className={`
                    py-3 rounded-xl font-semibold text-lg transition-all duration-200
                    ${division === d 
                      ? "bg-[#c9a962] text-white shadow-lg shadow-[#c9a962]/25 scale-105" 
                      : "bg-[#f5f5f5] text-[#5a5a5a] hover:bg-[#e5e5e5] hover:text-[#1a1a1a]"
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#8a8a8a]">
              Select your competitive division
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            isLoading={isLoading}
          >
            Start Rating
          </Button>
        </form>
      </Card>
    </div>
  )
}


