# UI Component Prop Schemas v1 – Renderer Contract

This document defines the **UI component prop schemas** that wrap domain data for rendering.

These schemas are consumed by the frontend renderer and never generated directly by the AI.

---

## 1. Design Principles

- Wrap domain data, do not mutate it
- Keep UI concerns out of domain models
- Be backward compatible

---

## 2. TextBlock Props

```ts
export type TextBlockProps = {
  content: string; // Markdown
};
```

---

## 3. ChordDiagram Props

```ts
export type ChordDiagramProps = {
  data: ChordDiagramData;
  animate?: boolean;
  showIntervals?: boolean;
};
```

---

## 4. FretboardDiagram Props

```ts
export type FretboardDiagramProps = {
  data: FretboardDiagramData;
  highlightRoots?: boolean;
};
```

---

## 5. VideoEmbed Props

```ts
export type VideoEmbedProps = {
  provider: "youtube";
  videoId: string;
  startTimeSeconds?: number;
};
```

---

## 6. Renderer Rules

- Components must be pure and deterministic
- No side effects during render
- Props are trusted only after validation

---

## 7. Summary

These schemas define the final contract between validated data and UI rendering.
They allow UI evolution without breaking saved lessons.

