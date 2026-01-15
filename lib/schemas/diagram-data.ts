import { z } from "zod"
import {
  NoteNameSchema,
  IntervalSchema,
  GuitarPositionSchema,
} from "./primitives"

/**
 * ChordDiagramPosition - A single note in a chord diagram
 */
export const ChordDiagramPositionSchema = z.object({
  position: GuitarPositionSchema,
  interval: IntervalSchema,
  note: NoteNameSchema
})

export type ChordDiagramPosition = z.infer<typeof ChordDiagramPositionSchema>

/**
 * ChordDiagramData - A single concrete chord shape (voicing)
 * Used for: shell voicings, drop voicings, triads, partial grips
 */
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
})

export type ChordDiagramData = z.infer<typeof ChordDiagramDataSchema>

/**
 * FretboardNote - A single note in a fretboard diagram
 */
export const FretboardNoteSchema = z.object({
  position: GuitarPositionSchema,
  interval: IntervalSchema,
  note: NoteNameSchema,
  isRoot: z.boolean().optional()
})

export type FretboardNote = z.infer<typeof FretboardNoteSchema>

/**
 * FretboardRange - The visible fret range
 */
export const FretboardRangeSchema = z.object({
  fromFret: z.number().int().min(0).max(24),
  toFret: z.number().int().min(0).max(24)
}).refine(
  r => r.toFret >= r.fromFret,
  { message: "toFret must be >= fromFret" }
)

export type FretboardRange = z.infer<typeof FretboardRangeSchema>

/**
 * FretboardDiagramData - A conceptual fretboard view
 * Used for: scales, arpeggios, chord tones
 */
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
})

export type FretboardDiagramData = z.infer<typeof FretboardDiagramDataSchema>
