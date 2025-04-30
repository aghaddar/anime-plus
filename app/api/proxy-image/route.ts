import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    console.log(`Proxying image from: ${imageUrl}`)

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        // Add headers specifically for animepahe
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://animepahe.ru/",
        Origin: "https://animepahe.ru",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      // Return a placeholder image instead
      const placeholderUrl = new URL(request.url)
      placeholderUrl.pathname = "/placeholder.svg"
      placeholderUrl.search = "?height=300&width=200&query=Image+not+found"

      return NextResponse.redirect(placeholderUrl)
    }

    // Get the image data
    const imageData = await response.arrayBuffer()

    // Get the content type
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with the correct content type
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)

    // Return a placeholder image on error
    const placeholderUrl = new URL(request.url)
    placeholderUrl.pathname = "/placeholder.svg"
    placeholderUrl.search = "?height=300&width=200&query=Error+loading+image"

    return NextResponse.redirect(placeholderUrl)
  }
}
