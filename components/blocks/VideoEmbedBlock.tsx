"use client"

import type { VideoEmbedBlock as VideoEmbedBlockType } from "@/lib/schemas"

interface VideoEmbedBlockProps {
  block: VideoEmbedBlockType
}

export function VideoEmbedBlock({ block }: VideoEmbedBlockProps) {
  const { videoId, startTimeSeconds } = block.video

  const embedUrl = startTimeSeconds
    ? `https://www.youtube.com/embed/${videoId}?start=${startTimeSeconds}`
    : `https://www.youtube.com/embed/${videoId}`

  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        className="absolute inset-0 w-full h-full rounded-lg"
        src={embedUrl}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
