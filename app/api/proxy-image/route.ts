import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        // Add common headers that might help bypass restrictions
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://animepahe.ru/",
        Origin: "https://animepahe.ru",
      },
    })

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status })
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
    return new NextResponse("Error proxying image", { status: 500 })
  }
}
