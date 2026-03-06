"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 rounded-lg focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"

    const variants = {
      primary: "glass-button-primary",
      secondary: "glass-button text-white",
      ghost: "bg-transparent text-[#888] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]",
      danger: "bg-red-600 text-white border border-red-500/30 hover:bg-red-500 shadow-lg shadow-red-900/20",
      outline: "bg-transparent border border-white/10 text-[#888] hover:text-white hover:bg-white/[0.04] hover:border-white/20",
    }

    const sizes = {
      sm: "px-3.5 py-1.5 text-[13px]",
      md: "px-5 py-2.5 text-[14px]",
      lg: "px-7 py-3 text-[15px]",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
            <span>Loading</span>
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = "Button"
