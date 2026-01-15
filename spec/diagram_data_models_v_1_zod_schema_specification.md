# Diagram Data Models v1 – Zod Schema Specification

This document defines the **authoritative Zod schemas** for the Diagram Data Models used by the Guitar Practice App.

These schemas are the **validation contract** between:
- AI model output (Claude / OpenAI)
- Backend orchestration and persistence
- Frontend diagram renderers

They enforce correctness, safety, and long-term stability.

---

## 1. Purpose & Scope

The schemas in this document:
- Validate **ChordDiagramData** and **FretboardDiagramData**
- Are used server-side to validate AI-generated content
- Ensure only renderable, domain-correct data reaches the UI

Out of scope:
- Visual styling
- Layout
- Animation behavior
- UI interaction rules

---

## 2. Shared Primitives

### 2.1 NoteName

Represents a pitch class using common enharmonic spellings.

```ts
export const NoteNameSchema = z.enum([
  "C", "C#", "Db",
  "D", "D#", "Eb",
  "E",
  "F", "F#", "Gb",
  "G", "G#", "Ab",
  "A", "A#", "Bb",
  "B"
]);

export type NoteName = z.infer<typeof NoteNameSchema>;
```

---

### 2.2 Interval

Intervals are expressed **relative to the root**.

```ts
export const IntervalSchema = z.enum([
  "R",
  "b2", "2",
  "b3", "3",
  "4", "#4",
  "5", "b6",
  "6",
  "b7", "7"
]);

export type Interval = z.infer<typeof IntervalSchema>;
```

---

### 2.3 GuitarPosition

Represents a single location on the guitar neck.

```ts
export const GuitarPositionSchema = z.object({
  string: z.number().int().min(1).max(6),
  fret: z.number().int().min(0).max(24)
});

export type GuitarPosition = z.infer<typeof GuitarPositionSchema>;
```

---

## 3. ChordDiagramData Schema

### 3.1 Intent

Represents a **single concrete chord shape** (voicing) on the guitar.

Used for:
- Shell voicings
- Drop voicings
- Triads
- Partial grips

---

### 3.2 Schema Definition

```ts
export const ChordDiagramPositionSchema = z.object({
  position: GuitarPositionSchema,
  interval: IntervalSchema,
  note: NoteNameSchema
});

export const ChordDiagramDataSchema = z.object({
  id: z.string().min(1),

  root: NoteNameSchema,
  quality: z.string().min(1),

  positions: z.array(ChordDiagramPositionSchema)
    .min(1, "Chord diagram must contain at least one note")
    .max(10, "Chord diagram exceeds maximum note count"),

  baseFret: z.number().int().min(1).max(24).optional(),

  mutedStrings: z.array(
    z.number().int().min(1).max(6)
  ).optional(),

  metadata: z.object({
    name: z.string().optional(),
    tuning: z.array(z.string()).length(6).optional()
  }).optional()
});

export type ChordDiagramData = z.infer<typeof ChordDiagramDataSchema>;
```

---

### 3.3 Validation Rules

- At least one sounding note is required
- No more than 10 notes per chord shape
- Strings must be in range 1–6
- Frets must be in range 0–24

Enharmonic correctness and interval-note consistency are **not enforced** at the schema level.

---

## 4. FretboardDiagramData Schema

### 4.1 Intent

Represents a **conceptual fretboard view**, typically for:
- Scales
- Arpeggios
- Chord tones

This model describes *what appears where*, not how it is styled.

---

### 4.2 Schema Definition

```ts
export const FretboardNoteSchema = z.object({
  position: GuitarPositionSchema,
  interval: IntervalSchema,
  note: NoteNameSchema,
  isRoot: z.boolean().optional()
});

export const FretboardRangeSchema = z.object({
  fromFret: z.number().int().min(0).max(24),
  toFret: z.number().int().min(0).max(24)
}).refine(
  r => r.toFret >= r.fromFret,
  { message: "toFret must be >= fromFret" }
);

export const FretboardDiagramDataSchema = z.object({
  id: z.string().min(1),

  root: NoteNameSchema,
  label: z.string().optional(),

  range: FretboardRangeSchema,

  notes: z.array(FretboardNoteSchema)
    .min(1, "Fretboard diagram must contain at least one note"),

  metadata: z.object({
    tuning: z.array(z.string()).length(6).optional(),
    scaleFormula: z.array(IntervalSchema).optional()
  }).optional()
});

export type FretboardDiagramData = z.infer<typeof FretboardDiagramDataSchema>;
```

---

## 5. Usage Guidelines

### Server-Side Validation

All AI-generated diagram data **must** be validated using these schemas before:
- Persistence
- Rendering
- UI schema embedding

```ts
const parsed = ChordDiagramDataSchema.safeParse(aiOutput);

if (!parsed.success) {
  // Reject, repair, or re-prompt the model
}
```

---

## 6. Design Notes & Intentional Omissions

The following are intentionally excluded from these schemas:

- Visual styling (colors, shapes, sizes)
- Animation rules
- UI layout information
- Interaction behavior

These concerns belong to **UI component props**, not domain validation.

---

## 7. Versioning Strategy

- This document defines **Diagram Data Models v1 (Zod)**
- Future versions must be backward-compatible
- UI components must declare which model versions they support

---

## 8. Relationship to Other Specs

- **Diagram Data Models v1** – domain concepts and examples
- **Generated UI vNext Spec** – component registry and layout

This document is the **source of truth for validation**.

---

## 9. Summary

These Zod schemas form a critical safety boundary in the system.

If enforced consistently:
- AI output becomes predictable
- Rendering becomes deterministic
- Lessons remain restorable indefinitely

This is a foundational requirement for **zero-friction lesson creation**.
