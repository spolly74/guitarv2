# Claude Tool Schemas v1 – Diagram Generation

This document defines the **Claude tool schemas** used to safely generate guitar diagrams for the Guitar Practice App.

These tools form the **only allowed mechanism** by which the AI may request the creation of chord diagrams and fretboard diagrams.

They are explicitly aligned with:
- **Diagram Data Models v1**
- **Diagram Data Models v1 – Zod Schema Specification**

The backend must validate all tool outputs using the corresponding Zod schemas before rendering or persistence.

---

## 1. Design Goals

1. **Safety** – Claude cannot emit arbitrary UI or diagram structures
2. **Determinism** – Every tool call maps directly to a validated data model
3. **Composability** – Tools can be combined in a single lesson
4. **Low Cognitive Load** – Claude focuses on musical intent, not rendering

Claude must never generate diagram data outside these tools.

---

## 2. General Tool Rules (Claude Instruction)

These rules should be included verbatim in the Claude system prompt:

> - You may only create chord or fretboard diagrams by calling the provided tools.
> - You must not invent new fields, omit required fields, or change schema shapes.
> - If you are unsure of a value, ask the user for clarification.
> - Do not overwrite or remove existing diagrams unless explicitly permitted.
> - All outputs must be valid JSON matching the tool schema.

---

## 3. Tool: `create_chord_diagram`

### Purpose

Creates a **single concrete chord shape** suitable for display as a chord diagram.

Used for:
- Shell voicings
- Drop voicings
- Triads
- Partial grips

---

### Input Schema

```json
{
  "name": "create_chord_diagram",
  "description": "Create a single concrete guitar chord diagram (one voicing).",
  "input_schema": {
    "type": "object",
    "required": ["id", "root", "quality", "positions"],
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for this chord diagram"
      },
      "root": {
        "type": "string",
        "enum": ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"]
      },
      "quality": {
        "type": "string",
        "description": "Chord quality (e.g. m7, 7, maj7, ø)"
      },
      "positions": {
        "type": "array",
        "minItems": 1,
        "maxItems": 10,
        "items": {
          "type": "object",
          "required": ["position", "interval", "note"],
          "properties": {
            "position": {
              "type": "object",
              "required": ["string", "fret"],
              "properties": {
                "string": { "type": "integer", "minimum": 1, "maximum": 6 },
                "fret": { "type": "integer", "minimum": 0, "maximum": 24 }
              }
            },
            "interval": {
              "type": "string",
              "enum": ["R","b2","2","b3","3","4","#4","5","b6","6","b7","7"]
            },
            "note": {
              "type": "string",
              "enum": ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"]
            }
          }
        }
      },
      "baseFret": {
        "type": "integer",
        "minimum": 1,
        "maximum": 24
      },
      "mutedStrings": {
        "type": "array",
        "items": { "type": "integer", "minimum": 1, "maximum": 6 }
      },
      "metadata": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "tuning": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 6,
            "maxItems": 6
          }
        }
      }
    }
  }
}
```

---

### Usage Notes

- Each call creates **exactly one** chord shape
- Multiple chord diagrams require multiple tool calls
- Hover labeling is driven by `interval`

---

## 4. Tool: `create_fretboard_diagram`

### Purpose

Creates a **conceptual fretboard view**, typically for scales or note collections.

Used for:
- Scales
- Arpeggios
- Chord tones

---

### Input Schema

```json
{
  "name": "create_fretboard_diagram",
  "description": "Create a fretboard diagram showing note positions over a range.",
  "input_schema": {
    "type": "object",
    "required": ["id", "root", "range", "notes"],
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for this fretboard diagram"
      },
      "root": {
        "type": "string",
        "enum": ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"]
      },
      "label": {
        "type": "string",
        "description": "Optional display label"
      },
      "range": {
        "type": "object",
        "required": ["fromFret", "toFret"],
        "properties": {
          "fromFret": { "type": "integer", "minimum": 0, "maximum": 24 },
          "toFret": { "type": "integer", "minimum": 0, "maximum": 24 }
        }
      },
      "notes": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["position", "interval", "note"],
          "properties": {
            "position": {
              "type": "object",
              "required": ["string", "fret"],
              "properties": {
                "string": { "type": "integer", "minimum": 1, "maximum": 6 },
                "fret": { "type": "integer", "minimum": 0, "maximum": 24 }
              }
            },
            "interval": {
              "type": "string",
              "enum": ["R","b2","2","b3","3","4","#4","5","b6","6","b7","7"]
            },
            "note": {
              "type": "string",
              "enum": ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"]
            },
            "isRoot": {
              "type": "boolean"
            }
          }
        }
      },
      "metadata": {
        "type": "object",
        "properties": {
          "tuning": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 6,
            "maxItems": 6
          },
          "scaleFormula": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ["R","b2","2","b3","3","4","#4","5","b6","6","b7","7"]
            }
          }
        }
      }
    }
  }
}
```

---

### Usage Notes

- The `notes` array must explicitly list every visible note
- Root notes should be flagged with `isRoot: true`
- Overlays are intentionally unsupported in v1

---

## 5. Validation & Enforcement

Backend requirements:

1. Validate tool output with corresponding Zod schema
2. Reject or repair invalid outputs
3. Never render unvalidated data

These tools are **data-only** and do not imply layout or styling.

---

## 6. Relationship to UI Generation

Tool output is embedded inside UI component props:

```json
{
  "type": "ChordDiagram",
  "props": {
    "data": { /* create_chord_diagram output */ },
    "animate": true
  }
}
```

The UI planner determines placement and persistence.

---

## 7. Versioning

- This document defines **Claude Tool Schemas v1**
- Any schema changes require a new version
- Older lessons must remain renderable

---

## 8. Summary

These Claude tool schemas establish a **hard boundary** between AI intent and application behavior.

They enable:
- Safe diagram generation
- Predictable rendering
- Long-term lesson persistence

This is a foundational building block for **zero-friction lesson creation**.

