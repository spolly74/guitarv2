import { z } from "zod"
import { LessonBlockSchema } from "./lesson-blocks"

/**
 * AddBlockAction - Request to add a new block to the lesson
 */
export const AddBlockActionSchema = z.object({
  action: z.literal("add_block"),
  block: LessonBlockSchema,
  insertAt: z.number().int().min(0).optional()
})

export type AddBlockAction = z.infer<typeof AddBlockActionSchema>

/**
 * BlockUpdateData - Partial data for updating a block
 * Type is excluded because it's immutable
 */
export const BlockUpdateDataSchema = z.object({
  content: z.string().optional(),
  data: z.any().optional(),
  animate: z.boolean().optional(),
  showIntervals: z.boolean().optional(),
  highlightRoots: z.boolean().optional(),
  video: z.object({
    provider: z.literal("youtube"),
    videoId: z.string().min(1),
    startTimeSeconds: z.number().int().min(0).optional()
  }).optional()
})

export type BlockUpdateData = z.infer<typeof BlockUpdateDataSchema>

/**
 * UpdateBlockAction - Request to update an existing block
 * Note: Block type is immutable and cannot be changed
 */
export const UpdateBlockActionSchema = z.object({
  action: z.literal("update_block"),
  blockId: z.string().uuid(),
  newData: BlockUpdateDataSchema
})

export type UpdateBlockAction = z.infer<typeof UpdateBlockActionSchema>

/**
 * RequestRemoveBlockAction - Request to remove a block
 * Requires user confirmation, especially for pinned blocks
 */
export const RequestRemoveBlockActionSchema = z.object({
  action: z.literal("request_remove_block"),
  blockId: z.string().uuid(),
  reason: z.string()
})

export type RequestRemoveBlockAction = z.infer<typeof RequestRemoveBlockActionSchema>

/**
 * PlannerAction - Union of all planner action types
 */
export const PlannerActionSchema = z.discriminatedUnion("action", [
  AddBlockActionSchema,
  UpdateBlockActionSchema,
  RequestRemoveBlockActionSchema
])

export type PlannerAction = z.infer<typeof PlannerActionSchema>

/**
 * PlannerActionResult - Result of applying a planner action
 */
export type PlannerActionResult = {
  success: boolean
  requiresConfirmation?: boolean
  message?: string
  blockId?: string
}
