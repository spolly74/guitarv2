import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamChatResponse, type ChatMessage } from "@/lib/ai"
import type { Json } from "@/lib/supabase/types"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { lessonId, message } = await request.json()

  if (!lessonId || !message) {
    return new Response("Missing lessonId or message", { status: 400 })
  }

  // Verify lesson ownership
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("user_id", user.id)
    .single()

  if (!lesson) {
    return new Response("Lesson not found", { status: 404 })
  }

  // Get existing chat history
  const { data: chat } = await supabase
    .from("chats")
    .select("messages")
    .eq("lesson_id", lessonId)
    .single()

  const rawMessages = Array.isArray(chat?.messages) ? chat.messages : []
  const existingMessages: ChatMessage[] = rawMessages.map((m: unknown) => {
    const msg = m as { role: string; content: string }
    return {
      role: msg.role as "user" | "assistant",
      content: msg.content
    }
  })

  // Add new user message
  const messages: ChatMessage[] = [
    ...existingMessages,
    { role: "user" as const, content: message }
  ]

  // Create streaming response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ""
      const toolResults: Array<{ success: boolean; blockId?: string; error?: string }> = []

      try {
        for await (const event of streamChatResponse(messages)) {
          if (event.type === "text") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text", content: event.content })}\n\n`)
            )
            fullResponse += event.content
          } else if (event.type === "tool_start") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "tool_start", name: event.name })}\n\n`)
            )
          } else if (event.type === "tool_result") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "tool_result", result: event.result })}\n\n`)
            )
            toolResults.push({
              success: event.result.success,
              blockId: event.result.block?.id,
              error: event.result.error
            })
          } else if (event.type === "error") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", error: event.error })}\n\n`)
            )
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))

        // Save updated chat history (cast to unknown to bypass strict typing)
        const newMessages = [
          ...existingMessages.map(m => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
            createdAt: new Date().toISOString()
          })),
          {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            createdAt: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullResponse,
            createdAt: new Date().toISOString(),
            toolCalls: toolResults
          }
        ]

        await supabase
          .from("chats")
          .upsert({
            lesson_id: lessonId,
            messages: newMessages as Json
          })

      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error"
          })}\n\n`)
        )
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  })
}
