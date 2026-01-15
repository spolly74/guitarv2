"use client"

import type { LessonBlock } from "@/lib/schemas"
import { TextBlock } from "@/components/blocks/TextBlock"
import { ChordDiagramBlock } from "@/components/blocks/ChordDiagramBlock"
import { FretboardDiagramBlock } from "@/components/blocks/FretboardDiagramBlock"
import { VideoEmbedBlock } from "@/components/blocks/VideoEmbedBlock"

interface BlockRendererProps {
  block: LessonBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "TextBlock":
      return <TextBlock block={block} />

    case "ChordDiagram":
      return <ChordDiagramBlock block={block} />

    case "FretboardDiagram":
      return <FretboardDiagramBlock block={block} />

    case "VideoEmbed":
      return <VideoEmbedBlock block={block} />

    default:
      // TypeScript should catch this, but just in case
      console.error(`Unknown block type: ${(block as LessonBlock).type}`)
      return null
  }
}
