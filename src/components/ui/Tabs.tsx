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
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 p-1.5 glass rounded-xl",
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
        isActive 
          ? "bg-white/80 text-[#c9a962] shadow-sm border border-white/50" 
          : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/40",
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  
  const { activeTab } = context
  
  if (activeTab !== value) return null
  
  return <div className={className}>{children}</div>
}
