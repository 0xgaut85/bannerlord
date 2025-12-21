"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { OnboardingModal } from "@/components/onboarding/OnboardingModal"

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      {children}
      <OnboardingModal />
    </NextAuthSessionProvider>
  )
}


