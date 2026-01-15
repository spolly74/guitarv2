# Diagram Data Models v1

This document defines the **domain-level data models** used to render chord diagrams and fretboard diagrams in the Guitar Practice App.

These models are:
- UI-agnostic
- Deterministic
- AI-generatable
- Stable for persistence

They intentionally **do not** include visual styling, layout, or interaction rules.

---

## 1. Design Principles

1. **Domain-first** – Models describe musical truth, not UI
2. **Renderable** – Every model can be directly rendered to SVG or Canvas
3. **Serializable** – Safe to store, version, and restore
4. **Composable** – Can be wrapped by UI components without mutation

---

## 2. Shared Primitives

### 2.1 NoteName

```ts
export type NoteName =
  | "C" | "C#" | "Db"
  | "D" | "D#" | "Eb"
  | "E"
  | "F" | "F#" | "Gb"
  | "G" | "G#" | "Ab"
  | "A" | "A#" | "Bb"
  | "B";
```

---

### 2.2 Interval

Intervals are expressed relative to the root.

```ts
export type Interval =
  | "R"
  | "b2" | "2"
  | "b3" | "3"
  | "4"  | "#4"
  | "5"  | "b6"
  | "6"
  | "b7" | "7";
```

---

### 2.3 GuitarPosition

```ts
export type GuitarPosition = {
  string: number; // 1 = high E, 6 = low E
  fret: number;   // 0 = open string
};
```

---

## 3. ChordDiagramData

### 3.1 Intent

Represents a **single, concrete chord shape** on the guitar neck.

This model is used for:
- Shell voicings
- Drop voicings
- Triads
- Partial grips

---

### 3.2 Model Definition

```ts
export type ChordDiagramData = {
  id: string;

  root: NoteName;
  quality: string; // e.g. "m7", "7", "maj7", "ø"

  positions: Array<{
    position: GuitarPosition;
    interval: Interval;
    note: NoteName;
  }>;

  baseFret?: number; // Starting fret for higher-position shapes
  mutedStrings?: number[]; // Strings not played

  metadata?: {
    name?: string; // Optional display name
    tuning?: string[]; // Defaults to standard tuning if omitted
  };
};
```

---

### 3.3 Example

```json
{
  "id": "dm7-shell",
  "root": "D",
  "quality": "m7",
  "baseFret": 5,
  "positions": [
    { "position": { "string": 5, "fret": 5 }, "interval": "R",  "note": "D" },
    { "position": { "string": 4, "fret": 5 }, "interval": "b3", "note": "F" },
    { "position": { "string": 3, "fret": 5 }, "interval": "b7", "note": "C" }
  ],
  "mutedStrings": [6]
}
```

---

### 3.4 Notes

- Each entry in `positions` represents one sounding note
- Interval labels are used for hover labeling and instruction
- The same chord quality may have many distinct shapes

---

## 4. FretboardDiagramData

### 4.1 Intent

Represents a **conceptual view of the fretboard**, typically for scales, arpeggios, or chord tones.

This model describes **what notes appear where**, not how they look.

---

### 4.2 Model Definition

```ts
export type FretboardDiagramData = {
  id: string;

  root: NoteName;
  label?: string; // e.g. "C Minor Pentatonic"

  range: {
    fromFret: number;
    toFret: number;
  };

  notes: Array<{
    position: GuitarPosition;
    interval: Interval;
    note: NoteName;
    isRoot?: boolean;
  }>;

  metadata?: {
    tuning?: string[]; // Defaults to standard tuning
    scaleFormula?: Interval[];
  };
};
```

---

### 4.3 Example

```json
{
  "id": "c-minor-pentatonic",
  "root": "C",
  "label": "C Minor Pentatonic",
  "range": { "fromFret": 1, "toFret": 12 },
  "notes": [
    { "position": { "string": 6, "fret": 8 },  "interval": "R",  "note": "C",  "isRoot": true },
    { "position": { "string": 6, "fret": 11 }, "interval": "b3", "note": "Eb" },
    { "position": { "string": 5, "fret": 8 },  "interval": "4",  "note": "F" },
    { "position": { "string": 5, "fret": 10 }, "interval": "5",  "note": "G" }
  ]
}
```

---

## 5. Explicit Non-Goals (v1)

The following are intentionally excluded:

- Visual styling (colors, sizes, shapes)
- Animation rules
- Interaction flags
- Multiple overlays
- Audio playback

These belong in **UI component props**, not the domain model.

---

## 6. Validation & Persistence

### Validation

- All fields are required unless marked optional
- String and fret ranges must be validated
- Intervals must be valid relative to root

### Persistence

- Safe to store as JSON
- Used verbatim when restoring lessons

---

## 7. Versioning Strategy

- This document defines **Diagram Models v1**
- Future versions must remain backward-compatible
- UI components declare supported model versions

---

## 8. Relationship to UI Schema

Diagram data models are **embedded inside UI component props**.

Example:

```json
{
  "type": "ChordDiagram",
  "props": {
    "data": { /* ChordDiagramData */ },
    "animate": true,
    "showIntervals": true
  }
}
```

The AI generates only valid data models and references registered components.

---

## 9. Summary

These models form the **theoretical backbone** of the application.

If they remain stable:
- UI can evolve freely
- Lessons can be restored forever
- AI output remains safe and predictable

This stability is what enables **zero-friction lesson creation**.

