import { v4 as uuidv4 } from "uuid"
import {
  ChordDiagramDataSchema,
  FretboardDiagramDataSchema,
  type LessonBlock
} from "@/lib/schemas"

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
  error?: string
}

/**
 * Handle a tool call from Claude and return a validated block
 */
export async function handleToolCall(toolCall: ToolCall): Promise<ToolCallResult> {
  const timestamp = new Date().toISOString()

  switch (toolCall.name) {
    case "create_chord_diagram": {
      const parsed = ChordDiagramDataSchema.safeParse(toolCall.input)

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
      const parsed = FretboardDiagramDataSchema.safeParse(toolCall.input)

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
