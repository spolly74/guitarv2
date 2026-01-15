import type { Tool } from "@anthropic-ai/sdk/resources/messages"

/**
 * Claude Tool Definitions v1
 * These are the only allowed mechanisms for AI to create diagrams
 */

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: "lookup_chord_voicing",
    description: "Look up reference chord voicings from the database. Use this BEFORE creating a chord diagram to get correct fret positions. Returns voicing data with positions, baseFret, and mutedStrings that can be used directly with create_chord_diagram.",
    input_schema: {
      type: "object" as const,
      required: ["root", "quality"],
      properties: {
        root: {
          type: "string",
          enum: ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"],
          description: "Root note of the chord"
        },
        quality: {
          type: "string",
          description: "Chord quality: 'maj' for major, 'm' for minor, 'maj7', 'm7', '7' for seventh chords"
        },
        voicingIndex: {
          type: "integer",
          minimum: 0,
          description: "Optional: index of specific voicing to retrieve (0 = first/most common voicing)"
        }
      }
    }
  },
  {
    name: "create_chord_diagram",
    description: "Create a single concrete guitar chord diagram (one voicing). Use for shell voicings, drop voicings, triads, and partial grips.",
    input_schema: {
      type: "object" as const,
      required: ["root", "quality", "positions"],
      properties: {
        root: {
          type: "string",
          enum: ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]
        },
        quality: {
          type: "string",
          description: "Chord quality (e.g. m7, 7, maj7, dim7, aug)"
        },
        positions: {
          type: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            type: "object",
            required: ["position", "interval", "note"],
            properties: {
              position: {
                type: "object",
                required: ["string", "fret"],
                properties: {
                  string: { type: "integer", minimum: 1, maximum: 6 },
                  fret: { type: "integer", minimum: 0, maximum: 24 }
                }
              },
              interval: {
                type: "string",
                enum: ["R", "b2", "2", "b3", "3", "4", "#4", "b5", "5", "#5", "b6", "6", "b7", "7"]
              },
              note: {
                type: "string",
                enum: ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]
              }
            }
          }
        },
        baseFret: {
          type: "integer",
          minimum: 1,
          maximum: 24,
          description: "Starting fret for higher-position shapes"
        },
        mutedStrings: {
          type: "array",
          items: { type: "integer", minimum: 1, maximum: 6 },
          description: "Strings that are muted (not played)"
        },
        metadata: {
          type: "object",
          properties: {
            name: { type: "string", description: "Display name for the chord" },
            tuning: {
              type: "array",
              items: { type: "string" },
              minItems: 6,
              maxItems: 6,
              description: "Tuning for each string (default: standard)"
            }
          }
        }
      }
    }
  },
  {
    name: "create_fretboard_diagram",
    description: "Create a fretboard diagram showing note positions over a range. Use for scales, arpeggios, and chord tones.",
    input_schema: {
      type: "object" as const,
      required: ["root", "range", "notes"],
      properties: {
        root: {
          type: "string",
          enum: ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]
        },
        label: {
          type: "string",
          description: "Optional display label (e.g. 'C Minor Pentatonic')"
        },
        range: {
          type: "object",
          required: ["fromFret", "toFret"],
          properties: {
            fromFret: { type: "integer", minimum: 0, maximum: 24 },
            toFret: { type: "integer", minimum: 0, maximum: 24 }
          }
        },
        notes: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["position", "interval", "note"],
            properties: {
              position: {
                type: "object",
                required: ["string", "fret"],
                properties: {
                  string: { type: "integer", minimum: 1, maximum: 6 },
                  fret: { type: "integer", minimum: 0, maximum: 24 }
                }
              },
              interval: {
                type: "string",
                enum: ["R", "b2", "2", "b3", "3", "4", "#4", "b5", "5", "#5", "b6", "6", "b7", "7"]
              },
              note: {
                type: "string",
                enum: ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]
              },
              isRoot: {
                type: "boolean",
                description: "Whether this note is a root note"
              }
            }
          }
        },
        metadata: {
          type: "object",
          properties: {
            tuning: {
              type: "array",
              items: { type: "string" },
              minItems: 6,
              maxItems: 6
            },
            scaleFormula: {
              type: "array",
              items: {
                type: "string",
                enum: ["R", "b2", "2", "b3", "3", "4", "#4", "b5", "5", "#5", "b6", "6", "b7", "7"]
              }
            }
          }
        }
      }
    }
  },
  {
    name: "add_text_block",
    description: "Add an explanatory text block to the lesson. Use markdown formatting.",
    input_schema: {
      type: "object" as const,
      required: ["content"],
      properties: {
        content: {
          type: "string",
          description: "Markdown content for the text block"
        }
      }
    }
  },
  {
    name: "embed_video",
    description: "Embed a YouTube video in the lesson.",
    input_schema: {
      type: "object" as const,
      required: ["videoId"],
      properties: {
        videoId: {
          type: "string",
          description: "YouTube video ID (e.g. 'dQw4w9WgXcQ')"
        },
        startTimeSeconds: {
          type: "integer",
          minimum: 0,
          description: "Optional start time in seconds"
        }
      }
    }
  }
]
