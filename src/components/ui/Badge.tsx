import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "silver" | "bronze" | "division" | "secondary" | "outline"
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.06] text-[#888] border border-white/[0.06]",
      gold: "bg-[#c9a962]/15 text-[#c9a962] border border-[#c9a962]/20",
      silver: "bg-white/[0.06] text-[#888] border border-white/[0.08]",
      bronze: "bg-[#a67c52]/15 text-[#a67c52] border border-[#a67c52]/20",
      division: "bg-white text-black border border-white",
      secondary: "bg-white/[0.04] text-[#666] border border-white/[0.04]",
      outline: "bg-transparent text-[#666] border border-white/[0.08]",
    }

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase", variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"
