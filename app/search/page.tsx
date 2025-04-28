import { Suspense } from "react"
import { searchAnime } from "@/lib/api"
import AnimeCard from "@/components/AnimeCard"

interface SearchPageProps {
  searchParams: { q: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const results = await searchAnime(query)

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>

      <Suspense fallback={<div className="h-60 flex items-center justify-center">Searching...</div>}>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
                image={anime.image}
                type={anime.type}
                releaseDate={anime.releaseDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No results found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}
