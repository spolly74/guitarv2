# SVG Rendering Contract v1 – Guitar Diagrams

This document defines the **SVG rendering contract** for guitar diagrams used in the Generated UI Guitar Practice App.

It formalizes:
1. The canonical SVG coordinate systems
2. Deterministic geometry rules for each diagram type
3. How animation integrates **without altering data models**

This contract is UI-internal and **never exposed to the AI**.

---

## 1. Purpose of the SVG Contract

The SVG contract is a **pure rendering agreement** between:
- Diagram data models (ChordDiagramData, FretboardDiagramData)
- Diagram renderer components

Its goals are:
- Pixel-stable rendering
- Backward compatibility for saved lessons
- Easy animation and theming
- Zero musical logic in the renderer

If the data is valid, the output is deterministic.

---

## 2. Global SVG Conventions

These rules apply to all diagram SVGs.

### 2.1 Coordinate System

- SVG origin: top-left (0,0)
- Y increases downward
- All measurements are in **SVG units** (scales automatically)

### 2.2 Styling

- Colors, stroke widths, fonts are applied via CSS variables
- SVG elements use semantic class names (e.g. `.string`, `.note-root`)

### 2.3 Accessibility

- Each note circle includes `data-interval` and `data-note`
- Tooltips are implemented via `<title>` or external UI overlays

---

## 3. ChordDiagramSVG v1

### 3.1 Canonical Dimensions

```ts
SVG_WIDTH  = 240
SVG_HEIGHT = 320
```

### 3.2 Margins & Spacing

```ts
LEFT_MARGIN   = 40
RIGHT_MARGIN  = 20
TOP_MARGIN    = 40
BOTTOM_MARGIN = 20

STRING_SPACING = 32
FRET_SPACING   = 48

VISIBLE_FRETS = 4
STRINGS = 6
```

---

### 3.3 Coordinate Mapping

#### String → X coordinate

```ts
stringX(stringNumber) =
  LEFT_MARGIN + (stringNumber - 1) * STRING_SPACING
```

- String 1 = high E (leftmost)
- String 6 = low E (rightmost)

---

#### Fret → Y coordinate

```ts
fretY(fretIndex) =
  TOP_MARGIN + fretIndex * FRET_SPACING
```

- `fretIndex` is relative to the diagram window
- Open strings (fret 0) are rendered above the nut

---

### 3.4 Structural Elements

- Nut: horizontal line at `fretY(0)` (thicker stroke)
- Frets: horizontal lines at each `fretY(n)`
- Strings: vertical lines at each `stringX(n)`

---

### 3.5 Note Rendering

Each note in `positions`:

```ts
cx = stringX(position.string)
cy = fretY(position.fret - baseFret + 1)
```

Rules:
- Root notes: larger radius
- Non-root notes: standard radius
- Interval label appears on hover

---

### 3.6 Base Fret Label

If `baseFret > 1`:
- Render text label at left margin
- Positioned midway between fret lines

---

## 4. FretboardDiagramSVG v1

### 4.1 Canonical Dimensions

```ts
SVG_WIDTH  = 640
SVG_HEIGHT = 160
```

---

### 4.2 Margins & Spacing

```ts
LEFT_MARGIN   = 40
RIGHT_MARGIN  = 20
TOP_MARGIN    = 20
BOTTOM_MARGIN = 20

STRING_SPACING = 20
FRET_SPACING   = 48
```

---

### 4.3 Coordinate Mapping

#### Fret → X coordinate

```ts
fretX(fret) =
  LEFT_MARGIN + (fret - fromFret) * FRET_SPACING
```

---

#### String → Y coordinate

```ts
stringY(stringNumber) =
  TOP_MARGIN + (6 - stringNumber) * STRING_SPACING
```

- String 6 (low E) appears at top
- String 1 (high E) appears at bottom

---

### 4.4 Structural Elements

- Strings: horizontal lines across full fret range
- Frets: vertical lines at each fret boundary
- Fret numbers rendered above fret lines

---

### 4.5 Note Rendering

Each note in `notes`:

```ts
cx = fretX(position.fret)
cy = stringY(position.string)
```

Rules:
- Root notes use distinct shape or radius
- All notes are rendered within fret bounds

---

## 5. Animation Integration (Non-Invasive)

Animation is layered **on top of the SVG contract**, never altering geometry.

### 5.1 Animation Principles

- Geometry is static
- Animation uses transforms, opacity, or stroke changes
- Animations are optional and declarative

---

### 5.2 Chord Diagram Animations

Examples:

- Fade-in notes on mount
- Pulse root note
- Sequential highlight for practice patterns

```css
.note {
  transition: transform 150ms ease, opacity 150ms ease;
}

.note--active {
  transform: scale(1.2);
}
```

---

### 5.3 Fretboard Diagram Animations

Examples:
- Step-through scale notes
- Highlight current position

Animation operates by toggling CSS classes:

```ts
activeNoteIds: string[]
```

Renderer applies:

```html
<circle class="note note--active" />
```

---

### 5.4 Why This Is Safe

- No reflow or coordinate recalculation
- Saved lessons render identically
- Animations can be added or removed freely

---

## 6. Explicit Non-Goals

This contract intentionally excludes:

- Musical correctness
- Interval calculation
- Enharmonic decisions
- UI layout positioning
- AI behavior

---

## 7. Versioning Strategy

- This document defines **SVG Contract v1**
- Geometry changes require a new version
- Renderer declares supported contract versions

---

## 8. Summary

The SVG contract is the **final deterministic layer** between musical data and pixels.

If upheld:
- Diagrams never drift
- Animations remain optional
- Lessons render forever

This is the foundation that makes generated UI trustworthy.

