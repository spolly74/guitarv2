"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThreePaneLayoutProps {
  leftPane: React.ReactNode
  centerPane: React.ReactNode
  rightPane: React.ReactNode
}

export function ThreePaneLayout({
  leftPane,
  centerPane,
  rightPane
}: ThreePaneLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Pane - Navigation */}
      <aside
        className={`relative border-r border-border flex-shrink-0 transition-all duration-300 ${
          leftCollapsed ? "w-0" : "w-64"
        }`}
      >
        {!leftCollapsed && (
          <div className="h-full overflow-y-auto">
            {leftPane}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border bg-background shadow-sm"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
        >
          {leftCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Center Pane - Lesson Workspace */}
      <main className="flex-1 overflow-y-auto">
        {centerPane}
      </main>

      {/* Right Pane - Chat */}
      <aside
        className={`relative border-l border-border flex-shrink-0 transition-all duration-300 ${
          rightCollapsed ? "w-0" : "w-96"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-4 z-10 h-8 w-8 rounded-full border bg-background shadow-sm"
          onClick={() => setRightCollapsed(!rightCollapsed)}
        >
          {rightCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        {!rightCollapsed && (
          <div className="h-full overflow-hidden">
            {rightPane}
          </div>
        )}
      </aside>
    </div>
  )
}
