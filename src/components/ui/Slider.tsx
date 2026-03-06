"use client"

import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  min?: number
  max?: number
  value: number
  onChange: (value: number) => void
  showValue?: boolean
  dark?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, min = 50, max = 99, value, onChange, showValue = true, dark = false, ...props }, ref) => {
    const pct = ((value - min) / (max - min)) * 100

    return (
      <div className={cn("w-full", className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-3">
            {label && <span className="text-[13px] font-medium text-[#888]">{label}</span>}
            {showValue && (
              <span className="font-display text-3xl font-bold text-white tabular-nums">{value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10",
            "focus:outline-none",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
            "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.3)]",
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
            "[&::-webkit-slider-thumb]:hover:scale-110"
          )}
          style={{
            background: `linear-gradient(to right, #fff 0%, #fff ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`
          }}
          {...props}
        />
        <div className="flex justify-between text-[11px] mt-1.5 text-[#444]">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    )
  }
)

Slider.displayName = "Slider"
