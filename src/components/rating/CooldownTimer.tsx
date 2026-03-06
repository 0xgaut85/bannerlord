"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui"
import { getTimeUntilEdit, formatTimeRemaining } from "@/lib/utils"

interface CooldownTimerProps {
  lastEditAt: Date | null | undefined
  dark?: boolean
}

export function CooldownTimer({ lastEditAt, dark }: CooldownTimerProps) {
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
  
  if (dark) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#888] mt-2">
        <span>⏱️ Cooldown:</span>
        <span className="font-mono font-semibold text-white">
          {formatTimeRemaining(timeRemaining)}
        </span>
      </div>
    )
  }
  
  return (
    <Card className="bg-white/[0.05] border border-white/[0.04] mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-white/[0.05] rounded-xl">
          <span className="font-display text-xl font-semibold text-white">24h</span>
        </div>
        <div>
          <h3 className="font-medium text-white">Cooldown Active</h3>
          <p className="text-sm text-[#888]">
            You can edit your ratings again in{" "}
            <span className="font-mono font-semibold text-white">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
