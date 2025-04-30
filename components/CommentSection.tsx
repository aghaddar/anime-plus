"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import Comment from "./Comment"
import CommentForm from "./CommentForm"
import type { Comment as CommentType } from "@/lib/types"
import { getComments, addComment, replyToComment } from "@/lib/comments-api"
import { useAuth } from "@/lib/auth-context"
import { getCommentsForEpisode } from "@/lib/mock-data" // Fallback for development

interface CommentSectionProps {
  episodeId: string
}

const CommentSection = ({ episodeId }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!episodeId) {
      console.error("No episode ID provided to CommentSection")
      setIsLoading(false)
      return
    }

    const fetchComments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching comments for episode: ${episodeId}`)

        // Always use mock data for now until API is properly set up
        const mockComments = getCommentsForEpisode(episodeId)
        setComments(mockComments)

        // Only try the API if we're online
        if (navigator.onLine) {
          try {
            // Try to fetch from API with a timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

            const fetchedComments = await getComments(episodeId)
            clearTimeout(timeoutId)

            if (fetchedComments && fetchedComments.length > 0) {
              // Only update if we got actual comments
              setComments(fetchedComments)
            }
          } catch (err) {
            // Silently fail - we already have mock data loaded
            console.error("Error fetching comments from API:", err)
          }
        }
      } catch (err) {
        console.error("Unexpected error in fetchComments:", err)
        setError("Failed to load comments. Please try again later.")

        // Still try to show mock data as last resort
        try {
          const mockComments = getCommentsForEpisode(episodeId)
          setComments(mockComments)
        } catch (e) {
          console.error("Failed to load mock data:", e)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [episodeId])

  const handleAddComment = async (content: string): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      return false
    }

    try {
      const newComment = await addComment(token, episodeId, content)

      if (newComment) {
        setComments([newComment, ...comments])
        return true
      }
      return false
    } catch (err) {
      console.error("Error adding comment:", err)

      // For demo purposes, add a local comment even if API fails
      const mockNewComment: CommentType = {
        id: `comment-${Date.now()}`,
        userId: "current-user",
        username: "You",
        userAvatar: "/zoro-profile.png",
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      }

      setComments([mockNewComment, ...comments])
      return true
    }
  }

  const handleReply = async (content: string): Promise<boolean> => {
    if (!isAuthenticated || !token || !replyingTo) {
      return false
    }

    try {
      const newReply = await replyToComment(token, replyingTo.id, content)

      if (newReply) {
        // Update the comments state with the new reply
        const updatedComments = comments.map((comment) => {
          if (Number(comment.id) === replyingTo.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        })

        setComments(updatedComments)
        return true
      }
      return false
    } catch (err) {
      console.error("Error adding reply:", err)

      // For demo purposes, add a local reply even if API fails
      const mockNewReply: CommentType = {
        id: `reply-${Date.now()}`,
        userId: "current-user",
        username: "You",
        userAvatar: "/zoro-profile.png",
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      }

      const updatedComments = comments.map((comment) => {
        if (Number(comment.id) === replyingTo.id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), mockNewReply],
          }
        }
        return comment
      })

      setComments(updatedComments)
      return true
    }
  }

  const handleLike = (commentId: number, liked: boolean) => {
    // Update the UI optimistically
    const updatedComments = comments.map((comment) => {
      if (Number(comment.id) === commentId) {
        return {
          ...comment,
          likes: liked ? (comment.likes || 0) + 1 : Math.max((comment.likes || 0) - 1, 0),
        }
      }

      // Check in replies too
      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = comment.replies.map((reply) => {
          if (Number(reply.id) === commentId) {
            return {
              ...reply,
              likes: liked ? (reply.likes || 0) + 1 : Math.max((reply.likes || 0) - 1, 0),
            }
          }
          return reply
        })

        return {
          ...comment,
          replies: updatedReplies,
        }
      }

      return comment
    })

    setComments(updatedComments)
  }

  const handleDelete = (commentId: number) => {
    // Remove the comment from the UI
    let updatedComments = comments.filter((comment) => Number(comment.id) !== commentId)

    // Also check for the comment in replies
    updatedComments = updatedComments.map((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: comment.replies.filter((reply) => Number(reply.id) !== commentId),
        }
      }
      return comment
    })

    setComments(updatedComments)
  }

  const handleReplyClick = (commentId: number) => {
    const comment = comments.find((c) => Number(c.id) === commentId)
    if (comment) {
      setReplyingTo({
        id: commentId,
        username: comment.username || "Anonymous",
      })
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg mt-8">
      <h2 className="text-lg font-bold mb-6 flex items-center">
        <MessageSquare size={20} className="mr-2" />
        Comments ({comments.length})
      </h2>

      {!replyingTo && <CommentForm onSubmit={handleAddComment} />}

      {replyingTo && (
        <CommentForm
          onSubmit={handleReply}
          isReply={true}
          replyTo={replyingTo.username}
          onCancelReply={() => setReplyingTo(null)}
        />
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-400">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-purple-400 hover:text-purple-300 underline"
            >
              Try again
            </button>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={handleReplyClick}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection
