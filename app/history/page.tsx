"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock watch history data
const initialWatchHistory = [
  {
    id: "demon-slayer-ep-12",
    animeId: "demon-slayer",
    title: "Demon Slayer",
    episodeNumber: 12,
    episodeTitle: "The Boar Bares Its Fangs, Zenitsu Sleeps",
    image: "/swords-against-shadows.png",
    watchedAt: "2023-11-15T14:30:00Z",
    progress: 95, // percentage watched
  },
  {
    id: "one-piece-ep-1047",
    animeId: "one-piece",
    title: "One Piece",
    episodeNumber: 1047,
    episodeTitle: "Luffy's Dream! To the Final Island!",
    image: "/Straw-Hat-Crew-Adventure.png",
    watchedAt: "2023-11-14T20:15:00Z",
    progress: 100,
  },
  {
    id: "jujutsu-kaisen-ep-8",
    animeId: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    episodeNumber: 8,
    episodeTitle: "Boredom",
    image: "/cursed-energy-clash.png",
    watchedAt: "2023-11-12T18:45:00Z",
    progress: 78,
  },
  {
    id: "attack-on-titan-ep-22",
    animeId: "attack-on-titan",
    title: "Attack on Titan",
    episodeNumber: 22,
    episodeTitle: "The Defeated",
    image: "/colossal-silhouette.png",
    watchedAt: "2023-11-10T21:20:00Z",
    progress: 100,
  },
]

export default function HistoryPage() {
  const [watchHistory, setWatchHistory] = useState(initialWatchHistory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const removeFromHistory = (id: string) => {
    setWatchHistory(watchHistory.filter((item) => item.id !== id))
  }

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear your entire watch history?")) {
      setWatchHistory([])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Watch History</h1>
        {watchHistory.length > 0 && (
          <Button variant="outline" className="text-red-500 border-red-500" onClick={clearAllHistory}>
            <Trash2 size={16} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {watchHistory.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-lg">
          <p className="text-gray-400 mb-4">Your watch history is empty</p>
          <Link href="/" className="text-purple-500 hover:text-purple-400">
            Browse anime to start watching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {watchHistory.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-32 sm:h-auto relative">
                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div className="h-full bg-purple-500" style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    {item.title} - Episode {item.episodeNumber}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.episodeTitle}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(item.watchedAt)}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="mr-1" />
                      <span>{formatTime(item.watchedAt)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/watch/${item.animeId}/${item.id}`}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                    >
                      Resume
                    </Link>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Remove from history"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
