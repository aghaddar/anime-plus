import { Suspense } from "react"
import HeroSlider from "@/components/HeroSlider"
import HeroSliderSkeleton from "@/components/HeroSliderSkeleton"
import AnimeList from "@/components/AnimeList"
import AnimeListSkeleton from "@/components/AnimeListSkeleton"
import { getPopularAnime, getRecentEpisodes } from "@/lib/api"

// Placeholder data for the hero slider
const FEATURED_ANIME = [
  {
    id: "zenshu",
    title: "Zenshu",
    description:
      "After graduating from high school, Nagase finds her career as an animator. Her talent quickly flourishes, and she makes her debut as a director in a short film. Her next project is set to be a romantic comedy movie themed around a high school setting. Having never been in love herself, she's unable to create the story about a coming-of-age movie production to come to a standstill.",
    type: "TV",
    releaseDate: "Jan 5, 2025",
    image: "/street-beats.png",
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    description:
      "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    type: "TV",
    releaseDate: "Apr 6, 2019",
    image: "/demon-slayer-trio.png",
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    description:
      "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    type: "TV",
    releaseDate: "Apr 7, 2013",
    image: "/colossal-silhouette.png",
  },
]

async function getAnimeData() {
  try {
    console.log("Fetching anime data for home page...")
    const popularAnime = await getPopularAnime()
    console.log(`Retrieved ${popularAnime.length} popular anime titles`)

    const recentEpisodes = await getRecentEpisodes()
    console.log(`Retrieved ${recentEpisodes.length} recent episodes`)

    // For recommended, we'll just use the popular anime for demo purposes
    const recommendedAnime = [...popularAnime].sort(() => Math.random() - 0.5)

    return {
      popularAnime,
      recentEpisodes,
      recommendedAnime,
    }
  } catch (error) {
    console.error("Error in getAnimeData:", error)
    // Return empty arrays as fallback
    return {
      popularAnime: [],
      recentEpisodes: [],
      recommendedAnime: [],
    }
  }
}

export default async function Home() {
  const { popularAnime, recentEpisodes, recommendedAnime } = await getAnimeData()

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HeroSlider featuredAnime={FEATURED_ANIME} />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Most Popular" />}>
        <AnimeList
          title="Most Popular"
          animeList={popularAnime.map(anime => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/popular"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Trending Anime" />}>
        <AnimeList
          title="Trending Anime"
          animeList={recommendedAnime.map(anime => ({
            ...anime,
            releaseDate: typeof anime.releaseDate === "number" ? anime.releaseDate.toString() : anime.releaseDate,
          }))}
          viewAllLink="/trending"
        />
      </Suspense>
    </div>
  )
}
