"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { LessonBlock } from "@/lib/schemas"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

export interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  pendingBlocks: LessonBlock[]
  sendMessage: (content: string) => Promise<void>
  clearPendingBlocks: () => void
}

export function useChat(lessonId: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingBlocks, setPendingBlocks] = useState<LessonBlock[]>([])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()

    // Add user message
    setMessages(prev => [
      ...prev,
      { id: userMessageId, role: "user", content }
    ])

    // Add empty assistant message for streaming
    setMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "", isStreaming: true }
    ])

    setIsStreaming(true)
    const newBlocks: LessonBlock[] = []

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, message: content })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "))

        for (const line of lines) {
          const data = line.slice(6) // Remove "data: " prefix

          if (data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === "text") {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                )
              )
            } else if (parsed.type === "tool_result") {
              if (parsed.result?.success && parsed.result?.block) {
                newBlocks.push(parsed.result.block)
              } else if (parsed.result?.error) {
                console.error("Tool call failed:", parsed.result.error)
                toast.error(`Diagram creation failed: ${parsed.result.error}`)
              }
            } else if (parsed.type === "tool_start") {
              console.log("Tool started:", parsed.name)
            } else if (parsed.type === "error") {
              console.error("Chat error:", parsed.error)
              toast.error(parsed.error || "An error occurred")
            }
          } catch {
            // Ignore JSON parse errors for partial data
          }
        }
      }

      // Update assistant message to not streaming
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      )

      // Set pending blocks for the workspace to process
      if (newBlocks.length > 0) {
        setPendingBlocks(newBlocks)
      }

    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message. Please try again.")

      // Update message with error state
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, content: "Sorry, something went wrong. Please try again.", isStreaming: false }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }, [lessonId, isStreaming])

  const clearPendingBlocks = useCallback(() => {
    setPendingBlocks([])
  }, [])

  return {
    messages,
    isStreaming,
    pendingBlocks,
    sendMessage,
    clearPendingBlocks
  }
}
