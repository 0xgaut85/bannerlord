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
          <label htmlFor={id} className="block text-[13px] font-medium text-[#888] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-lg text-[14px]",
            "bg-white/[0.03] border border-white/[0.06]",
            "focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/15",
            "placeholder:text-[#444] transition-all duration-200",
            "text-white",
            error && "border-red-500/40 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
