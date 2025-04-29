export interface AnimeResult {
  id: string
  title: string
  image: string
  releaseDate?: string | number
  type?: string
  description?: string
  status?: string
  totalEpisodes?: number
  genres?: string[]
  episodes?: Episode[]
  recommendations?: AnimeResult[]
  rating?: number
}

export interface Episode {
  id: string
  number: number
  title?: string
}

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

// Mock data for when API is unavailable
export const MOCK_POPULAR_ANIME: AnimeResult[] = [
  {
    id: "one-piece",
    title: "One Piece",
    image: "/Straw-Hat-Crew-Adventure.png",
    type: "TV",
    releaseDate: "1999",
    rating: 8.7,
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    image: "/swords-against-shadows.png",
    type: "TV",
    releaseDate: "2019",
    rating: 8.5,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    image: "/cursed-energy-clash.png",
    type: "TV",
    releaseDate: "2020",
    rating: 8.6,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    image: "/colossal-silhouette.png",
    type: "TV",
    releaseDate: "2013",
    rating: 9.0,
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    image: "/hero-academy-gathering.png",
    type: "TV",
    releaseDate: "2016",
    rating: 8.2,
  },
  {
    id: "black-clover",
    title: "Black Clover",
    image: "/black-clover-inspired-team.png",
    type: "TV",
    releaseDate: "2017",
    rating: 8.1,
  },
]

export const getCommentsForEpisode = (episodeId: string): Comment[] => {
  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: "1",
      userId: "101",
      username: "AnimeFan123",
      userAvatar: "/anime-girl-profile.png",
      episodeId: episodeId,
      content: "This episode was amazing!",
      createdAt: new Date().toISOString(),
      likes: 15,
      replies: [
        {
          id: "2",
          userId: "102",
          username: "MangaLover42",
          userAvatar: "/cool-anime-profile.png",
          episodeId: episodeId,
          content: "I agree! The animation was top-notch.",
          createdAt: new Date(new Date().getTime() - 3600000).toISOString(), // 1 hour ago
          likes: 3,
        },
      ],
    },
    {
      id: "3",
      userId: "103",
      username: "KawaiiDesu",
      userAvatar: "/vibrant-anime-profile.png",
      episodeId: episodeId,
      content: "I can't wait for the next episode!",
      createdAt: new Date(new Date().getTime() - 86400000).toISOString(), // 1 day ago
      likes: 7,
      replies: [],
    },
  ]

  return mockComments
}
