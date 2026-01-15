import type {
  LessonUIState,
  LessonBlock,
  PlannerAction,
  PlannerActionResult
} from "@/lib/schemas"

/**
 * UIPlanner - Central orchestration for lesson UI state
 *
 * Responsibilities:
 * 1. Creating UI blocks from validated tool output
 * 2. Updating existing blocks safely
 * 3. Preserving user layout decisions
 * 4. Enforcing pinning and confirmation rules
 * 5. Producing a single canonical lesson UI state
 *
 * The AI does NOT manipulate UI state directly.
 */
export class UIPlanner {
  private state: LessonUIState

  constructor(initialState: LessonUIState) {
    this.state = structuredClone(initialState)
  }

  /**
   * Get a copy of the current state
   */
  getState(): LessonUIState {
    return structuredClone(this.state)
  }

  /**
   * Get blocks in layout order
   */
  getBlocksInOrder(): LessonBlock[] {
    return this.state.layout.order
      .map(id => this.state.blocks[id])
      .filter((block): block is LessonBlock => block !== undefined)
  }

  /**
   * Check if a block is pinned
   */
  isBlockPinned(blockId: string): boolean {
    return this.state.layout.pinned.includes(blockId)
  }

  /**
   * Apply a planner action
   */
  applyAction(action: PlannerAction): PlannerActionResult {
    switch (action.action) {
      case "add_block":
        return this.addBlock(action.block, action.insertAt)

      case "update_block":
        return this.updateBlock(action.blockId, action.newData)

      case "request_remove_block":
        return this.requestRemoveBlock(action.blockId, action.reason)

      default:
        return { success: false, message: "Unknown action" }
    }
  }

  /**
   * Add a new block to the lesson
   */
  private addBlock(
    block: LessonBlock,
    insertAt?: number
  ): PlannerActionResult {
    // Validate block ID uniqueness
    if (this.state.blocks[block.id]) {
      return {
        success: false,
        message: `Block ID "${block.id}" already exists`
      }
    }

    // Add block to registry
    this.state.blocks[block.id] = block

    // Update layout order
    if (insertAt !== undefined && insertAt >= 0 && insertAt <= this.state.layout.order.length) {
      this.state.layout.order.splice(insertAt, 0, block.id)
    } else {
      this.state.layout.order.push(block.id)
    }

    return {
      success: true,
      blockId: block.id,
      message: `Added ${block.type} block`
    }
  }

  /**
   * Update an existing block
   */
  private updateBlock(
    blockId: string,
    newData: Partial<LessonBlock>
  ): PlannerActionResult {
    const existingBlock = this.state.blocks[blockId]

    if (!existingBlock) {
      return {
        success: false,
        message: `Block "${blockId}" not found`
      }
    }

    // Check if block is pinned - requires confirmation
    if (this.state.layout.pinned.includes(blockId)) {
      return {
        success: false,
        requiresConfirmation: true,
        blockId,
        message: "This block is pinned. User confirmation required to update."
      }
    }

    // Merge updates while preserving immutable fields (id, type, createdBy, createdAt)
    this.state.blocks[blockId] = {
      ...existingBlock,
      ...newData,
      id: existingBlock.id,
      type: existingBlock.type,
      createdBy: existingBlock.createdBy,
      createdAt: existingBlock.createdAt
    } as LessonBlock

    return {
      success: true,
      blockId,
      message: "Block updated"
    }
  }

  /**
   * Request to remove a block (requires confirmation)
   */
  private requestRemoveBlock(
    blockId: string,
    reason: string
  ): PlannerActionResult {
    if (!this.state.blocks[blockId]) {
      return {
        success: false,
        message: `Block "${blockId}" not found`
      }
    }

    // Always require confirmation for removals
    return {
      success: false,
      requiresConfirmation: true,
      blockId,
      message: `AI wants to remove this block: ${reason}`
    }
  }

  /**
   * Confirm and execute block removal (after user approval)
   */
  confirmRemoveBlock(blockId: string): boolean {
    if (!this.state.blocks[blockId]) {
      return false
    }

    // Remove from blocks registry
    delete this.state.blocks[blockId]

    // Remove from layout order
    this.state.layout.order = this.state.layout.order.filter(id => id !== blockId)

    // Remove from pinned list
    this.state.layout.pinned = this.state.layout.pinned.filter(id => id !== blockId)

    return true
  }

  /**
   * Confirm and execute block update (after user approval for pinned blocks)
   */
  confirmUpdateBlock(blockId: string, newData: Partial<LessonBlock>): boolean {
    const existingBlock = this.state.blocks[blockId]

    if (!existingBlock) {
      return false
    }

    this.state.blocks[blockId] = {
      ...existingBlock,
      ...newData,
      id: existingBlock.id,
      type: existingBlock.type,
      createdBy: existingBlock.createdBy,
      createdAt: existingBlock.createdAt
    } as LessonBlock

    return true
  }

  /**
   * Reorder blocks (user action)
   */
  reorderBlocks(newOrder: string[]): boolean {
    // Validate all IDs exist
    const allExist = newOrder.every(id => this.state.blocks[id])

    if (!allExist) {
      return false
    }

    // Validate no duplicates
    if (new Set(newOrder).size !== newOrder.length) {
      return false
    }

    this.state.layout.order = newOrder
    return true
  }

  /**
   * Toggle pin status (user action)
   */
  togglePin(blockId: string): boolean {
    if (!this.state.blocks[blockId]) {
      return false
    }

    const pinnedIndex = this.state.layout.pinned.indexOf(blockId)

    if (pinnedIndex >= 0) {
      // Unpin
      this.state.layout.pinned.splice(pinnedIndex, 1)
    } else {
      // Pin
      this.state.layout.pinned.push(blockId)
    }

    return true
  }

  /**
   * Add a block directly (bypasses action validation, for internal use)
   */
  addBlockDirect(block: LessonBlock): boolean {
    if (this.state.blocks[block.id]) {
      return false
    }

    this.state.blocks[block.id] = block
    this.state.layout.order.push(block.id)
    return true
  }
}
