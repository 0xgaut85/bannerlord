"use client"

import { EligibilityStatus } from "@/types"
import { Card } from "@/components/ui"
import { cn } from "@/lib/utils"

interface EligibilityProgressProps {
  status: EligibilityStatus
}

export function EligibilityProgress({ status }: EligibilityProgressProps) {
  const categories = [
    { 
      key: "infantry" as const, 
      label: "Infantry", 
      color: "text-[#c9a962]",
      bgColor: "bg-[#c9a962]"
    },
    { 
      key: "cavalry" as const, 
      label: "Cavalry", 
      color: "text-[#5a5a5a]",
      bgColor: "bg-[#5a5a5a]"
    },
    { 
      key: "archer" as const, 
      label: "Archers", 
      color: "text-[#a67c52]",
      bgColor: "bg-[#a67c52]"
    },
  ]
  
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
