// Update the watch route to properly handle query parameters with slashes
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get("episodeId")

    console.log(`API route: /api/anime/animepahe/watch called with episodeId: ${episodeId}`)

    if (!episodeId) {
      console.error("Missing episodeId parameter")
      return NextResponse.json({ error: "Episode ID is required" }, { status: 400 })
    }

    // For debugging purposes, log the full URL and parameters
    console.log(`Full request URL: ${request.url}`)
    console.log(`Search params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}`)

    // Log the raw episodeId to see if it contains slashes
    console.log(`Raw episodeId: ${episodeId}`)

    // Check if episodeId contains slashes and log parts
    if (episodeId.includes("/")) {
      const parts = episodeId.split("/")
      console.log(`EpisodeId contains slashes. Parts:`, parts)
    }

    // Return mock video sources with a consistent structure
    const response = {
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
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          isM3U8: true,
          quality: "360p",
          isDub: false,
        },
        {
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          isM3U8: true,
          quality: "720p [English Dub]",
          isDub: true,
        },
      ],
      download: `https://example.com/download/${episodeId}`,
    }

    console.log(`Returning mock sources for episode: ${episodeId}`, {
      sourceCount: response.sources.length,
      firstSource: response.sources[0],
    })

    // Set appropriate headers to prevent caching issues
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in animepahe watch API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
