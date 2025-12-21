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
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium tracking-tight",
      "transition-all duration-300 rounded-xl",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    )
    
    const variants = {
      primary: cn(
        "glass-button-primary",
        "text-white",
        "focus:ring-[#c9a962]/50"
      ),
      secondary: cn(
        "glass-button",
        "text-[#1a1a1a]",
        "focus:ring-[#c5c5c5]/50"
      ),
      ghost: cn(
        "bg-transparent",
        "text-[#404040] hover:text-[#1a1a1a]",
        "hover:bg-white/40",
        "border border-transparent hover:border-white/50",
        "backdrop-blur-sm",
        "focus:ring-[#c5c5c5]/30"
      ),
      danger: cn(
        "bg-gradient-to-b from-[#dc2626] to-[#b91c1c]",
        "text-white",
        "border border-red-400/30",
        "shadow-lg shadow-red-500/20",
        "hover:from-[#ef4444] hover:to-[#dc2626]",
        "focus:ring-red-500/50"
      ),
      outline: cn(
        "bg-transparent",
        "border border-[#e5e5e5] text-[#8a8a8a]",
        "hover:bg-white/10 hover:text-white hover:border-white/30",
        "backdrop-blur-sm",
        "focus:ring-[#c5c5c5]/30"
      ),
    }
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg",
    }
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            <span>Loading</span>
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = "Button"
