// API endpoints for authentication and comments
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Authentication
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Comments
export async function getCommentsForEpisode(episodeId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/episode/${episodeId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch comments")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching comments:", error)
    return [] // Return empty array on error
  }
}

export async function createComment(
  token: string,
  commentData: {
    userID: number
    episodeID: string
    commentText: string
  },
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    })

    if (!response.ok) {
      throw new Error("Failed to create comment")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating comment:", error)
    throw error
  }
}

export async function updateComment(token: string, commentId: number, commentText: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ commentText }),
    })

    return response.ok
  } catch (error) {
    console.error("Error updating comment:", error)
    return false
  }
}

export async function deleteComment(token: string, commentId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting comment:", error)
    return false
  }
}
