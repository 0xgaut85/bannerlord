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
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Section - Black Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* Right Section - White Background with 5 degree angled edge */}
      <div 
        className="absolute inset-0 bg-white"
        style={{
          clipPath: 'polygon(46% 0, 100% 0, 100% 100%, 54% 100%)',
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex">
        
        {/* Left Content */}
        <div className="w-[42%] flex flex-col justify-center px-8 lg:px-16">
          <div className="mb-6">
            <p className="text-base font-medium tracking-[0.3em] uppercase text-[#c9a962] mb-4">
              Mount & Blade II
            </p>
            <h1 className="font-display text-6xl lg:text-7xl xl:text-8xl font-semibold text-white mb-4 tracking-tight leading-[1.05]">
              Bannerlord<br />
              <span className="text-[#c9a962]">Ranking</span>
            </h1>
            <p className="text-[#8a8a8a] text-xl lg:text-2xl leading-relaxed max-w-lg">
              The definitive ranking system for competitive Bannerlord players.
            </p>
          </div>
          
          {/* Feature List */}
          <div className="space-y-4 mb-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="block group"
              >
                <h3 className="text-white text-xl font-medium mb-0.5 group-hover:text-[#c9a962] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#6a6a6a] text-base leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-6">
            <Link href="/community">
              <Button size="lg" variant="primary" className="text-lg px-8 py-4">
                View Rankings
              </Button>
            </Link>
            {!session && (
              <button 
                onClick={() => signIn("discord")}
                className="text-[#8a8a8a] hover:text-white text-lg font-medium transition-colors"
              >
                Sign in to Rate
              </button>
            )}
          </div>
        </div>
        
        {/* Right Content - Image */}
        <div className="w-[58%] relative">
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
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center px-8 lg:px-16 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold text-white">
              Bannerlord
            </span>
            <span className="text-sm font-medium text-[#6a6a6a] tracking-widest uppercase">
              Ranking
            </span>
          </div>
          <div className="text-base text-[#6a6a6a]">
            Crafted by <span className="font-medium text-[#c9a962]">Obelix</span>
          </div>
        </div>
      </div>
    </div>
  )
}
