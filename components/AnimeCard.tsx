"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface AnimeCardProps {
  id: string
  title: string
  image: string
  type?: string
  releaseDate?: string | number
  rating?: number
}

const AnimeCard = ({ id, title, image, type, releaseDate, rating }: AnimeCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [isExternalImage, setIsExternalImage] = useState(image?.startsWith("http"))

  // Convert releaseDate to string if it's a number
  const formattedReleaseDate = typeof releaseDate === "number" ? releaseDate.toString() : releaseDate

  // Use a placeholder image if the image URL is invalid or if an error occurs
  const imageUrl =
    imageError || !image
      ? `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`
      : isExternalImage
        ? `/api/proxy-image?url=${encodeURIComponent(image)}`
        : image

  return (
    <Link href={`/anime/${id}`} className="group">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md mb-2 bg-gray-800">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-md">
            {rating.toFixed(1)}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
      {(type || formattedReleaseDate) && (
        <p className="text-xs text-gray-400 mt-1">
          {type && <span>{type}</span>}
          {type && formattedReleaseDate && <span> • </span>}
          {formattedReleaseDate && <span>{formattedReleaseDate}</span>}
        </p>
      )}
    </Link>
  )
}

export default AnimeCard
