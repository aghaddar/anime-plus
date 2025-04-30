export async function getAnimeInfo(id: string) {
  // Construct the full URL with the correct path
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  const url = `${API_BASE_URL}/anime/animepahe/info/${encodeURIComponent(id)}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch anime info: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getAnimeInfo:", error)
    return null
  }
}

export async function getEpisodeSources(episodeId: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  const url = `${API_BASE_URL}/anime/animepahe/watch?id=${encodeURIComponent(episodeId)}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch episode sources: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getEpisodeSources:", error)
    return null
  }
}
