"use client"

import type { ReactNode } from "react"
import { AuthProvider as AuthContextProvider } from "@/lib/auth-context"

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  return <AuthContextProvider>{children}</AuthContextProvider>
}

export default AuthProvider
