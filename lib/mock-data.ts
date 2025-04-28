import type { Comment } from "./types"

// Mock comments data
export const mockComments: Record<string, Comment[]> = {
  // Comments for Demon Slayer episode
  "demon-slayer-episode-1": [
    {
      id: "comment-1",
      userId: "user-1",
      username: "TanjiroFan",
      userAvatar: "/anime-girl-profile.png",
      content: "This episode was amazing! The animation quality is top-notch.",
      createdAt: "2023-11-15T14:30:00Z",
      likes: 24,
      replies: [
        {
          id: "reply-1",
          userId: "user-2",
          username: "NezukoLover",
          userAvatar: "/anime-city-lights.png",
          content: "I agree! The fight scenes were so fluid.",
          createdAt: "2023-11-15T15:45:00Z",
          likes: 8,
        },
      ],
    },
    {
      id: "comment-2",
      userId: "user-3",
      username: "AnimeExpert",
      userAvatar: "/cool-anime-profile.png",
      content:
        "The character development in this episode was really well done. I'm looking forward to seeing how Tanjiro grows throughout the series.",
      createdAt: "2023-11-14T10:22:00Z",
      likes: 17,
    },
  ],

  // Comments for One Piece episode
  "one-piece-ep-1047": [
    {
      id: "comment-3",
      userId: "user-4",
      username: "StrawHatPirate",
      userAvatar: "/spirited-gaze.png",
      content: "After all these years, One Piece still delivers! This episode had me on the edge of my seat.",
      createdAt: "2023-11-13T18:15:00Z",
      likes: 42,
    },
    {
      id: "comment-4",
      userId: "user-5",
      username: "GoingMerry",
      userAvatar: "/vibrant-anime-profile.png",
      content: "The way they're building up to the final saga is incredible. Can't wait to see what happens next!",
      createdAt: "2023-11-13T19:30:00Z",
      likes: 31,
    },
  ],

  // Default comments for any episode
  default: [
    {
      id: "comment-5",
      userId: "user-6",
      username: "AnimeFan123",
      userAvatar: "/placeholder.svg?height=40&width=40&query=anime profile 6",
      content: "Great episode! Can't wait for the next one.",
      createdAt: "2023-11-12T12:00:00Z",
      likes: 15,
    },
    {
      id: "comment-6",
      userId: "user-7",
      username: "OtakuMaster",
      userAvatar: "/placeholder.svg?height=40&width=40&query=anime profile 7",
      content: "The plot is getting more interesting with each episode!",
      createdAt: "2023-11-11T09:45:00Z",
      likes: 9,
    },
  ],
}

// Function to get comments for an episode
export function getCommentsForEpisode(episodeId: string): Comment[] {
  return mockComments[episodeId] || mockComments["default"]
}
