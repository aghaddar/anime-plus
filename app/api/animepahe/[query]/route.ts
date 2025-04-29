import { NextResponse } from "next/server"
import { MOCK_POPULAR_ANIME, type AnimeResult } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { query: string } }) {
  try {
    const query = params.query
    console.log(`API route: /api/anime/animepahe/${query} called`)

    // Filter mock data based on query
    const results = MOCK_POPULAR_ANIME.filter((anime: AnimeResult) =>
      anime.title.toLowerCase().includes(query.toLowerCase()),
    )

    console.log(`Returning ${results.length} search results for query: ${query}`)

    return NextResponse.json({
      currentPage: 1,
      hasNextPage: false,
      results: results,
    })
  } catch (error) {
    console.error("Error in animepahe search API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
