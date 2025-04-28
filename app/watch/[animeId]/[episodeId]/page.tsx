"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAnimeInfo, getEpisodeSources, type AnimeResult, type AnimeSource } from "@/lib/api"
import VideoPlayer from "@/components/VideoPlayer"
import AnimeInfo from "@/components/AnimeInfo"
import EpisodePagination from "@/components/EpisodePagination"
import RelatedAnime from "@/components/RelatedAnime"
import CommentSection from "@/components/CommentSection"
import { ArrowLeft } from "lucide-react"

interface WatchPageProps {
  params: { animeId: string; episodeId: string }
}

export default function WatchPage({ params }: WatchPageProps) {
  const router = useRouter()
  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [sources, setSources] = useState<AnimeSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch anime info
        const info = await getAnimeInfo(params.animeId)
        setAnimeInfo(info)

        // Find current episode number
        if (info?.episodes) {
          const episode = info.episodes.find((ep) => ep.id === params.episodeId)
          if (episode) {
            setCurrentEpisodeNumber(episode.number)
          }
        }

        // Fetch episode sources
        const episodeSources = await getEpisodeSources(params.episodeId)
        setSources(episodeSources)
      } catch (err) {
        setError("Failed to load video. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.animeId, params.episodeId])

  // Find the best quality source
  const videoSource =
    sources?.sources?.find((s) => s.quality === "1080p" || s.quality === "720p")?.url || sources?.sources?.[0]?.url

  // Find next and previous episodes
  const currentIndex = animeInfo?.episodes?.findIndex((ep) => ep.id === params.episodeId) ?? -1
  const prevEpisode = currentIndex > 0 ? animeInfo?.episodes?.[currentIndex - 1] : null
  const nextEpisode =
    currentIndex >= 0 && currentIndex < (animeInfo?.episodes?.length || 0) - 1
      ? animeInfo?.episodes?.[currentIndex + 1]
      : null

  return (
    <div className="bg-black min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/anime/${params.animeId}`)}
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to anime
        </button>

        <div className="grid grid-cols-1 gap-6">
          {/* Main content - Video and Info */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <VideoPlayer videoSource={videoSource} poster={animeInfo?.image} loading={loading} error={error} />

            {/* Anime Info with Action Buttons */}
            <AnimeInfo
              id={params.animeId}
              title={animeInfo?.title || ""}
              episodeNumber={currentEpisodeNumber}
              description={animeInfo?.description || ""}
              type={animeInfo?.type}
              status={animeInfo?.status}
              releaseDate={animeInfo?.releaseDate}
              totalEpisodes={animeInfo?.totalEpisodes}
              prevEpisode={prevEpisode}
              nextEpisode={nextEpisode}
              animeId={params.animeId}
              image={animeInfo?.image}
            />

            {/* Episodes */}
            <div className="mt-8 bg-gray-900 p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4">All Episodes</h2>
              {animeInfo?.episodes && (
                <EpisodePagination
                  episodes={animeInfo.episodes}
                  currentEpisodeId={params.episodeId}
                  onEpisodeClick={(episodeId) => router.push(`/watch/${params.animeId}/${episodeId}`)}
                />
              )}
            </div>

            {/* Comments Section */}
            <CommentSection episodeId={params.episodeId} />
          </div>

          {/* Sidebar - Related Anime - Only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-1">
            <RelatedAnime animeList={animeInfo?.recommendations || []} />
          </div>

          {/* Related Anime for mobile - Visible only on smaller screens */}
          <div className="lg:hidden">
            <RelatedAnime animeList={animeInfo?.recommendations || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
