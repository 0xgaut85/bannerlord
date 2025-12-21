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
    const percentage = ((value - min) / (max - min)) * 100
    
    // Premium gold gradient
    const getColor = (val: number) => {
      const normalized = (val - 50) / 49
      // From muted bronze to gold to bright gold
      if (normalized < 0.5) {
        return `hsl(35, ${50 + normalized * 40}%, ${35 + normalized * 20}%)`
      } else {
        return `hsl(43, ${70 + (normalized - 0.5) * 20}%, ${45 + (normalized - 0.5) * 20}%)`
      }
    }
    
    return (
      <div className={cn("w-full", className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-4">
            {label && <span className={cn("text-sm font-medium", dark ? "text-white/70" : "text-[#5a5a5a]")}>{label}</span>}
            {showValue && (
              <span 
                className="font-display text-4xl font-semibold transition-colors duration-300"
                style={{ color: getColor(value) }}
              >
                {value}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={cn(
              "w-full h-2 rounded-full appearance-none cursor-pointer",
              dark ? "bg-white/20" : "bg-[#e5e5e5]",
              "focus:outline-none",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-white",
              "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#c9a962]",
              "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#c9a962]/20",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200",
              "[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl"
            )}
            style={{
              background: `linear-gradient(to right, ${getColor(value)} 0%, ${getColor(value)} ${percentage}%, ${dark ? 'rgba(255,255,255,0.2)' : '#e5e5e5'} ${percentage}%, ${dark ? 'rgba(255,255,255,0.2)' : '#e5e5e5'} 100%)`
            }}
            {...props}
          />
        </div>
        <div className={cn("flex justify-between text-xs mt-2", dark ? "text-white/50" : "text-[#8a8a8a]")}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    )
  }
)

Slider.displayName = "Slider"
