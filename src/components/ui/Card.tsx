import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "silver" | "bronze"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.02] border border-white/[0.04]",
      gold: "bg-[#c9a962]/10 border border-[#c9a962]/20",
      silver: "bg-white/[0.04] border border-white/[0.06]",
      bronze: "bg-[#a67c52]/10 border border-[#a67c52]/20",
    }

    return (
      <div
        ref={ref}
        className={cn("rounded-xl p-6 transition-all duration-200", variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
