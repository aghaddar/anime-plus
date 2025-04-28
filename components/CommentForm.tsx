"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>
  isReply?: boolean
  replyTo?: string
  onCancelReply?: () => void
}

const CommentForm = ({ onSubmit, isReply = false, replyTo, onCancelReply }: CommentFormProps) => {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)
    const success = await onSubmit(content)

    if (success) {
      setContent("")
      if (isReply && onCancelReply) {
        onCancelReply()
      }
    }

    setIsSubmitting(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-400">Please sign in to leave a comment</p>
        <Button
          onClick={() => (window.location.href = "/login")}
          className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
        >
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-gray-800 p-4 rounded-lg ${isReply ? "ml-6 sm:ml-12" : ""}`}>
      {isReply && replyTo && (
        <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
          <span>Replying to {replyTo}</span>
          {onCancelReply && (
            <button type="button" onClick={onCancelReply} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start">
        <Image
          src={user?.avatarURL || "/zoro-profile.png"}
          alt="Your avatar"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isReply ? "Write a reply..." : "Add a comment..."}
            className="w-full bg-gray-700 text-white p-3 rounded-md resize-none"
            rows={isReply ? 2 : 3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isReply ? "Replying..." : "Posting..."}
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  {isReply ? "Reply" : "Post"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default CommentForm
