"use client"

import { EligibilityStatus } from "@/types"
import { Card } from "@/components/ui"
import { cn } from "@/lib/utils"

interface EligibilityProgressProps {
  status: EligibilityStatus
  dark?: boolean
}

export function EligibilityProgress({ status, dark }: EligibilityProgressProps) {
  const categories = [
    { 
      key: "infantry" as const, 
      label: "Infantry", 
      color: "text-amber-500",
      bgColor: "bg-amber-500"
    },
    { 
      key: "cavalry" as const, 
      label: "Cavalry", 
      color: "text-slate-400",
      bgColor: "bg-slate-400"
    },
    { 
      key: "archer" as const, 
      label: "Archers", 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500"
    },
  ]
  
  if (dark) {
    return (
      <div className="flex items-center gap-6 text-sm">
        {categories.map((cat) => {
          const data = status[cat.key]
          const isComplete = data.current >= data.required
          
          return (
            <div key={cat.key} className="flex items-center gap-2">
              <span className={cn("font-medium", isComplete ? cat.color : "text-white/50")}>
                {cat.label}:
              </span>
              <span className={cn("font-semibold", isComplete ? cat.color : "text-white/70")}>
                {data.current}/{data.required}
              </span>
              {isComplete && <span className="text-green-400">✓</span>}
            </div>
          )
        })}
        {status.isEligible && (
          <span className="text-green-400 font-medium ml-auto">
            ✨ Your list counts!
          </span>
        )}
      </div>
    )
  }
  
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-[#1a1a1a]">Eligibility Progress</h3>
        {status.isEligible ? (
          <span className="text-sm text-[#c9a962] font-medium">
            Your list counts
          </span>
        ) : (
          <span className="text-sm text-[#8a8a8a]">
            Complete all requirements
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {categories.map((cat) => {
          const data = status[cat.key]
          const percentage = Math.min((data.current / data.required) * 100, 100)
          const isComplete = data.current >= data.required
          
          return (
            <div key={cat.key} className="text-center">
              <div className={cn(
                "text-sm font-medium mb-2",
                isComplete ? cat.color : "text-[#8a8a8a]"
              )}>
                {cat.label}
              </div>
              <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
                <div 
                  className={cn("h-full transition-all duration-500 rounded-full", cat.bgColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className={cn(
                "text-xs font-medium",
                isComplete ? cat.color : "text-[#8a8a8a]"
              )}>
                {data.current} / {data.required}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
