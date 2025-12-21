"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  // Check if user is already signed in
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl") || "/"
      router.push(callbackUrl)
    }
  }, [router, searchParams, session, status])

  const handleSignIn = async () => {
    try {
      setError(null)
      await signIn("discord", { 
        callbackUrl: "/",
        redirect: true 
      })
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Sign in error:", err)
    }
  }

  if (status === "loading") {
    return (
      <div className="page-transition min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a962] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <Button
          onClick={handleSignIn}
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a962] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
