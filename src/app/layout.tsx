import type { Metadata } from "next"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Header, Footer } from "@/components/layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bannerlord Ranking",
  description: "Rate and rank the best Mount & Blade II: Bannerlord players",
  icons: {
    icon: [
      { url: "/brlogo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/brlogo.jpg",
    apple: "/brlogo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
