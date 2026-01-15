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
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Lesson Workspace</h1>

        {blocks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No content yet.</p>
            <p className="text-sm mt-2">
              Start chatting with the AI to build your lesson.
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
              <div className="flex flex-wrap gap-4">
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
