"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"

export default function SignInPage() {
  const router = useRouter()

  // Check if user is already signed in
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })
  }, [router])

  return (
    <div className="page-transition min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4">
          Authentication
        </p>
        
        <h1 className="font-display text-4xl font-semibold text-[#1a1a1a] mb-4">
          Welcome
        </h1>
        
        <p className="text-[#5a5a5a] mb-10 leading-relaxed">
          Sign in with your Discord account to rate players and contribute to the community rankings.
        </p>
        
        <Button
          onClick={() => signIn("discord", { callbackUrl: "/" })}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Sign in with Discord
        </Button>
        
        <p className="mt-8 text-sm text-[#8a8a8a]">
          By signing in, you agree to participate fairly in the community rankings.
        </p>
      </div>
    </div>
  )
}
