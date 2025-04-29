import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/auth-context"
import ApiStatusIndicator from "@/components/ApiStatusIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnimePlus - Anime Streaming Platform",
  description: "Watch your favorite anime shows and movies",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ApiStatusIndicator disabled={process.env.NODE_ENV === "development"} />
        </AuthProvider>
      </body>
    </html>
  )
}
