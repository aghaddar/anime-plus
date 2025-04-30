"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode, useContext } from "react"

interface User {
  userID: number
  username: string
  email: string
  avatarURL: string
}

interface AuthContextProps {
  token: string | null
  user: User | null
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (credentials: RegisterRequest) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

interface AuthProviderProps {
  children: ReactNode
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      // For demo purposes, let's simulate a successful login if the API is not available
      let success = false
      let userData = null
      let authToken = null

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })

        if (response.ok) {
          const data = await response.json()
          userData = data.user
          authToken = data.token
          success = true
        }
      } catch (error) {
        console.error("API login error:", error)
        // Fall back to mock login for demo purposes
        if (credentials.email === "demo@example.com" && credentials.password === "password") {
          userData = {
            userID: 1,
            username: "Adam Ghaddar",
            email: credentials.email,
            avatarURL: "/zoro-profile.png",
          }
          authToken = "mock-jwt-token-for-demo-purposes"
          success = true
        }
      }

      if (success && userData && authToken) {
        // Save to state
        setToken(authToken)
        setUser(userData)

        // Save to localStorage
        localStorage.setItem("auth_token", authToken)
        localStorage.setItem("auth_user", JSON.stringify(userData))

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  // Register function
  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    try {
      let success = false
      let userData = null
      let authToken = null

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })

        if (response.ok) {
          const data = await response.json()
          userData = data.user
          authToken = data.token
          success = true
        }
      } catch (error) {
        console.error("API register error:", error)
        // No mock register for now
      }

      if (success && userData && authToken) {
        // Save to state
        setToken(authToken)
        setUser(userData)

        // Save to localStorage
        localStorage.setItem("auth_token", authToken)
        localStorage.setItem("auth_user", JSON.stringify(userData))

        return true
      }

      return false
    } catch (error) {
      console.error("Register error:", error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  const value: AuthContextProps = {
    token,
    user,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
