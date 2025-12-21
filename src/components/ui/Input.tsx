"use client"

import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-[#1a1a1a] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 glass rounded-xl",
            "border border-white/50",
            "focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]/50",
            "placeholder:text-[#8a8a8a] transition-all duration-300",
            "text-[#1a1a1a]",
            error && "border-red-300 focus:ring-red-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
