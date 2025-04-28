const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
const API_PATH = "/anime/animepahe"

export interface AnimeResult {
  id: string
  title: string
  image: string
  type?: string
  releaseDate?: string
  description?: string
  genres?: string[]
  status?: string
  totalEpisodes?: number
  episodes?: Episode[]
  recommendations?: AnimeResult[]
}

export interface Episode {
  id: string
  number: number
  title?: string
}

export interface AnimeSource {
  sources: {
    url: string
    isM3U8: boolean
    quality: string
  }[]
}

// Search for anime
export async function searchAnime(query: string): Promise<AnimeResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_PATH}/${encodeURIComponent(query)}`)
    if (!response.ok) {
      console.error(`Failed to search anime for query ${query}: ${response.statusText}`)
      return getFallbackAnimeData()
    }

    const data = await response.json()
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Invalid response format from API")
      return getFallbackAnimeData()
    }

    return data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      image: item.image || "/vibrant-cityscape.png",
      releaseDate: item.releaseDate,
      type: item.type,
    }))
  } catch (error) {
    console.error("Error searching anime:", error)
    return getFallbackAnimeData()
  }
}

// Get anime info
export async function getAnimeInfo(id: string): Promise<AnimeResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_PATH}/info/${encodeURIComponent(id)}`)
    if (!response.ok) {
      console.error(`Failed to get anime info for ID ${id}: ${response.statusText}`)
      return getFallbackAnimeDetail(id)
    }

    const data = await response.json()

    // Process recommendations if available
    let recommendations: AnimeResult[] = []
    if (data.recommendations && Array.isArray(data.recommendations)) {
      recommendations = data.recommendations.map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        image: rec.image || "/vibrant-cityscape.png",
        type: rec.type,
        releaseDate: rec.releaseDate,
      }))
    }

    return {
      id: data.id,
      title: data.title,
      image: data.image || "/vibrant-cityscape-night.png",
      description: data.description || "No description available.",
      genres: data.genres || [],
      status: data.status,
      type: data.type,
      releaseDate: data.releaseDate,
      totalEpisodes: data.totalEpisodes,
      episodes:
        data.episodes?.map((ep: any) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
        })) || [],
      recommendations,
    }
  } catch (error) {
    console.error("Error getting anime info:", error)
    return getFallbackAnimeDetail(id)
  }
}

// Get episode sources
export async function getEpisodeSources(episodeId: string): Promise<AnimeSource | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_PATH}/watch?episodeId=${encodeURIComponent(episodeId)}`)
    if (!response.ok) {
      console.error(`Failed to get episode sources for ID ${episodeId}: ${response.statusText}`)
      return { sources: [] }
    }

    const data = await response.json()
    return {
      sources:
        data.sources?.map((source: any) => ({
          url: source.url,
          isM3U8: source.isM3U8,
          quality: source.quality,
        })) || [],
    }
  } catch (error) {
    console.error("Error getting episode sources:", error)
    return { sources: [] }
  }
}

// Get recent episodes
export async function getRecentEpisodes(): Promise<AnimeResult[]> {
  try {
    // Try multiple popular anime titles in case one fails
    const popularQueries = ["demon slayer", "one piece", "jujutsu kaisen", "attack on titan", "my hero academia"]

    for (const query of popularQueries) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_PATH}/${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            return data.results.slice(0, 10).map((item: any) => ({
              id: item.id,
              title: item.title,
              image: item.image || "/vibrant-cityscape.png",
              releaseDate: item.releaseDate,
              type: item.type,
            }))
          }
        }
      } catch (err) {
        console.error(`Error searching for ${query}:`, err)
        // Continue to the next query
      }
    }

    // If all API calls fail, return fallback data
    return getFallbackAnimeData()
  } catch (error) {
    console.error("Error getting recent episodes:", error)
    // Return fallback data if the API is completely unavailable
    return getFallbackAnimeData()
  }
}

// Add a function to provide fallback data
function getFallbackAnimeData(): AnimeResult[] {
  return [
    {
      id: "demon-slayer",
      title: "Demon Slayer: Kimetsu no Yaiba",
      image: "/swords-against-shadows.png",
      type: "TV",
      releaseDate: "2019",
    },
    {
      id: "one-piece",
      title: "One Piece",
      image: "/Straw-Hat-Crew-Adventure.png",
      type: "TV",
      releaseDate: "1999",
    },
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      image: "/cursed-energy-clash.png",
      type: "TV",
      releaseDate: "2020",
    },
    {
      id: "attack-on-titan",
      title: "Attack on Titan",
      image: "/colossal-silhouette.png",
      type: "TV",
      releaseDate: "2013",
    },
    {
      id: "my-hero-academia",
      title: "My Hero Academia",
      image: "/hero-academy-gathering.png",
      type: "TV",
      releaseDate: "2016",
    },
    {
      id: "tokyo-revengers",
      title: "Tokyo Revengers",
      image: "/street-corner-gang.png",
      type: "TV",
      releaseDate: "2021",
    },
    {
      id: "chainsaw-man",
      title: "Chainsaw Man",
      image: "/demonic-figure.png",
      type: "TV",
      releaseDate: "2022",
    },
    {
      id: "spy-x-family",
      title: "Spy x Family",
      image: "/forger-family-outing.png",
      type: "TV",
      releaseDate: "2022",
    },
    {
      id: "bleach",
      title: "Bleach",
      image: "/Soul-Reaper-in-Shadows.png",
      type: "TV",
      releaseDate: "2004",
    },
    {
      id: "naruto",
      title: "Naruto",
      image: "/determined-ninja.png",
      type: "TV",
      releaseDate: "2002",
    },
  ]
}

// Get a single fallback anime detail
function getFallbackAnimeDetail(id: string): AnimeResult {
  const fallbackData = getFallbackAnimeData()
  const anime = fallbackData.find((anime) => anime.id === id) || fallbackData[0]

  return {
    ...anime,
    description:
      "This is a fallback description for when the API is unavailable. The actual anime description would provide information about the plot, characters, and setting of the anime.",
    genres: ["Action", "Adventure", "Fantasy"],
    status: "Completed",
    totalEpisodes: 24,
    episodes: Array.from({ length: 24 }, (_, i) => ({
      id: `${id}-episode-${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1}`,
    })),
    recommendations: fallbackData.filter((a) => a.id !== id).slice(0, 6),
  }
}

// Get popular anime
export async function getPopularAnime(): Promise<AnimeResult[]> {
  try {
    // For demo purposes, we'll search for popular titles
    const popularQueries = [
      "one piece",
      "naruto",
      "attack on titan",
      "demon slayer",
      "jujutsu kaisen",
      "my hero academia",
      "tokyo revengers",
      "chainsaw man",
      "spy x family",
      "bleach",
      "dragon ball",
      "hunter x hunter",
      "death note",
      "fullmetal alchemist",
      "one punch man",
    ]
    const results: AnimeResult[] = []

    // Get first result from each popular query
    for (const query of popularQueries) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_PATH}/${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            results.push({
              id: data.results[0].id,
              title: data.results[0].title,
              image: data.results[0].image || "/placeholder.svg?height=300&width=200&query=" + query,
              releaseDate: data.results[0].releaseDate,
              type: data.results[0].type,
            })
          }
        }
      } catch (err) {
        console.error(`Error searching for ${query}:`, err)
        // Continue to the next query
      }
    }

    // If we got at least some results, return them
    if (results.length > 0) {
      return results
    }

    // Otherwise, return fallback data
    return getFallbackAnimeData()
  } catch (error) {
    console.error("Error getting popular anime:", error)
    return getFallbackAnimeData()
  }
}

// Get related anime based on genre
export async function getRelatedAnime(genres: string[]): Promise<AnimeResult[]> {
  if (!genres || genres.length === 0) {
    return getFallbackAnimeData().slice(0, 6)
  }

  try {
    // Use the first genre to find related anime
    const genre = genres[0]
    const response = await fetch(`${API_BASE_URL}${API_PATH}/${encodeURIComponent(genre)}`)

    if (!response.ok) {
      return getFallbackAnimeData().slice(0, 6)
    }

    const data = await response.json()
    if (!data.results || !Array.isArray(data.results)) {
      return getFallbackAnimeData().slice(0, 6)
    }

    return data.results.slice(0, 6).map((item: any) => ({
      id: item.id,
      title: item.title,
      image: item.image || "/vibrant-cityscape.png",
      releaseDate: item.releaseDate,
      type: item.type,
    }))
  } catch (error) {
    console.error("Error getting related anime:", error)
    return getFallbackAnimeData().slice(0, 6)
  }
}
