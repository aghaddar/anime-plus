"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  userID: number
  username: string
  email: string
  avatarURL?: string
}

interface AuthContextProps {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (credentials: RegisterRequest) => Promise<boolean>
  logout: () => void
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
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        console.log("Auth state: User is logged in", parsedUser)
      } catch (e) {
        console.error("Failed to parse stored user", e)
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_token")
      }
    } else {
      console.log("Auth state: No user logged in")
    }

    setIsLoading(false)
  }, [])

  // Login function with improved error handling
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      let success = false
      let userData = null
      let authToken = null

      try {
        console.log("Attempting to login with API:", { email: credentials.email, password: "[REDACTED]" })

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })

        console.log("Login API Response Status:", response.status)

        const responseText = await response.text()
        console.log("Login API Response Body:", responseText)

        if (response.ok) {
          try {
            const data = JSON.parse(responseText)
            authToken = data.token

            // Check if the response includes user data
            if (data.user) {
              // If user data is included in the response, use it
              userData = data.user
            } else if (data.token) {
              // If only token is provided, extract user_id from JWT and create a minimal user object
              // This is a workaround for APIs that don't return user data with the token
              try {
                // Extract user info from JWT if possible
                const tokenParts = data.token.split(".")
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(atob(tokenParts[1]))
                  console.log("Extracted JWT payload:", payload)

                  // Create a minimal user object from the JWT payload
                  userData = {
                    userID: Number(payload.user_id) || 5,
                    username: credentials.email.split("@")[0] || "User",
                    email: credentials.email,
                    avatarURL: "/zoro-profile.png",
                  }
                }
              } catch (jwtError) {
                console.log("Could not parse JWT:", jwtError)
              }

              // If we couldn't extract from JWT, create a basic user object
              if (!userData) {
                userData = {
                  userID: 5, // Using a default ID
                  username: credentials.email.split("@")[0] || "User",
                  email: credentials.email,
                  avatarURL: "/zoro-profile.png",
                }
              }
            }

            success = !!authToken && !!userData
          } catch (e) {
            console.log("Failed to parse login response JSON:", e)
          }
        } else if (response.status === 401) {
          console.log("Login failed: Invalid credentials")
          // Handle 401 specifically - invalid credentials
          return false
        }
      } catch (error) {
        console.log("API login connection error:", error)
        return false
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
      console.log("Login error:", error)
      return false
    }
  }

  // Register function with improved error handling
  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    try {
      let success = false
      let userData = null
      let authToken = null
      let apiError = null

      try {
        console.log(
          "Attempting to register with API:",
          JSON.stringify(
            {
              ...credentials,
              password: "[REDACTED]", // Don't log actual password
            },
            null,
            2,
          ),
        )

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })

        const responseText = await response.text()
        console.log("API Response Status:", response.status)
        console.log(
          "API Response Headers:",
          JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2),
        )
        console.log("API Response Body:", responseText)

        if (response.ok) {
          try {
            const data = JSON.parse(responseText)
            
            // Check if the response contains a success message
            if (data.message && data.message.includes("success")) {
              success = true;
              
              // If we have user data but no token, create a temporary token
              if (data.user) {
                userData = {
                  userID: data.user.id || 0,
                  username: data.user.username || credentials.username,
                  email: data.user.email || credentials.email,
                  avatarURL: data.user.avatarURL || "/zoro-profile.png",
                };
                
                // Generate a temporary token if none is provided
                if (!data.token) {
                  authToken = `temp-token-${Date.now()}`;
                  console.log("Created temporary token for successful registration");
                } else {
                  authToken = data.token;
                }
              }
            } else {
              // If there's no success message but we have user and token
              if (data.user) {
                userData = data.user;
              }
              if (data.token) {
                authToken = data.token;
                success = true;
              }
            }
          } catch (e) {
            console.log("Failed to parse JSON response:", e)
            apiError = "Server returned invalid response format"
          }
        } else {
          // Try to parse error message from response
          try {
            const errorData = JSON.parse(responseText)
            if (errorData.error && errorData.error.includes("already exists")) {
              throw new Error("This email is already registered. Please try logging in instead.")
            }
            apiError = errorData.message || errorData.error || `Registration failed with status: ${response.status}`
          } catch (e) {
            if (e instanceof Error && e.message.includes("already registered")) {
              throw e
            }
            apiError = `Registration failed with status: ${response.status}. Response: ${responseText}`
          }

          // Log the error but don't throw it yet
          console.log("API registration error:", apiError)

          // For 400 Bad Request errors, we'll handle them gracefully
          if (response.status === 400 || response.status === 401) {
            console.log(`Handling ${response.status} error gracefully`)
            // Check if the error is about email already existing
            if (responseText.includes("already exists")) {
              throw new Error("This email is already registered. Please try logging in instead.")
            }
          }
        }
      } catch (error) {
        console.log("API connection error:", error)
        if (error instanceof Error && error.message.includes("already registered")) {
          throw error
        }
        apiError = "Could not connect to the registration service"
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

      // For 400/401 errors, we'll just return false instead of throwing
      // This allows the application to continue and potentially use fallback options
      if (apiError && !apiError.includes("status: 400") && !apiError.includes("status: 401")) {
        throw new Error(apiError)
      }

      return false
    } catch (error) {
      console.log("Register error:", error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}