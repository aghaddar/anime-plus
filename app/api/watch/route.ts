import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get("episodeId")

    console.log(`API route: /api/anime/animepahe/watch called with episodeId: ${episodeId}`)

    if (!episodeId) {
      return NextResponse.json({ error: "Episode ID is required" }, { status: 400 })
    }

    // Return mock video sources
    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("Error in animepahe watch API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
