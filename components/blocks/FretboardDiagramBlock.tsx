"use client"

import { FretboardDiagram, DiagramErrorBoundary } from "@/components/diagrams"
import type { FretboardDiagramBlock as FretboardDiagramBlockType } from "@/lib/schemas"

interface FretboardDiagramBlockProps {
  block: FretboardDiagramBlockType
}

export function FretboardDiagramBlock({ block }: FretboardDiagramBlockProps) {
  return (
    <div className="w-full h-[180px] overflow-x-auto">
      <DiagramErrorBoundary>
        <FretboardDiagram
          data={block.data}
          highlightRoots={block.highlightRoots}
        />
      </DiagramErrorBoundary>
    </div>
  )
}
