# Diagram Helper Generators v1 – Music Theory Utilities

This document defines **helper generators** used to reduce AI cognitive load and improve consistency.

Helpers convert high-level musical intent into concrete diagram data.

---

## 1. Purpose

Helper generators:
- Encapsulate music theory logic
- Produce valid Diagram Data Models
- Are deterministic and testable

The AI may request these helpers instead of constructing diagrams manually.

---

## 2. Generator: Scale → FretboardDiagramData

### Input

```ts
{
  root: NoteName;
  scale: "major" | "minor_pentatonic" | "major_pentatonic" | "blues";
  range: { fromFret: number; toFret: number };
}
```

### Output

- FretboardDiagramData
- Root notes flagged with `isRoot: true`

---

## 3. Generator: Chord Quality → Shell Voicings

### Input

```ts
{
  root: NoteName;
  quality: "m7" | "7" | "maj7";
  stringSet: "low" | "middle" | "high";
}
```

### Output

- One or more ChordDiagramData objects

---

## 4. Generator Rules

- Always return valid domain models
- Never include UI or layout data
- Prefer common, playable shapes

---

## 5. Summary

Helper generators ensure musical correctness and reduce AI error rates.

