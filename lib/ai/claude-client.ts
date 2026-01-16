/**
 * Claude AI Client
 *
 * Provides streaming chat functionality with Claude, including full support for
 * tool use with an agentic loop pattern. The client handles the complete
 * conversation flow including multiple rounds of tool calls.
 *
 * @module lib/ai/claude-client
 *
 * @example
 * ```ts
 * import { streamChatResponse } from "@/lib/ai/claude-client"
 *
 * const messages = [{ role: "user", content: "Show me a C major chord" }]
 *
 * for await (const event of streamChatResponse(messages)) {
 *   if (event.type === "text") console.log(event.content)
 *   if (event.type === "tool_result") handleBlock(event.result.block)
 * }
 * ```
 */

import Anthropic from "@anthropic-ai/sdk"
import type { MessageParam, ContentBlockParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages"
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
 * Implements proper agentic loop: sends tool results back to Claude until completion
 */
export async function* streamChatResponse(
  messages: ChatMessage[]
): AsyncGenerator<StreamEvent> {
  let fullResponse = ""

  // Convert chat messages to API format
  const apiMessages: MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  try {
    // Agentic loop - keep going until Claude stops using tools
    let continueLoop = true

    while (continueLoop) {
      const pendingToolCalls: Map<number, { id: string; name: string; input: string }> = new Map()
      const completedToolResults: { toolUseId: string; result: ToolCallResult }[] = []
      let assistantContent: ContentBlockParam[] = []
      let stopReason: string | null = null

      console.log("[Claude Request] Messages:", apiMessages.length)

      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS,
        tool_choice: { type: "auto" },
        messages: apiMessages,
      })

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "tool_use") {
            console.log("[Tool Use Started]", event.content_block.name, "id:", event.content_block.id)
            pendingToolCalls.set(event.index, {
              id: event.content_block.id,
              name: event.content_block.name,
              input: ""
            })
            yield { type: "tool_start", name: event.content_block.name }
          } else if (event.content_block.type === "text") {
            // Text block starting
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
            console.log("[Tool Call Complete]", pending.name, "Input:", pending.input.substring(0, 200))

            // Parse and execute the tool
            try {
              const input = JSON.parse(pending.input)
              const toolCall: ToolCall = {
                id: pending.id,
                name: pending.name,
                input
              }
              const result = await handleToolCall(toolCall)
              console.log("[Tool Result]", result.success, result.error || "")
              yield { type: "tool_result", result }

              // Store for sending back to Claude
              completedToolResults.push({ toolUseId: pending.id, result })

              // Add tool_use block to assistant content
              assistantContent.push({
                type: "tool_use",
                id: pending.id,
                name: pending.name,
                input
              })
            } catch (parseError) {
              console.error("[Tool Parse Error]", parseError)
              yield {
                type: "tool_result",
                result: {
                  success: false,
                  error: `Failed to parse tool input: ${parseError}`
                }
              }
              // Still need to send error result back to Claude
              completedToolResults.push({
                toolUseId: pending.id,
                result: { success: false, error: `Parse error: ${parseError}` }
              })
              assistantContent.push({
                type: "tool_use",
                id: pending.id,
                name: pending.name,
                input: {}
              })
            }
            pendingToolCalls.delete(event.index)
          }
        } else if (event.type === "message_delta") {
          stopReason = event.delta.stop_reason
          console.log("[Message Delta] stop_reason:", stopReason)
        } else if (event.type === "message_stop") {
          console.log("[Message Complete] Tool calls executed:", completedToolResults.length)
        }
      }

      // Check if we need to continue the loop
      if (completedToolResults.length > 0) {
        console.log("[Agentic Loop] Sending", completedToolResults.length, "tool results back to Claude")

        // Get the full final message to extract text content
        const finalMessage = await stream.finalMessage()

        // Build the assistant message with all content blocks
        const assistantMessageContent: ContentBlockParam[] = []
        for (const block of finalMessage.content) {
          if (block.type === "text" && block.text) {
            assistantMessageContent.push({ type: "text", text: block.text })
          } else if (block.type === "tool_use") {
            assistantMessageContent.push({
              type: "tool_use",
              id: block.id,
              name: block.name,
              input: block.input
            })
          }
        }

        // Add assistant message with tool uses
        apiMessages.push({
          role: "assistant",
          content: assistantMessageContent
        })

        // Add user message with tool results
        const toolResultBlocks: ToolResultBlockParam[] = completedToolResults.map(({ toolUseId, result }) => ({
          type: "tool_result" as const,
          tool_use_id: toolUseId,
          content: result.success
            ? JSON.stringify({ success: true, blockId: result.block?.id })
            : JSON.stringify({ success: false, error: result.error })
        }))

        apiMessages.push({
          role: "user",
          content: toolResultBlocks
        })

        // Continue loop to let Claude respond to tool results
        continueLoop = true
      } else {
        // No tool calls, we're done
        continueLoop = false
      }
    }

    yield { type: "done", fullResponse }
  } catch (error) {
    console.error("[Claude Error]", error)
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
