"use client"

import { useEffect, useRef } from "react"
import { useChat, type Message } from "@/hooks/useChat"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import type { LessonBlock } from "@/lib/schemas"

interface ChatContainerProps {
  lessonId: string
  onBlocksGenerated?: (blocks: LessonBlock[]) => void
}

export function ChatContainer({ lessonId, onBlocksGenerated }: ChatContainerProps) {
  const { messages, isStreaming, pendingBlocks, sendMessage, clearPendingBlocks } = useChat(lessonId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Notify parent of new blocks
  useEffect(() => {
    if (pendingBlocks.length > 0 && onBlocksGenerated) {
      onBlocksGenerated(pendingBlocks)
      clearPendingBlocks()
    }
  }, [pendingBlocks, onBlocksGenerated, clearPendingBlocks])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">AI Chat</h2>
        <p className="text-xs text-muted-foreground">
          Ask questions or request lesson content
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">Start a conversation!</p>
            <p className="text-xs mt-2">
              Try: &quot;Show me a Dm7 chord voicing&quot; or &quot;Teach me the minor pentatonic scale&quot;
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={message.isStreaming}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder={isStreaming ? "AI is responding..." : "Ask about guitar..."}
        />
      </div>
    </div>
  )
}
