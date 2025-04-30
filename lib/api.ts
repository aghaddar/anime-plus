// Update the API integration to use animepahe as the only provider and handle images directly

import { MOCK_POPULAR_ANIME } from "./mock-data"

// Define the base URL for animepahe
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/anime/animepahe"

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

// Helper function to check if an image URL is valid
function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return !(url === "undefined" || url === "null" || url.trim() === "")
}

// Helper function to proxy external images through our API
function getProxiedImageUrl(url: string | undefined | null, title: string): string {
  if (!isValidImageUrl(url)) {
    return `/placeholder.svg?height=500&width=1000&query=${encodeURIComponent(title)}`
  }

  // If it's an external URL, proxy it through our API to avoid CORS issues
  if (url!.startsWith("http") && !url!.startsWith("/")) {
    return `/api/proxy-image?url=${encodeURIComponent(url!)}`
  }

  return url!
}

export async function getPopularAnime(): Promise<AnimeResult[]> {
  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/popular`
  console.log(`Attempting to fetch popular anime from: ${url}`)

  try {
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })

    // Return the results array from the response or fallback to mock data
    const results = data.results || MOCK_POPULAR_ANIME

    // Process images to ensure they're valid
    return results.map((anime: AnimeResult) => ({
      ...anime,
      image: getProxiedImageUrl(anime.image, anime.title),
    }))
  } catch (error) {
    console.error("Error in getPopularAnime:", error)
    return MOCK_POPULAR_ANIME
  }
}

export async function getRecentEpisodes(): Promise<AnimeResult[]> {
  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/recent-episodes`
  console.log(`Attempting to fetch recent episodes from: ${url}`)

  try {
    const data = await safeFetch(url, {
      results: MOCK_POPULAR_ANIME.slice(0, 4).map((anime) => ({
        ...anime,
        episodeNumber: Math.floor(Math.random() * 12) + 1,
        episodeId: `${anime.id}-episode-${Math.floor(Math.random() * 12) + 1}`,
      })),
    })

    const results = data.results || MOCK_POPULAR_ANIME.slice(0, 4)

    // Process images to ensure they're valid
    return results.map((anime: AnimeResult) => ({
      ...anime,
      image: getProxiedImageUrl(anime.image, anime.title),
    }))
  } catch (error) {
    console.error("Error in getRecentEpisodes:", error)
    return MOCK_POPULAR_ANIME.slice(0, 4)
  }
}

export async function searchAnime(query: string): Promise<AnimeResult[]> {
  if (!query) return []

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/${encodeURIComponent(query)}`
  console.log(`Searching anime with query: ${url}`)

  try {
    const data = await safeFetch(url, {
      results: MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase())),
    })

    const results =
      data.results || MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))

    // Process images to ensure they're valid
    return results.map((anime: AnimeResult) => {
      // If the image URL is invalid, use a placeholder
      const validImage =
        anime.image && anime.image !== "undefined" && anime.image !== "null" && anime.image.trim() !== ""

      const imageUrl = validImage
        ? anime.image
        : `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(anime.title)}`

      return {
        ...anime,
        image:
          imageUrl.startsWith("http") && !imageUrl.startsWith("/")
            ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
            : imageUrl,
      }
    })
  } catch (error) {
    console.error("Error in searchAnime:", error)
    return MOCK_POPULAR_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeResult | null> {
  if (!id) return null

  // Construct the full URL with the correct path
  const url = `${API_BASE_URL}/info/${encodeURIComponent(id)}`
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

    // Ensure the image URL is valid
    if (data) {
      data.image = getProxiedImageUrl(data.image, data.title || id)

      // Also process recommendation images
      if (data.recommendations && Array.isArray(data.recommendations)) {
        data.recommendations = data.recommendations.map((rec: AnimeResult) => ({
          ...rec,
          image: getProxiedImageUrl(rec.image, rec.title),
        }))
      }
    }

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

  // For related anime, we'll just use the popular endpoint for animepahe
  const url = `${API_BASE_URL}/popular`

  try {
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })
    const results = (data.results || MOCK_POPULAR_ANIME).slice(0, 4)

    // Process images to ensure they're valid
    return results.map((anime: AnimeResult) => ({
      ...anime,
      image: getProxiedImageUrl(anime.image, anime.title),
    }))
  } catch (error) {
    console.error("Error in getRelatedAnime:", error)
    return MOCK_POPULAR_ANIME.slice(0, 4)
  }
}

export async function getEpisodeSources(episodeId: string): Promise<AnimeSource | null> {
  if (!episodeId) {
    console.error("getEpisodeSources called with empty episodeId")
    return null
  }

  console.log(`Processing episode ID for API request: ${episodeId}`)

  // Create fallback sources that will always work
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

  try {
    // IMPORTANT: Properly encode the episodeId to handle slashes correctly
    const encodedEpisodeId = encodeURIComponent(episodeId)
    const url = `${API_BASE_URL}/watch?episodeId=${encodedEpisodeId}`

    console.log(`Fetching sources from: ${url}`)

    // Make the request with no caching to ensure fresh data
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    console.log(`API response status: ${response.status}`)

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      console.log("Using fallback sources due to API error")
      return fallbackSources
    }

    // Try to parse the response as text first to see what we're getting
    const responseText = await response.text()
    console.log(`API response text (first 200 chars): ${responseText.substring(0, 200)}...`)

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
      console.log("API response parsed as JSON:", data)
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", parseError)
      console.log("Using fallback sources due to parse error")
      return fallbackSources
    }

    // Check if the response has the expected structure
    if (!data) {
      console.error("API response is empty")
      return fallbackSources
    }

    if (!data.sources || !Array.isArray(data.sources) || data.sources.length === 0) {
      console.error("API response missing sources array:", data)
      return fallbackSources
    }

    // Log the sources we found
    console.log(
      `Found ${data.sources.length} sources:`,
      data.sources.map((s: { quality: string; isM3U8: boolean }) => ({ quality: s.quality, isM3U8: s.isM3U8 })),
    )

    return data
  } catch (error) {
    console.error("Error in getEpisodeSources:", error)
    console.log("Using fallback sources due to exception")
    return fallbackSources
  }
}
