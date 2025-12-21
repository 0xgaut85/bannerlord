import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "silver" | "bronze" | "division" | "secondary" | "outline"
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/60 text-[#5a5a5a] border border-white/50 backdrop-blur-sm",
      gold: "bg-[#c9a962]/20 text-[#a68b47] border border-[#c9a962]/30",
      silver: "bg-[#8a8a8a]/20 text-[#5a5a5a] border border-[#8a8a8a]/30",
      bronze: "bg-[#a67c52]/20 text-[#8b5a2b] border border-[#a67c52]/30",
      division: "bg-[#c9a962] text-white border border-[#c9a962]",
      secondary: "bg-[#8a8a8a]/10 text-[#5a5a5a] border border-[#8a8a8a]/20",
      outline: "bg-transparent text-[#8a8a8a] border border-[#8a8a8a]/40",
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"
