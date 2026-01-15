import { v4 as uuidv4 } from "uuid"
import {
  ChordDiagramDataSchema,
  FretboardDiagramDataSchema,
  type LessonBlock
} from "@/lib/schemas"
import {
  lookupVoicings,
  getVoicing
} from "@/lib/reference/chord-voicings"

/**
 * Tool call from Claude
 */
export interface ToolCall {
  id: string
  name: string
  input: unknown
}

/**
 * Result of handling a tool call
 */
export interface ToolCallResult {
  success: boolean
  block?: LessonBlock
  data?: unknown
  error?: string
}

/**
 * Handle a tool call from Claude and return a validated block
 */
export async function handleToolCall(toolCall: ToolCall): Promise<ToolCallResult> {
  const timestamp = new Date().toISOString()

  switch (toolCall.name) {
    case "lookup_chord_voicing": {
      const input = toolCall.input as {
        root: string
        quality: string
        voicingIndex?: number
      }

      if (!input.root || !input.quality) {
        return {
          success: false,
          error: "lookup_chord_voicing requires root and quality"
        }
      }

      // If a specific voicing index is requested, return just that one
      if (typeof input.voicingIndex === "number") {
        const voicing = getVoicing(input.root, input.quality, input.voicingIndex)
        if (!voicing) {
          return {
            success: false,
            error: `No voicing at index ${input.voicingIndex} for ${input.root}${input.quality}`
          }
        }
        return {
          success: true,
          data: {
            voicing,
            usage: "Use the positions, baseFret, and mutedStrings with create_chord_diagram."
          }
        }
      }

      // Otherwise return all matching voicings
      const voicings = lookupVoicings(input.root, input.quality)
      if (voicings.length === 0) {
        return {
          success: false,
          error: `No voicings found for ${input.root} ${input.quality}. Try: maj, m, maj7, m7, 7`
        }
      }

      // Add root and quality to each voicing for convenience
      const voicingsWithMeta = voicings.map((v, index) => ({
        index,
        root: input.root,
        quality: input.quality,
        ...v
      }))

      return {
        success: true,
        data: {
          voicings: voicingsWithMeta,
          usage: "Use the positions, baseFret, and mutedStrings from any voicing with create_chord_diagram."
        }
      }
    }

    case "create_chord_diagram": {
      // Add id if not provided by AI
      const inputWithId = {
        id: uuidv4(),
        ...(toolCall.input as object)
      }
      const parsed = ChordDiagramDataSchema.safeParse(inputWithId)

      if (!parsed.success) {
        return {
          success: false,
          error: `Invalid chord diagram data: ${parsed.error.message}`
        }
      }

      const block: LessonBlock = {
        id: uuidv4(),
        type: "ChordDiagram",
        createdBy: "ai",
        createdAt: timestamp,
        data: parsed.data,
        animate: true,
        showIntervals: true
      }

      return { success: true, block }
    }

    case "create_fretboard_diagram": {
      // Add id if not provided by AI
      const inputWithId = {
        id: uuidv4(),
        ...(toolCall.input as object)
      }
      const parsed = FretboardDiagramDataSchema.safeParse(inputWithId)

      if (!parsed.success) {
        return {
          success: false,
          error: `Invalid fretboard diagram data: ${parsed.error.message}`
        }
      }

      const block: LessonBlock = {
        id: uuidv4(),
        type: "FretboardDiagram",
        createdBy: "ai",
        createdAt: timestamp,
        data: parsed.data,
        highlightRoots: true
      }

      return { success: true, block }
    }

    case "add_text_block": {
      const input = toolCall.input as { content?: string }

      if (!input.content || typeof input.content !== "string") {
        return {
          success: false,
          error: "Text block requires content string"
        }
      }

      const block: LessonBlock = {
        id: uuidv4(),
        type: "TextBlock",
        createdBy: "ai",
        createdAt: timestamp,
        content: input.content
      }

      return { success: true, block }
    }

    case "embed_video": {
      const input = toolCall.input as { videoId?: string; startTimeSeconds?: number }

      if (!input.videoId || typeof input.videoId !== "string") {
        return {
          success: false,
          error: "Video embed requires videoId string"
        }
      }

      const block: LessonBlock = {
        id: uuidv4(),
        type: "VideoEmbed",
        createdBy: "ai",
        createdAt: timestamp,
        video: {
          provider: "youtube",
          videoId: input.videoId,
          startTimeSeconds: input.startTimeSeconds
        }
      }

      return { success: true, block }
    }

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolCall.name}`
      }
  }
}

/**
 * Process multiple tool calls in sequence
 */
export async function handleToolCalls(toolCalls: ToolCall[]): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = []

  for (const toolCall of toolCalls) {
    const result = await handleToolCall(toolCall)
    results.push(result)
  }

  return results
}
