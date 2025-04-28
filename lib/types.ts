// Comment types
export interface Comment {
  id: string | number
  userId: string | number
  episodeId?: string
  content: string
  createdAt: string
  username?: string
  userAvatar?: string
  likes?: number
  replies?: Comment[]
}

export interface User {
  userID: number
  username: string
  email: string
  avatarURL?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}
