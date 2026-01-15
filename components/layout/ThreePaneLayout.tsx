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
        className={`relative bg-muted/30 flex-shrink-0 transition-all duration-300 ease-out ${
          leftCollapsed ? "w-0" : "w-56 xl:w-64 2xl:w-72"
        }`}
      >
        {!leftCollapsed && (
          <div className="h-full overflow-y-auto border-r border-border/50">
            {leftPane}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border/50 bg-background shadow-sm hover:bg-accent transition-colors"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
        >
          {leftCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>

      {/* Center Pane - Lesson Workspace */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        {centerPane}
      </main>

      {/* Right Pane - Chat */}
      <aside
        className={`relative bg-muted/30 flex-shrink-0 transition-all duration-300 ease-out ${
          rightCollapsed ? "w-0" : "w-80 xl:w-96 2xl:w-[420px]"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-3 top-6 z-10 h-6 w-6 rounded-full border border-border/50 bg-background shadow-sm hover:bg-accent transition-colors"
          onClick={() => setRightCollapsed(!rightCollapsed)}
        >
          {rightCollapsed ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        {!rightCollapsed && (
          <div className="h-full overflow-hidden border-l border-border/50">
            {rightPane}
          </div>
        )}
      </aside>
    </div>
  )
}
