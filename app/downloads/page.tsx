"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, Trash2, Play, Pause, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock downloads data
const initialDownloads = [
  {
    id: "demon-slayer-ep-12",
    animeId: "demon-slayer",
    title: "Demon Slayer",
    episodeNumber: 12,
    episodeTitle: "The Boar Bares Its Fangs, Zenitsu Sleeps",
    image: "/swords-against-shadows.png",
    status: "completed", // completed, downloading, paused, error
    progress: 100,
    size: "245 MB",
  },
  {
    id: "one-piece-ep-1047",
    animeId: "one-piece",
    title: "One Piece",
    episodeNumber: 1047,
    episodeTitle: "Luffy's Dream! To the Final Island!",
    image: "/Straw-Hat-Crew-Adventure.png",
    status: "downloading",
    progress: 65,
    size: "320 MB",
  },
  {
    id: "jujutsu-kaisen-ep-8",
    animeId: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    episodeNumber: 8,
    episodeTitle: "Boredom",
    image: "/cursed-energy-clash.png",
    status: "paused",
    progress: 30,
    size: "280 MB",
  },
  {
    id: "attack-on-titan-ep-22",
    animeId: "attack-on-titan",
    title: "Attack on Titan",
    episodeNumber: 22,
    episodeTitle: "The Defeated",
    image: "/colossal-silhouette.png",
    status: "error",
    progress: 45,
    size: "310 MB",
  },
]

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState(initialDownloads)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />
      case "downloading":
        return <Download size={16} className="text-blue-500" />
      case "paused":
        return <Pause size={16} className="text-yellow-500" />
      case "error":
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "downloading":
        return "Downloading"
      case "paused":
        return "Paused"
      case "error":
        return "Error"
      default:
        return ""
    }
  }

  const toggleDownload = (id: string) => {
    setDownloads(
      downloads.map((download) => {
        if (download.id === id) {
          const newStatus = download.status === "paused" ? "downloading" : "paused"
          return { ...download, status: newStatus }
        }
        return download
      }),
    )
  }

  const removeDownload = (id: string) => {
    setDownloads(downloads.filter((download) => download.id !== id))
  }

  const clearAllDownloads = () => {
    if (confirm("Are you sure you want to clear all downloads?")) {
      setDownloads([])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Downloads</h1>
        {downloads.length > 0 && (
          <Button variant="outline" className="text-red-500 border-red-500" onClick={clearAllDownloads}>
            <Trash2 size={16} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-lg">
          <p className="text-gray-400 mb-4">You have no downloads</p>
          <p className="text-sm text-gray-500">
            Downloaded episodes will appear here and will be available to watch offline
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {downloads.map((download) => (
            <div key={download.id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-32 sm:h-auto relative">
                <Image src={download.image || "/placeholder.svg"} alt={download.title} fill className="object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    {download.title} - Episode {download.episodeNumber}
                  </h3>
                  <p className="text-gray-400 text-sm">{download.episodeTitle}</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center">
                        {getStatusIcon(download.status)}
                        <span className="ml-1">{getStatusText(download.status)}</span>
                      </div>
                      <span>{download.size}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${download.status === "error" ? "bg-red-500" : "bg-purple-500"}`}
                        style={{ width: `${download.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  {download.status === "completed" ? (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Play size={16} className="mr-1" />
                      Play
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDownload(download.id)}
                      disabled={download.status === "error"}
                    >
                      {download.status === "paused" ? (
                        <>
                          <Download size={16} className="mr-1" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause size={16} className="mr-1" />
                          Pause
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-500"
                    onClick={() => removeDownload(download.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
