"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui"
import { getTimeUntilEdit, formatTimeRemaining } from "@/lib/utils"

interface CooldownTimerProps {
  lastEditAt: Date | null | undefined
}

export function CooldownTimer({ lastEditAt }: CooldownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  
  useEffect(() => {
    const updateTimer = () => {
      const remaining = getTimeUntilEdit(lastEditAt ? new Date(lastEditAt) : null)
      setTimeRemaining(remaining)
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [lastEditAt])
  
  if (timeRemaining <= 0) {
    return null
  }
  
  return (
    <Card className="bg-[#c9a962]/10 border-[#c9a962]/30 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-[#c9a962]/20 rounded-xl">
          <span className="font-display text-xl font-semibold text-[#c9a962]">24h</span>
        </div>
        <div>
          <h3 className="font-medium text-[#a68b47]">Cooldown Active</h3>
          <p className="text-sm text-[#8a8a8a]">
            You can edit your ratings again in{" "}
            <span className="font-mono font-semibold text-[#c9a962]">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
