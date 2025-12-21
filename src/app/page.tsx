"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui"
import { signIn } from "next-auth/react"
import Image from "next/image"

const features = [
  {
    title: "Global Ranking",
    href: "/community",
    description: "The official community ranking, aggregated from all player votes to determine the best warriors.",
  },
  {
    title: "Users Ranking",
    href: "/players",
    description: "Browse individual player lists and see how each member of the community ranks the competition.",
  },
  {
    title: "Make your Ranking",
    href: "/rate",
    description: "Create your own rankings by scoring players from 50-99 and contribute to the consensus.",
  },
  {
    title: "Edit Player",
    href: "/edit-player",
    description: "Update player information including nationality and clan affiliation.",
  },
]

export default function HomePage() {
  const { data: session } = useSession()
  
  return (
    <div className="relative min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background - Full black on mobile, split on desktop */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* Right Section - White Background with angled edge (desktop only) */}
      <div 
        className="absolute inset-0 bg-white hidden lg:block"
        style={{
          clipPath: 'polygon(46% 0, 100% 0, 100% 100%, 54% 100%)',
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        
        {/* Left Content */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center px-6 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-0">
          <div className="mb-6 sm:mb-8">
            <p className="text-sm sm:text-base font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#c9a962] mb-3 sm:mb-4">
              Mount & Blade II
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white mb-3 sm:mb-4 tracking-tight leading-[1.1]">
              Bannerlord<br />
              <span className="text-[#c9a962]">Ranking</span>
            </h1>
            <p className="text-[#8a8a8a] text-base sm:text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-lg">
              The definitive ranking system for competitive Bannerlord players.
            </p>
          </div>
          
          {/* Feature List */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="block group"
              >
                <h3 className="text-white text-base sm:text-lg lg:text-xl font-medium mb-0.5 group-hover:text-[#c9a962] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#6a6a6a] text-sm sm:text-base leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link href="/community">
              <Button size="lg" variant="primary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                View Rankings
              </Button>
            </Link>
            {!session && (
              <button 
                onClick={() => signIn("discord")}
                className="text-[#8a8a8a] hover:text-white text-base sm:text-lg font-medium transition-colors"
              >
                Sign in to Rate
              </button>
            )}
          </div>
        </div>
        
        {/* Right Content - Image (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:block w-[58%] relative">
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            <div className="relative w-[160%] h-full translate-x-[8%]">
              <Image
                src="/asset1.png"
                alt="Bannerlord"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Image - Shows at bottom on mobile/tablet */}
        <div className="lg:hidden relative w-full h-64 sm:h-80 md:h-96 mt-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
          <Image
            src="/asset1.png"
            alt="Bannerlord"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-6 sm:px-8 lg:px-16 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-display text-lg sm:text-xl font-semibold text-white">
              Bannerlord
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#6a6a6a] tracking-widest uppercase">
              Ranking
            </span>
          </div>
          <div className="text-sm sm:text-base text-[#6a6a6a]">
            Crafted by <span className="font-medium text-[#c9a962]">Obelix</span>
          </div>
        </div>
      </div>
    </div>
  )
}
