"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist"

interface Anime {
  id: string
  title: string
  description?: string
  type?: string
  releaseDate?: string
  image?: string
}

interface HeroSliderProps {
  featuredAnime: Anime[]
}

const HeroSlider = ({ featuredAnime }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inWatchlist, setInWatchlist] = useState(false)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === featuredAnime.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? featuredAnime.length - 1 : prevIndex - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 8000)

    return () => clearInterval(interval)
  }, [currentIndex])

  useEffect(() => {
    // Check if current anime is in watchlist
    if (featuredAnime.length > 0) {
      setInWatchlist(isInWatchlist(featuredAnime[currentIndex].id))
    }
  }, [currentIndex, featuredAnime])

  const toggleWatchlist = () => {
    const anime = featuredAnime[currentIndex]
    if (inWatchlist) {
      removeFromWatchlist(anime.id)
      setInWatchlist(false)
    } else {
      // Ensure image is always a string when adding to watchlist
      addToWatchlist({
        ...anime,
        image: anime.image || `/placeholder.svg?height=500&width=1000&query=${encodeURIComponent(anime.title)}`,
      })
      setInWatchlist(true)
    }
  }

  // Simple function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.onerror = null // Prevent infinite loop
    target.src = `/placeholder.svg?height=500&width=1000&query=${encodeURIComponent(featuredAnime[currentIndex].title)}`
  }

  if (!featuredAnime || featuredAnime.length === 0) return null

  const current = featuredAnime[currentIndex]
  const imageUrl = current.image || `/placeholder.svg?height=500&width=1000&query=${encodeURIComponent(current.title)}`

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={current.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-8 md:p-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{current.title}</h1>
        <div className="flex items-center text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4">
          <span>{current.type || "TV"}</span>
          <span className="mx-2">•</span>
          <span>{current.releaseDate || "2023"}</span>
        </div>
        <p className="text-gray-300 mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
          {current.description || "No description available."}
        </p>
        <div className="flex space-x-2 sm:space-x-4">
          <Link href={`/anime/${current.id}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4">
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
          </Link>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4"
            onClick={toggleWatchlist}
          >
            {inWatchlist ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

export default HeroSlider
