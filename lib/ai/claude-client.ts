import Anthropic from "@anthropic-ai/sdk"
import { TOOL_DEFINITIONS } from "./tool-definitions"
import { SYSTEM_PROMPT } from "./system-prompt"
import { handleToolCall, type ToolCall, type ToolCallResult } from "./tool-handlers"

const anthropic = new Anthropic()

/**
 * Chat message format
 */
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

/**
 * Stream event types
 */
export type StreamEvent =
  | { type: "text"; content: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_result"; result: ToolCallResult }
  | { type: "done"; fullResponse: string }
  | { type: "error"; error: string }

/**
 * Stream a chat response from Claude with tool use support
 */
export async function* streamChatResponse(
  messages: ChatMessage[]
): AsyncGenerator<StreamEvent> {
  let fullResponse = ""
  const pendingToolCalls: Map<number, { name: string; input: string }> = new Map()

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    for await (const event of stream) {
      if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          pendingToolCalls.set(event.index, {
            name: event.content_block.name,
            input: ""
          })
          yield { type: "tool_start", name: event.content_block.name }
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          fullResponse += event.delta.text
          yield { type: "text", content: event.delta.text }
        } else if (event.delta.type === "input_json_delta") {
          const pending = pendingToolCalls.get(event.index)
          if (pending) {
            pending.input += event.delta.partial_json
          }
        }
      } else if (event.type === "content_block_stop") {
        const pending = pendingToolCalls.get(event.index)
        if (pending) {
          // Process the completed tool call
          try {
            const input = JSON.parse(pending.input)
            const toolCall: ToolCall = {
              id: `tool-${event.index}`,
              name: pending.name,
              input
            }
            const result = await handleToolCall(toolCall)
            yield { type: "tool_result", result }
          } catch (parseError) {
            yield {
              type: "tool_result",
              result: {
                success: false,
                error: `Failed to parse tool input: ${parseError}`
              }
            }
          }
          pendingToolCalls.delete(event.index)
        }
      }
    }

    yield { type: "done", fullResponse }
  } catch (error) {
    yield {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Non-streaming chat for simpler use cases
 */
export async function chat(messages: ChatMessage[]): Promise<{
  response: string
  toolResults: ToolCallResult[]
}> {
  const toolResults: ToolCallResult[] = []
  let response = ""

  for await (const event of streamChatResponse(messages)) {
    if (event.type === "text") {
      response += event.content
    } else if (event.type === "tool_result") {
      toolResults.push(event.result)
    } else if (event.type === "error") {
      throw new Error(event.error)
    }
  }

  return { response, toolResults }
}
