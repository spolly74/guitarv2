"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pin, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BlockWrapperProps {
  id: string
  blockType: string
  isPinned: boolean
  onTogglePin: () => void
  onRequestDelete?: () => void
  children: React.ReactNode
}

// Block types that should display compactly (side by side)
const compactBlockTypes = new Set(["ChordDiagram"])

export function BlockWrapper({
  id,
  blockType,
  isPinned,
  onTogglePin,
  onRequestDelete,
  children
}: BlockWrapperProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isCompact = compactBlockTypes.has(blockType)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto"
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-card p-4 ${
        isPinned ? "border-primary ring-1 ring-primary/20" : "border-border"
      } ${isDragging ? "shadow-lg" : ""} ${isCompact ? "w-fit" : "w-full"}`}
    >
      {/* Controls - visible on hover */}
      <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-background"
          onClick={onTogglePin}
          title={isPinned ? "Unpin block" : "Pin block"}
        >
          <Pin className={`h-3 w-3 ${isPinned ? "fill-primary text-primary" : ""}`} />
        </Button>

        {onRequestDelete && (
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 bg-background hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteDialog(true)}
            title="Delete block"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-background cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute -top-2 left-3 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
          Pinned
        </div>
      )}

      {children}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this block?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The block will be permanently removed from this lesson.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onRequestDelete?.()
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
