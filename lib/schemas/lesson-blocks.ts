import { z } from "zod"
import { ChordDiagramDataSchema, FretboardDiagramDataSchema } from "./diagram-data"

/**
 * BlockType - The supported block types in the lesson workspace
 */
export const BlockTypeSchema = z.enum([
  "TextBlock",
  "ChordDiagram",
  "FretboardDiagram",
  "VideoEmbed"
])

export type BlockType = z.infer<typeof BlockTypeSchema>

/**
 * BlockId - Unique identifier for a block
 */
export type BlockId = string

/**
 * BaseBlock - Common fields for all block types
 */
export const BaseBlockSchema = z.object({
  id: z.string().uuid(),
  type: BlockTypeSchema,
  createdBy: z.enum(["ai", "user"]),
  createdAt: z.string().datetime()
})

export type BaseBlock = z.infer<typeof BaseBlockSchema>

/**
 * TextBlock - Rich markdown content
 */
export const TextBlockSchema = BaseBlockSchema.extend({
  type: z.literal("TextBlock"),
  content: z.string()
})

export type TextBlock = z.infer<typeof TextBlockSchema>

/**
 * ChordDiagramBlock - A chord diagram with optional UI flags
 */
export const ChordDiagramBlockSchema = BaseBlockSchema.extend({
  type: z.literal("ChordDiagram"),
  data: ChordDiagramDataSchema,
  animate: z.boolean().optional(),
  showIntervals: z.boolean().optional()
})

export type ChordDiagramBlock = z.infer<typeof ChordDiagramBlockSchema>

/**
 * FretboardDiagramBlock - A fretboard diagram with optional UI flags
 */
export const FretboardDiagramBlockSchema = BaseBlockSchema.extend({
  type: z.literal("FretboardDiagram"),
  data: FretboardDiagramDataSchema,
  highlightRoots: z.boolean().optional()
})

export type FretboardDiagramBlock = z.infer<typeof FretboardDiagramBlockSchema>

/**
 * VideoEmbedBlock - YouTube video embed
 */
export const VideoEmbedBlockSchema = BaseBlockSchema.extend({
  type: z.literal("VideoEmbed"),
  video: z.object({
    provider: z.literal("youtube"),
    videoId: z.string().min(1),
    startTimeSeconds: z.number().int().min(0).optional()
  })
})

export type VideoEmbedBlock = z.infer<typeof VideoEmbedBlockSchema>

/**
 * LessonBlock - Discriminated union of all block types
 */
export const LessonBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ChordDiagramBlockSchema,
  FretboardDiagramBlockSchema,
  VideoEmbedBlockSchema
])

export type LessonBlock = z.infer<typeof LessonBlockSchema>
