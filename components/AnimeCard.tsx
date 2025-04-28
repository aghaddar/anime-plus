"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface AnimeCardProps {
  id: string
  title: string
  image: string
  type?: string
  releaseDate?: string
}

const AnimeCard = ({ id, title, image, type, releaseDate }: AnimeCardProps) => {
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/anime/${id}`} className="group">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md mb-2 bg-gray-800">
        <Image
          src={imageError ? `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}` : image}
          alt={title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
      {(type || releaseDate) && (
        <p className="text-xs text-gray-400 mt-1">
          {type && <span>{type}</span>}
          {type && releaseDate && <span> • </span>}
          {releaseDate && <span>{releaseDate}</span>}
        </p>
      )}
    </Link>
  )
}

export default AnimeCard
