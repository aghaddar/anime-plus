import type { Comment } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Get comments for an episode
export async function getComments(episodeId: string): Promise<Comment[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/api/comments/episode/${episodeId}`, {
      cache: "no-store",
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Request timed out when fetching comments")
    } else {
      console.error("Error fetching comments:", error)
    }
    return []
  }
}

// Add a new comment
export async function addComment(token: string, episodeId: string, commentText: string): Promise<Comment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        episodeId,
        commentText,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding comment:", error)
    return null
  }
}

// Like a comment
export async function likeComment(token: string, commentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error liking comment:", error)
    return false
  }
}

// Unlike a comment
export async function unlikeComment(token: string, commentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/unlike`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error unliking comment:", error)
    return false
  }
}

// Reply to a comment
export async function replyToComment(
  token: string,
  parentCommentId: number,
  commentText: string,
): Promise<Comment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments/${parentCommentId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        commentText,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to reply to comment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error replying to comment:", error)
    return null
  }
}

// Delete a comment
export async function deleteComment(token: string, commentId: number): Promise<boolean> {
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
