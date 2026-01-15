import { z } from "zod"

/**
 * NoteName - Represents a pitch class using common enharmonic spellings
 */
export const NoteNameSchema = z.enum([
  "C", "C#", "Db",
  "D", "D#", "Eb",
  "E",
  "F", "F#", "Gb",
  "G", "G#", "Ab",
  "A", "A#", "Bb",
  "B"
])

export type NoteName = z.infer<typeof NoteNameSchema>

/**
 * Interval - Intervals expressed relative to the root
 */
export const IntervalSchema = z.enum([
  "R",
  "b2", "2",
  "b3", "3",
  "4", "#4",
  "5", "b6",
  "6",
  "b7", "7"
])

export type Interval = z.infer<typeof IntervalSchema>

/**
 * GuitarPosition - A single location on the guitar neck
 * String 1 = high E, String 6 = low E (standard tuning)
 * Fret 0 = open string
 */
export const GuitarPositionSchema = z.object({
  string: z.number().int().min(1).max(6),
  fret: z.number().int().min(0).max(24)
})

export type GuitarPosition = z.infer<typeof GuitarPositionSchema>

/**
 * Standard tuning note names for each string (1-6)
 */
export const STANDARD_TUNING: NoteName[] = ["E", "B", "G", "D", "A", "E"]

/**
 * All note names in chromatic order starting from C
 */
export const CHROMATIC_NOTES: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]

/**
 * Interval to semitone mapping
 */
export const INTERVAL_SEMITONES: Record<Interval, number> = {
  "R": 0,
  "b2": 1, "2": 2,
  "b3": 3, "3": 4,
  "4": 5, "#4": 6,
  "5": 7, "b6": 8,
  "6": 9,
  "b7": 10, "7": 11
}
