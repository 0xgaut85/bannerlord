"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  const handleTabChange = (tab: string) => { setActiveTab(tab); onChange?.(tab) }
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 p-1 rounded-lg bg-white/[0.02] border border-white/[0.04]", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs")
  const isActive = ctx.activeTab === value
  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-[13px] font-medium rounded-md transition-all duration-150",
        isActive ? "bg-white text-black" : "text-[#555] hover:text-white hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be used within Tabs")
  if (ctx.activeTab !== value) return null
  return <div className={cn("animate-fade-in", className)}>{children}</div>
}
