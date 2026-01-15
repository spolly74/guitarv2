# Generated UI Guitar Practice App vNext

## 1. Product Overview

### Goal
Create a **zero‑friction, ad‑hoc lesson generator** for guitar practice where an AI chat drives lesson creation and dynamically populates a central workspace with rich, interactive learning elements.

The experience should feel like sitting down with a personal teacher:
- You ask questions or make requests in chat
- The AI responds conversationally
- At the same time, it **builds a lesson UI in real time**
- You can rearrange, pin, and save the result

This version is **solo‑first**, desktop‑only, and correctness‑focused.

---

## 2. Core UX Layout

### Three‑Pane Desktop Layout

```
┌───────────────┬───────────────────────────────┬───────────────┐
│ Left Pane     │ Center Pane                   │ Right Pane    │
│ (optional)    │ Generated Lesson Workspace    │ AI Chat       │
│ Nav / Lessons │ (Dynamic, Persistent UI)      │ (Collapsible) │
└───────────────┴───────────────────────────────┴───────────────┘
```

### Right Pane – AI Chat
- Persistent per‑lesson chat history
- Streaming responses
- Collapsible
- Chat drives **both text and UI generation**

### Center Pane – Generated Lesson Workspace
- Populated by AI‑requested components
- User can:
  - Reorder elements
  - Pin elements (prevent replacement)
- Layout is saved and restored per lesson

---

## 3. Generated UI Philosophy

### Chosen Approach: **AI‑Aware Component Requests + UI Planner**

**Rationale:**
- Most functional
- Keeps AI expressive without letting it break the UI
- Enables validation, permissions, and user confirmation

### Flow
1. AI responds to user prompt
2. AI *requests* UI changes using a structured schema
3. Backend UI Planner:
   - Validates schema
   - Checks pinned elements
   - Requests confirmation if destructive
4. Frontend renders deterministically

The AI never writes JSX/HTML.

---

## 4. Component Registry (Versioned)

Registry is **explicit, versioned, and extensible**.

### Initial Components (v1)

#### TextBlock
- Rich Markdown rendering
- Scrollable
- Supports inline references to diagrams

#### ChordDiagram
- SVG‑based
- Animated note highlighting
- Hover to show tone labels (R, 3, 5, 7)
- Max visible: 10

#### FretboardDiagram
- SVG‑based
- Position‑based or full 12‑fret view
- Single overlay
- Root notes visually distinct

#### VideoEmbed
- YouTube embed
- Optional timestamp start

---

## 5. UI Schema

### Top‑Level Lesson Schema

```json
{
  "lessonId": "uuid",
  "title": "string",
  "layout": {
    "order": ["block-1", "block-2"],
    "pinned": ["block-1"]
  },
  "blocks": [
    {
      "id": "block-1",
      "type": "TextBlock",
      "props": { }
    }
  ]
}
```

### Design Rules
- AI may only use registered components
- Each block has a stable ID
- Layout order is user‑modifiable
- Pinned blocks cannot be removed or overwritten

---

## 6. AI Chat & Orchestration

### Model Strategy
- Default: Claude
- Fallback: OpenAI
- Model choice is abstracted (not persisted)

### Memory Scope
- Chat context is **per lesson only**

### Streaming
- Chat text streams
- UI blocks may appear incrementally

### Tools Available to AI
- `request_ui_blocks`
- `update_text_block`
- `search_youtube`
- `suggest_video`

AI must ask before removing or overwriting pinned or existing content.

---

## 7. Lesson Persistence

### Saved Data
- Lesson metadata
- UI schema
- Layout state
- Chat history

### Non‑Goals
- No lesson versioning
- No export formats (for now)

---

## 8. Authentication & Users

### Auth
- Google
- GitHub
- Apple

### Rules
- No anonymous users
- Users can only access their own data
- Lessons and chats are private

---

## 9. Frontend Architecture

- Framework: Next.js (App Router)
- State:
  - Server‑persisted lesson state
  - Client UI state for drag/pin
- Rendering:
  - Component registry
  - Recursive renderer

---

## 10. Backend Architecture

- Hosted on Vercel
- API Routes / Server Actions
- Responsibilities:
  - Auth
  - Lesson CRUD
  - Chat orchestration
  - UI validation

---

## 11. Database

Suggested (flexible): Postgres

### Tables

#### users
- id
- auth_provider_id

#### lessons
- id
- user_id
- title
- ui_schema (JSONB)

#### chats
- id
- lesson_id
- messages (JSONB)

---

## 12. Validation & Guardrails

### Validation
- All AI UI output validated against schema
- Invalid output is rejected or repaired

### Destructive Changes
- AI must request permission
- Frontend prompts user

---

## 13. North Star UX Principle

**Zero friction lesson creation.**

The user should never feel like they are "building UI" — only learning.

The system should feel:
- Immediate
- Conversational
- Visual
- Respectful of user intent

---

## 14. Future Extensions (Out of Scope)

- Sharing lessons
- Mobile support
- Payments
- Audio playback
- Collaborative sessions

