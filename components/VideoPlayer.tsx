"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Settings } from "lucide-react"
import Hls from "hls.js"

interface VideoSource {
  url: string
  isM3U8: boolean
  quality: string
  isDub?: boolean
}

interface VideoPlayerProps {
  videoSources?: VideoSource[]
  poster?: string
  loading: boolean
  error: string | null
}

const VideoPlayer = ({ videoSources, poster, loading, error }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null)
  const [isDubbed, setIsDubbed] = useState<boolean>(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Parse quality from source quality string (e.g., "SCY · 720p BD" -> "720p")
  const parseQuality = (qualityString: string): string => {
    const match = qualityString.match(/(\d+)p/)
    return match ? match[0] : "Unknown"
  }

  // Get available qualities from sources
  const availableQualities = videoSources ? [...new Set(videoSources.map((s) => parseQuality(s.quality)))] : []

  // Check if dubbed versions are available
  const hasDubbed = videoSources ? videoSources.some((s) => s.isDub) : false

  // Initialize selected quality if not set
  useEffect(() => {
    if (availableQualities.length > 0 && !selectedQuality) {
      // Prefer 720p if available, otherwise use the highest quality
      const preferredQuality = availableQualities.includes("720p")
        ? "720p"
        : availableQualities.sort((a, b) => {
            const aNum = Number.parseInt(a.replace("p", ""))
            const bNum = Number.parseInt(b.replace("p", ""))
            return bNum - aNum
          })[0]
      setSelectedQuality(preferredQuality)
    }
  }, [availableQualities, selectedQuality])

  // Setup HLS player when sources or quality changes
  useEffect(() => {
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (!videoSources || videoSources.length === 0 || !videoRef.current || !selectedQuality) return

    // Find the best source based on selected quality and language preference
    const source = videoSources.find(
      (s) => parseQuality(s.quality) === selectedQuality && (isDubbed ? s.isDub : !s.isDub),
    )

    if (!source) {
      console.error("No matching source found for selected quality and language")
      return
    }

    if (source.isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.setRequestHeader("Referer", "https://kwik.cx/")
        },
      })
      hlsRef.current = hls
      hls.loadSource(source.url)
      hls.attachMedia(videoRef.current)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (videoRef.current) {
          videoRef.current.play().catch((e) => console.error("Autoplay prevented:", e))
        }
      })
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS error:", data)
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad()
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError()
          }
        }
      })
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari which has native HLS support
      videoRef.current.src = source.url
      videoRef.current.play().catch((e) => console.error("Autoplay prevented:", e))
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [videoSources, selectedQuality, isDubbed])

  // Show controls when mouse moves over video
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  return (
    <div
      className="relative w-full aspect-video bg-gray-900 mb-6 rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
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
      ) : videoSources && videoSources.length > 0 ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={poster}
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Quality and language controls */}
          {showControls && (
            <div className="absolute top-4 right-4 bg-black/70 rounded-md p-2 flex flex-col gap-2 transition-opacity duration-300">
              <div className="flex items-center justify-between mb-1">
                <Settings size={16} className="text-gray-300 mr-2" />
                <span className="text-xs text-gray-300">Settings</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Quality</span>
                <div className="flex flex-wrap gap-1">
                  {availableQualities.map((quality) => (
                    <button
                      key={quality}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedQuality === quality ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => setSelectedQuality(quality)}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>

              {hasDubbed && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Language</span>
                  <div className="flex gap-1">
                    <button
                      className={`px-2 py-1 text-xs rounded ${!isDubbed ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => setIsDubbed(false)}
                    >
                      SUB
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${isDubbed ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => setIsDubbed(true)}
                    >
                      DUB
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">No video source available</p>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
