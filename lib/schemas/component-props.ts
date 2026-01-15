import { z } from "zod"
import { ChordDiagramDataSchema, FretboardDiagramDataSchema } from "./diagram-data"

/**
 * TextBlockProps - Props for the TextBlock component
 */
export const TextBlockPropsSchema = z.object({
  content: z.string()
})

export type TextBlockProps = z.infer<typeof TextBlockPropsSchema>

/**
 * ChordDiagramProps - Props for the ChordDiagram component
 */
export const ChordDiagramPropsSchema = z.object({
  data: ChordDiagramDataSchema,
  animate: z.boolean().optional(),
  showIntervals: z.boolean().optional()
})

export type ChordDiagramProps = z.infer<typeof ChordDiagramPropsSchema>

/**
 * FretboardDiagramProps - Props for the FretboardDiagram component
 */
export const FretboardDiagramPropsSchema = z.object({
  data: FretboardDiagramDataSchema,
  highlightRoots: z.boolean().optional()
})

export type FretboardDiagramProps = z.infer<typeof FretboardDiagramPropsSchema>

/**
 * VideoEmbedProps - Props for the VideoEmbed component
 */
export const VideoEmbedPropsSchema = z.object({
  provider: z.literal("youtube"),
  videoId: z.string().min(1),
  startTimeSeconds: z.number().int().min(0).optional()
})

export type VideoEmbedProps = z.infer<typeof VideoEmbedPropsSchema>
