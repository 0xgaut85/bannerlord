"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  initialScale?: number
  className?: string
}

export function AnimatedCard({
  children,
  delay = 0,
  initialScale = 1.4,
  className,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  index: number
  staggerDelay?: number
  className?: string
}

export function StaggerItem({
  children,
  index,
  staggerDelay = 0.06,
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        ease: EASE_OUT_EXPO,
        delay: index * staggerDelay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface RowRevealItemProps {
  children: ReactNode
  index: number
  columnsPerRow?: number
  rowDelay?: number
  className?: string
}

export function RowRevealItem({
  children,
  index,
  columnsPerRow = 4,
  rowDelay = 0.12,
  className,
}: RowRevealItemProps) {
  const row = Math.floor(index / columnsPerRow)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        ease: EASE_OUT_EXPO,
        delay: row * rowDelay + (index % columnsPerRow) * 0.03,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FadeUpProps {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}

export function FadeUp({ children, delay = 0, className, y = 12 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ShimmerDivider({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}
