"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import type { AnimeResult } from "@/lib/api"
import { getWatchlist } from "@/lib/watchlist"

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<AnimeResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(watchlist.length / itemsPerPage)

  useEffect(() => {
    // Get watchlist from storage
    const storedWatchlist = getWatchlist()

    // If empty, populate with mock data for demo purposes
    if (storedWatchlist.length === 0) {
      setWatchlist(getMockWatchlistData())
    } else {
      setWatchlist(storedWatchlist)
    }

    // Add event listener to update watchlist when localStorage changes
    const handleStorageChange = () => {
      const updatedWatchlist = getWatchlist()
      if (updatedWatchlist.length === 0) {
        setWatchlist(getMockWatchlistData())
      } else {
        setWatchlist(updatedWatchlist)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for when watchlist changes within the same window
    window.addEventListener("watchlistUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("watchlistUpdated", handleStorageChange)
    }
  }, [])

  // Get current page items
  const currentItems = watchlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-purple-500">Watchlist:</h1>

        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Your watchlist is empty</p>
            <Link href="/" className="text-purple-500 hover:text-purple-400">
              Browse anime to add to your watchlist
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {currentItems.map((anime) => (
                <Link key={anime.id} href={`/anime/${anime.id}`} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-800 hover:opacity-80 transition-opacity">
                    <Image src={anime.image || "/placeholder.svg"} alt={anime.title} fill className="object-cover" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium truncate">{anime.title}</h3>
                  {anime.type && <p className="text-xs text-gray-400">{anime.type}</p>}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        currentPage === page ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-800"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Mock data for demonstration purposes
function getMockWatchlistData(): AnimeResult[] {
  const animes = [
    {
      id: "black-clover",
      title: "Black Clover",
      image: "/black-clover-inspired-team.png",
      type: "TV",
      releaseDate: "2017",
    },
    {
      id: "one-piece",
      title: "One Piece",
      image: "/Straw-Hat-Crew-Adventure.png",
      type: "TV",
      releaseDate: "1999",
    },
    {
      id: "naruto",
      title: "Naruto",
      image: "/determined-ninja.png",
      type: "TV",
      releaseDate: "2002",
    },
    {
      id: "dragon-ball",
      title: "Dragon Ball",
      image: "/epic-anime-showdown.png",
      type: "TV",
      releaseDate: "1986",
    },
    {
      id: "demon-slayer",
      title: "Demon Slayer",
      image: "/swords-against-shadows.png",
      type: "TV",
      releaseDate: "2019",
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
  ]

  // Create multiple copies to demonstrate pagination
  return [...animes, ...animes, ...animes, ...animes].slice(0, 20)
}
