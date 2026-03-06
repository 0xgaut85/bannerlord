"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const CINEMATIC_EASE = "power3.out"
const DRAMATIC_EASE = "power4.out"

interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  initialScale?: number
  className?: string
}

export function AnimatedCard({
  children,
  delay = 0,
  initialScale = 1.6,
  className,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, {
      opacity: 0,
      scale: initialScale,
      y: 60,
      filter: "blur(8px)",
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        once: true,
      },
      delay,
    })

    tl.to(ref.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.4,
      ease: DRAMATIC_EASE,
    })

    return () => { tl.kill() }
  }, [delay, initialScale])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
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
  staggerDelay = 0.12,
  className,
}: StaggerItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, {
      opacity: 0,
      x: -30,
      scale: 0.92,
    })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.9,
      ease: CINEMATIC_EASE,
      delay: index * staggerDelay,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [index, staggerDelay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

interface RowRevealItemProps {
  children: ReactNode
  index: number
  columnsPerRow?: number
  className?: string
}

export function RowRevealItem({
  children,
  index,
  columnsPerRow = 4,
  className,
}: RowRevealItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, {
      opacity: 0,
      y: 25,
      scale: 0.9,
    })

    const itemDelay = index * 0.5

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: CINEMATIC_EASE,
      delay: itemDelay,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 92%",
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [index, columnsPerRow])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

interface FadeUpProps {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}

export function FadeUp({ children, delay = 0, className, y = 30 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: CINEMATIC_EASE,
      delay,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [delay, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y: 20 })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: CINEMATIC_EASE,
      delay,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function ShimmerDivider({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06), transparent)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}
