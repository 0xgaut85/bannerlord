import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "silver" | "bronze"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "glass",
      gold: cn(
        "bg-gradient-to-br from-[#c9a962]/20 via-white/70 to-[#c9a962]/10",
        "backdrop-blur-xl border-2 border-[#c9a962]/40",
        "shadow-lg shadow-[#c9a962]/10"
      ),
      silver: cn(
        "bg-gradient-to-br from-[#8a8a8a]/20 via-white/70 to-[#8a8a8a]/10",
        "backdrop-blur-xl border-2 border-[#8a8a8a]/40",
        "shadow-lg shadow-[#8a8a8a]/10"
      ),
      bronze: cn(
        "bg-gradient-to-br from-[#a67c52]/20 via-white/70 to-[#a67c52]/10",
        "backdrop-blur-xl border-2 border-[#a67c52]/40",
        "shadow-lg shadow-[#a67c52]/10"
      ),
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
