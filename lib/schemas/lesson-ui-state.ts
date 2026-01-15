import { z } from "zod"
import { LessonBlockSchema, type LessonBlock, type BlockId } from "./lesson-blocks"

/**
 * LayoutState - Controls visual ordering and pinned blocks
 */
export const LayoutStateSchema = z.object({
  order: z.array(z.string().uuid()),
  pinned: z.array(z.string().uuid())
})

export type LayoutState = z.infer<typeof LayoutStateSchema>

/**
 * LessonUIState - The complete UI state for a lesson
 * This is persisted as JSON and restored verbatim
 */
export const LessonUIStateSchema = z.object({
  lessonId: z.string().uuid(),
  layout: LayoutStateSchema,
  blocks: z.record(z.string().uuid(), LessonBlockSchema)
})

export type LessonUIState = z.infer<typeof LessonUIStateSchema>

/**
 * Create an empty lesson UI state
 */
export function createEmptyLessonUIState(lessonId: string): LessonUIState {
  return {
    lessonId,
    layout: {
      order: [],
      pinned: []
    },
    blocks: {}
  }
}

/**
 * Get blocks in layout order
 */
export function getBlocksInOrder(state: LessonUIState): LessonBlock[] {
  return state.layout.order
    .map(id => state.blocks[id])
    .filter((block): block is LessonBlock => block !== undefined)
}

/**
 * Check if a block is pinned
 */
export function isBlockPinned(state: LessonUIState, blockId: BlockId): boolean {
  return state.layout.pinned.includes(blockId)
}
