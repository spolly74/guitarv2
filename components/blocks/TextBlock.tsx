"use client"

import ReactMarkdown from "react-markdown"
import type { TextBlock as TextBlockType } from "@/lib/schemas"

interface TextBlockProps {
  block: TextBlockType
}

export function TextBlock({ block }: TextBlockProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>{block.content}</ReactMarkdown>
    </div>
  )
}
