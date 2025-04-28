"use client"

import { useState } from "react"
import Image from "next/image"
import { ThumbsUp, Reply, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Comment as CommentType } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { likeComment, unlikeComment, deleteComment } from "@/lib/comments-api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommentProps {
  comment: CommentType
  isReply?: boolean
  onLike: (commentId: number, liked: boolean) => void
  onReply: (commentId: number) => void
  onDelete: (commentId: number) => void
}

const Comment = ({ comment, isReply = false, onLike, onReply, onDelete }: CommentProps) => {
  const [liked, setLiked] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user, token, isAuthenticated } = useAuth()

  const isOwnComment = user && comment.userId === user.userID

  const handleLike = async () => {
    if (!isAuthenticated || !token) return

    const newLikedState = !liked
    setLiked(newLikedState)

    try {
      const success = newLikedState
        ? await likeComment(token, Number(comment.id))
        : await unlikeComment(token, Number(comment.id))

      if (!success) {
        // Revert UI state if API call fails
        setLiked(!newLikedState)
      } else {
        onLike(Number(comment.id), newLikedState)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      setLiked(!newLikedState)
    }
  }

  const handleDelete = async () => {
    if (!isAuthenticated || !token || !isOwnComment) return

    setIsDeleting(true)

    try {
      const success = await deleteComment(token, Number(comment.id))
      if (success) {
        onDelete(Number(comment.id))
      } else {
        setIsDeleting(false)
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      setIsDeleting(false)
    }
  }

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  if (isDeleting) {
    return (
      <div className={`${isReply ? "ml-6 sm:ml-12 mt-3" : "mb-4 sm:mb-6"} opacity-50`}>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
              <p className="text-gray-400 italic">Deleting comment...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isReply ? "ml-6 sm:ml-12 mt-3" : "mb-4 sm:mb-6"}`}>
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-shrink-0">
          <Image
            src={comment.userAvatar || "/placeholder.svg?height=40&width=40&query=anime profile"}
            alt={comment.username || "User"}
            width={32}
            height={32}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          />
        </div>
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-xs sm:text-sm">{comment.username || "Anonymous"}</h4>
                <p className="text-xs text-gray-400">{formattedDate}</p>
              </div>

              {isOwnComment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical size={14} className="sm:size-16" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer" onClick={handleDelete}>
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm">{comment.content}</p>
          </div>

          <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs">
            <button
              className={`flex items-center gap-1 ${liked ? "text-purple-500" : "text-gray-400 hover:text-white"}`}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              <ThumbsUp size={12} className="sm:size-14" />
              <span>{liked ? (comment.likes || 0) + 1 : comment.likes || 0}</span>
            </button>

            {!isReply && (
              <button
                className="flex items-center gap-1 text-gray-400 hover:text-white"
                onClick={() => onReply(Number(comment.id))}
                disabled={!isAuthenticated}
              >
                <Reply size={12} className="sm:size-14" />
                <span>Reply</span>
              </button>
            )}

            {!isReply && comment.replies && comment.replies.length > 0 && (
              <button
                className="flex items-center gap-1 text-gray-400 hover:text-white"
                onClick={() => setShowReplies(!showReplies)}
              >
                <span>
                  {showReplies
                    ? "Hide Replies"
                    : `${comment.replies.length} ${comment.replies.length === 1 ? "Reply" : "Replies"}`}
                </span>
              </button>
            )}
          </div>

          {!isReply && showReplies && comment.replies && (
            <div className="mt-2 sm:mt-3">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Comment
