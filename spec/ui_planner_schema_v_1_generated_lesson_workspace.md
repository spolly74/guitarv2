# UI Planner Schema v1 – Generated Lesson Workspace

This document defines the **UI Planner schema** used to translate AI intent and tool output into a deterministic, user‑controllable lesson layout.

The UI Planner is the **gatekeeper** between:
- AI chat + tool calls
- Persisted lesson state
- Frontend rendering

It ensures safety, stability, and zero‑friction lesson creation.

---

## 1. Purpose & Responsibilities

The UI Planner is responsible for:

1. Creating UI blocks from validated tool output
2. Updating existing blocks safely
3. Preserving user layout decisions
4. Enforcing pinning and confirmation rules
5. Producing a **single canonical lesson UI state**

The AI **does not** manipulate UI state directly.

---

## 2. High‑Level Concept

The planner operates on a **Lesson UI State** object.

```
AI Intent + Tool Output
        ↓
    UI Planner
        ↓
  Lesson UI State (JSON)
        ↓
   Deterministic Renderer
```

The lesson UI state is persisted and restored verbatim.

---

## 3. Core Types

### 3.1 BlockType

```ts
export type BlockType =
  | "TextBlock"
  | "ChordDiagram"
  | "FretboardDiagram"
  | "VideoEmbed";
```

---

### 3.2 BlockId

```ts
export type BlockId = string; // UUID or stable identifier
```

---

## 4. Lesson UI State Schema

### 4.1 LessonUIState

```ts
export type LessonUIState = {
  lessonId: string;

  layout: {
    order: BlockId[];
    pinned: BlockId[];
  };

  blocks: Record<BlockId, LessonBlock>;
};
```

---

### 4.2 LessonBlock (Discriminated Union)

```ts
export type LessonBlock =
  | TextBlock
  | ChordDiagramBlock
  | FretboardDiagramBlock
  | VideoEmbedBlock;
```

Each block has a stable ID and immutable type.

---

## 5. Block Definitions

### 5.1 BaseBlock

```ts
export type BaseBlock = {
  id: BlockId;
  type: BlockType;
  createdBy: "ai" | "user";
  createdAt: string; // ISO timestamp
};
```

---

### 5.2 TextBlock

```ts
export type TextBlock = BaseBlock & {
  type: "TextBlock";
  content: string; // Markdown
};
```

Notes:
- Scrollable by default
- Rich Markdown allowed

---

### 5.3 ChordDiagramBlock

```ts
export type ChordDiagramBlock = BaseBlock & {
  type: "ChordDiagram";
  data: ChordDiagramData; // See Diagram Data Models v1
};
```

---

### 5.4 FretboardDiagramBlock

```ts
export type FretboardDiagramBlock = BaseBlock & {
  type: "FretboardDiagram";
  data: FretboardDiagramData; // See Diagram Data Models v1
};
```

---

### 5.5 VideoEmbedBlock

```ts
export type VideoEmbedBlock = BaseBlock & {
  type: "VideoEmbed";
  video: {
    provider: "youtube";
    videoId: string;
    startTimeSeconds?: number;
  };
};
```

---

## 6. Planner Actions

The AI never edits UI state directly.

Instead, it requests **planner actions**.

### 6.1 PlannerAction

```ts
export type PlannerAction =
  | AddBlockAction
  | UpdateBlockAction
  | RequestRemoveBlockAction;
```

---

### 6.2 AddBlockAction

```ts
export type AddBlockAction = {
  action: "add_block";
  block: LessonBlock;
  insertAt?: number; // Defaults to end
};
```

Rules:
- New blocks are appended unless specified
- Block ID must be unique

---

### 6.3 UpdateBlockAction

```ts
export type UpdateBlockAction = {
  action: "update_block";
  blockId: BlockId;
  newData: Partial<LessonBlock>;
};
```

Rules:
- Block type is immutable
- Pinned blocks require user confirmation

---

### 6.4 RequestRemoveBlockAction

```ts
export type RequestRemoveBlockAction = {
  action: "request_remove_block";
  blockId: BlockId;
  reason: string;
};
```

Rules:
- Planner must surface confirmation UI
- Removal only occurs after explicit approval

---

## 7. Pinning Rules

- Pinned blocks:
  - Cannot be removed automatically
  - Cannot be overwritten silently

- If AI intent conflicts with pinned content:
  - Planner must request user approval

---

## 8. Layout Rules

- `layout.order` controls visual ordering
- Users may reorder freely
- Planner preserves order unless explicitly instructed

The AI should **not** micromanage layout.

---

## 9. Validation & Safety

Planner must enforce:

- Valid block type
- Valid diagram data (via Zod schemas)
- Unique block IDs
- Non‑destructive defaults

Invalid planner actions are rejected.

---

## 10. Persistence Strategy

The **entire LessonUIState** is persisted as JSON.

On reload:
- Layout is restored exactly
- Blocks are re-rendered deterministically

This enables true lesson restoration.

---

## 11. Relationship to Other Specs

- **Diagram Data Models v1** – diagram payloads
- **Zod Schema Specification** – validation
- **Claude Tool Schemas v1** – diagram creation

The UI Planner is the orchestration layer tying them together.

---

## 12. Design Principles (Summary)

- AI suggests, planner decides
- User intent always wins
- UI state is stable and explicit
- Layout is first‑class data

This schema is essential to achieving **zero‑friction lesson creation** without loss of control.

