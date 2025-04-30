import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is an HLS segment request (they typically end with .ts or have a hash pattern)
  if (
    pathname.includes("/watch/") &&
    (pathname.endsWith(".ts") || pathname.match(/[a-f0-9]{32,}/i) || pathname.includes(".m3u8"))
  ) {
    // Extract the animeId and episodeId from the URL
    const parts = pathname.split("/")
    if (parts.length >= 4) {
      const animeId = parts[2]

      // For the episodeId, we need to join all remaining parts
      // This handles cases where episodeId contains slashes
      const remainingParts = parts.slice(3)
      const episodeId = remainingParts.join("/")

      // Remove any file extension from the episodeId
      const cleanEpisodeId = episodeId.split(".")[0]

      // Only redirect if the current URL doesn't match the expected pattern
      if (pathname !== `/watch/${animeId}/${cleanEpisodeId}`) {
        return NextResponse.redirect(new URL(`/watch/${animeId}/${cleanEpisodeId}`, request.url))
      }
    }
  }

  return NextResponse.next()
}

// Only run the middleware on watch routes
export const config = {
  matcher: "/watch/:path*",
}
