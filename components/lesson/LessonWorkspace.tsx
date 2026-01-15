"use client"

import { useState, useCallback, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable"
import { UIPlanner } from "@/lib/planner"
import type { LessonUIState, LessonBlock } from "@/lib/schemas"
import { BlockRenderer } from "./BlockRenderer"
import { BlockWrapper } from "./BlockWrapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LessonWorkspaceProps {
  lessonId: string
  initialState: LessonUIState
  onStateChange?: (state: LessonUIState) => void
  pendingBlocks?: LessonBlock[]
  onBlocksProcessed?: () => void
}

interface PendingConfirmation {
  type: "delete"
  blockId: string
  message: string
}

export function LessonWorkspace({
  lessonId,
  initialState,
  onStateChange,
  pendingBlocks,
  onBlocksProcessed
}: LessonWorkspaceProps) {
  const [planner] = useState(() => new UIPlanner(initialState))
  const [state, setState] = useState(planner.getState())
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const updateState = useCallback(() => {
    const newState = planner.getState()
    setState(newState)
    onStateChange?.(newState)
  }, [planner, onStateChange])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = state.layout.order.indexOf(active.id as string)
      const newIndex = state.layout.order.indexOf(over.id as string)
      const newOrder = arrayMove(state.layout.order, oldIndex, newIndex)

      if (planner.reorderBlocks(newOrder)) {
        updateState()
      }
    }
  }, [state.layout.order, planner, updateState])

  const handleTogglePin = useCallback((blockId: string) => {
    if (planner.togglePin(blockId)) {
      updateState()
    }
  }, [planner, updateState])

  const handleRequestDelete = useCallback((blockId: string) => {
    setPendingConfirmation({
      type: "delete",
      blockId,
      message: "Are you sure you want to delete this block? This action cannot be undone."
    })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (pendingConfirmation?.type === "delete") {
      if (planner.confirmRemoveBlock(pendingConfirmation.blockId)) {
        updateState()
      }
    }
    setPendingConfirmation(null)
  }, [pendingConfirmation, planner, updateState])

  // Process pending blocks from AI when they arrive
  useEffect(() => {
    if (pendingBlocks && pendingBlocks.length > 0) {
      let added = false
      for (const block of pendingBlocks) {
        if (planner.addBlockDirect(block)) {
          added = true
        }
      }
      if (added) {
        updateState()
      }
      onBlocksProcessed?.()
    }
  }, [pendingBlocks, planner, updateState, onBlocksProcessed])

  const blocks = planner.getBlocksInOrder()

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 xl:p-10 w-full">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground/90">
            Lesson Workspace
          </h1>
          <div className="mt-1 h-px bg-gradient-to-r from-border via-border/50 to-transparent max-w-xs" />
        </header>

        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="font-medium">No content yet</p>
            <p className="text-sm mt-1 text-muted-foreground/70">
              Start chatting with the AI to build your lesson
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={state.layout.order}
              strategy={rectSortingStrategy}
            >
              <div className="flex flex-wrap gap-3 lg:gap-4 xl:gap-5">
                {blocks.map((block) => (
                  <BlockWrapper
                    key={block.id}
                    id={block.id}
                    blockType={block.type}
                    isPinned={planner.isBlockPinned(block.id)}
                    onTogglePin={() => handleTogglePin(block.id)}
                    onRequestDelete={() => handleRequestDelete(block.id)}
                  >
                    <BlockRenderer block={block} />
                  </BlockWrapper>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={pendingConfirmation !== null}
        onOpenChange={(open) => !open && setPendingConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              {pendingConfirmation?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingConfirmation(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
