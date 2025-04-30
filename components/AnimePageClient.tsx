"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Check, Clock, Calendar, Star, Info, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnimeResult } from "@/lib/api"
import AnimeList from "@/components/AnimeList"
import EpisodePagination from "@/components/EpisodePagination"
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist"

interface AnimePageClientProps {
  animeInfo: AnimeResult | null
  relatedAnime: AnimeResult[]
}

export default function AnimePageClient({ animeInfo, relatedAnime }: AnimePageClientProps) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Check if anime is in watchlist
    if (animeInfo) {
      setInWatchlist(isInWatchlist(animeInfo.id))
    }
    // Reset image error state when animeInfo changes
    setImageError(false)
  }, [animeInfo])

  const toggleWatchlist = () => {
    if (!animeInfo) return

    if (inWatchlist) {
      removeFromWatchlist(animeInfo.id)
      setInWatchlist(false)
    } else {
      addToWatchlist(animeInfo)
      setInWatchlist(true)
    }
  }

  const shareAnime = () => {
    if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
      navigator
        .share({
          title: animeInfo?.title || "Check out this anime",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Error copying link:", err))
    }
  }

  // Function to get the appropriate image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl || imageError) {
      return `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(animeInfo?.title || "anime")}`
    }

    // Check if the image URL is external (starts with http or https)
    if (imageUrl.startsWith("http")) {
      // Use the proxy for external images to avoid CORS issues
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    }

    // For local images (from public directory)
    return imageUrl
  }

  if (!animeInfo) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
        <p className="text-gray-400 mb-6">The anime you're looking for doesn't exist or is unavailable.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    )
  }

  const coverImage = getImageUrl(animeInfo.image)
  const backdropImage = getImageUrl(animeInfo.image)

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backdropImage || "/placeholder.svg"}
            alt={animeInfo.title}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        </div>

        <div className="relative h-full flex items-center p-4 sm:p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 max-w-5xl">
            {/* Anime Cover Image */}
            <div className="w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 relative flex-shrink-0 rounded-md overflow-hidden shadow-lg">
              <Image
                src={coverImage || "/placeholder.svg"}
                alt={animeInfo.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Anime Details */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{animeInfo.title}</h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4 gap-y-1 sm:gap-y-2">
                {animeInfo.type && (
                  <div className="flex items-center mr-3 sm:mr-4">
                    <Info className="w-4 h-4 mr-1" />
                    <span>{animeInfo.type}</span>
                  </div>
                )}

                {animeInfo.releaseDate && (
                  <div className="flex items-center mr-3 sm:mr-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{animeInfo.releaseDate.toString()}</span>
                  </div>
                )}

                {animeInfo.status && (
                  <div className="flex items-center mr-3 sm:mr-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{animeInfo.status}</span>
                  </div>
                )}

                {animeInfo.totalEpisodes && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span>{animeInfo.totalEpisodes} Episodes</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {animeInfo.genres && animeInfo.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                  {animeInfo.genres.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-gray-800 rounded-full text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                {animeInfo.description || "No description available."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {animeInfo.episodes && animeInfo.episodes.length > 0 ? (
                  <Link href={`/watch/${animeInfo.id}/${animeInfo.episodes[0].id}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2 px-4">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2 px-4"
                    disabled
                  >
                    <Play className="w-4 h-4 mr-2" />
                    No Episodes Available
                  </Button>
                )}

                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2 px-4"
                  onClick={toggleWatchlist}
                >
                  {inWatchlist ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>

                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2 px-4"
                  onClick={shareAnime}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Episodes</h2>

        {animeInfo.episodes && animeInfo.episodes.length > 0 ? (
          <div className="bg-gray-900 p-3 sm:p-4 rounded-lg">
            <EpisodePagination
              episodes={animeInfo.episodes}
              currentEpisodeId=""
              onEpisodeClick={(episodeId) => {
                window.location.href = `/watch/${animeInfo.id}/${episodeId}`
              }}
            />
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-400">No episodes available</p>
          </div>
        )}
      </div>

      {/* Related Anime Section */}
      <div className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
        <AnimeList
          title="You May Also Like"
          animeList={relatedAnime.map((anime) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
        />
      </div>
    </div>
  )
}
