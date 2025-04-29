// lib/api.ts
import { MOCK_POPULAR_ANIME } from "./mock-data"

// Define the base URL and provider path separately for clarity
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
const PROVIDER_PATH = "anime/animepahe"

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

export interface AnimeSource {
  headers?: {
    Referer?: string
  }
  sources: {
    url: string
    isM3U8: boolean
    quality: string
    isDub?: boolean
  }[]
  download?: string
}

// Helper function to safely fetch data with fallback
async function safeFetch(url: string, fallbackData: any) {
  try {
    console.log(`Fetching from: ${url}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    // Fix the cache/revalidate conflict - use only one
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 }, // Revalidate every minute
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText} for ${url}`)
      return fallbackData
    }

    const data = await response.json()
    console.log(`API response for ${url} received successfully`)
    return data
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    console.log(`Using fallback data instead`)
    return fallbackData
  }
}

export async function getPopularAnime(): Promise<AnimeResult[]> {
  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/popular`
  console.log(`Attempting to fetch popular anime from: ${url}`)

  try {
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })

    // Return the results array from the response or fallback to mock data
    return data.results || MOCK_POPULAR_ANIME
  } catch (error) {
    console.error("Error in getPopularAnime:", error)
    return MOCK_POPULAR_ANIME
  }
}

export async function getRecentEpisodes(): Promise<AnimeResult[]> {
  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/recent-episodes`
  console.log(`Attempting to fetch recent episodes from: ${url}`)

  try {
    const data = await safeFetch(url, {
      results: MOCK_POPULAR_ANIME.slice(0, 4).map((anime) => ({
        ...anime,
        episodeNumber: Math.floor(Math.random() * 12) + 1,
        episodeId: `${anime.id}-episode-${Math.floor(Math.random() * 12) + 1}`,
      })),
    })

    return data.results || MOCK_POPULAR_ANIME.slice(0, 4)
  } catch (error) {
    console.error("Error in getRecentEpisodes:", error)
    return MOCK_POPULAR_ANIME.slice(0, 4)
  }
}

export async function searchAnime(query: string): Promise<AnimeResult[]> {
  if (!query) return []

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/${encodeURIComponent(query)}`
  console.log(`Searching anime with query: ${url}`)

  try {
    const data = await safeFetch(url, {
      results: MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase())),
    })

    return data.results || MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))
  } catch (error) {
    console.error("Error in searchAnime:", error)
    return MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeResult | null> {
  if (!id) return null

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/info/${encodeURIComponent(id)}`
  console.log(`Fetching anime info for ID: ${url}`)

  try {
    // Find the anime in our mock data as a fallback
    const mockAnime = MOCK_POPULAR_ANIME.find((anime) => anime.id === id)
    const mockAnimeInfo = mockAnime
      ? {
          ...mockAnime,
          description: "This is a mock description for the anime. The API is running locally.",
          status: "Ongoing",
          totalEpisodes: 24,
          genres: ["Action", "Adventure", "Fantasy"],
          episodes: Array.from({ length: 12 }, (_, i) => ({
            id: `${id}-episode-${i + 1}`,
            number: i + 1,
            title: `Episode ${i + 1}`,
          })),
          recommendations: MOCK_POPULAR_ANIME.filter((anime) => anime.id !== id).slice(0, 5),
        }
      : null

    const data = await safeFetch(url, mockAnimeInfo)
    return data
  } catch (error) {
    console.error("Error in getAnimeInfo:", error)

    // Return mock data as fallback
    const mockAnime = MOCK_POPULAR_ANIME.find((anime) => anime.id === id)
    if (!mockAnime) return null

    return {
      ...mockAnime,
      description: "This is a mock description for the anime. The API is running locally.",
      status: "Ongoing",
      totalEpisodes: 24,
      genres: ["Action", "Adventure", "Fantasy"],
      episodes: Array.from({ length: 12 }, (_, i) => ({
        id: `${id}-episode-${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1}`,
      })),
      recommendations: MOCK_POPULAR_ANIME.filter((anime) => anime.id !== id).slice(0, 5),
    }
  }
}

export async function getRelatedAnime(genres: string[]): Promise<AnimeResult[]> {
  console.log("Fetching related anime based on genres:", genres)

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/popular`

  try {
    // For related anime, we'll just use the popular endpoint for animepahe
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })
    return (data.results || MOCK_POPULAR_ANIME).slice(0, 4)
  } catch (error) {
    console.error("Error in getRelatedAnime:", error)
    return MOCK_POPULAR_ANIME.slice(0, 4)
  }
}

export async function getEpisodeSources(episodeId: string): Promise<AnimeSource | null> {
  if (!episodeId) return null

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${PROVIDER_PATH}/watch?episodeId=${encodeURIComponent(episodeId)}`
  console.log(`Fetching sources for episode: ${url}`)

  try {
    // Default fallback sources
    const fallbackSources = {
      headers: {
        Referer: "https://kwik.cx/",
      },
      sources: [
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Public test HLS stream
          isM3U8: true,
          quality: "720p",
          isDub: false,
        },
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          isM3U8: true,
          quality: "480p",
          isDub: false,
        },
      ],
      download: `https://example.com/download/${episodeId}`,
    }

    const data = await safeFetch(url, fallbackSources)
    return data
  } catch (error) {
    console.error("Error in getEpisodeSources:", error)

    // Return fallback sources
    return {
      headers: {
        Referer: "https://kwik.cx/",
      },
      sources: [
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Public test HLS stream
          isM3U8: true,
          quality: "720p",
          isDub: false,
        },
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          isM3U8: true,
          quality: "480p",
          isDub: false,
        },
      ],
      download: `https://example.com/download/${episodeId}`,
    }
  }
}
