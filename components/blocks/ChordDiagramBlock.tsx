"use client"

import { ChordDiagram, DiagramErrorBoundary } from "@/components/diagrams"
import type { ChordDiagramBlock as ChordDiagramBlockType } from "@/lib/schemas"

interface ChordDiagramBlockProps {
  block: ChordDiagramBlockType
}

export function ChordDiagramBlock({ block }: ChordDiagramBlockProps) {
  return (
    <DiagramErrorBoundary>
      <ChordDiagram
        data={block.data}
        animate={block.animate}
        showIntervals={block.showIntervals}
      />
    </DiagramErrorBoundary>
  )
}
