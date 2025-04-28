"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

interface VideoPlayerProps {
  videoSource?: string
  poster?: string
  loading: boolean
  error: string | null
}

const VideoPlayer = ({ videoSource, poster, loading, error }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="relative w-full aspect-video bg-gray-900 mb-6 rounded-lg overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <div>
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 text-white flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      ) : videoSource ? (
        <video
          src={videoSource}
          controls
          autoPlay
          className="w-full h-full"
          poster={poster}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">No video source available</p>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
