/**
 * Music Theory Utilities
 *
 * Shared utility functions for working with notes, intervals, and fretboard positions.
 * Used by generators and other music-related code.
 */

import type { NoteName, Interval } from "@/lib/schemas/primitives"
import { CHROMATIC_NOTES, STANDARD_TUNING, INTERVAL_SEMITONES } from "@/lib/schemas/primitives"

/**
 * Map of note names to their semitone values (0-11)
 * Handles enharmonic equivalents (C# = Db, etc.)
 */
const NOTE_TO_SEMITONE: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1,
  "D": 2, "D#": 3, "Eb": 3,
  "E": 4,
  "F": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10,
  "B": 11
}

/**
 * Get the semitone value (0-11) of a note
 *
 * @param note - Note name (e.g., "C", "F#", "Bb")
 * @returns Semitone value from 0 (C) to 11 (B)
 *
 * @example
 * getNoteIndex("C")  // returns 0
 * getNoteIndex("F#") // returns 6
 * getNoteIndex("Gb") // returns 6 (enharmonic equivalent)
 */
export function getNoteIndex(note: NoteName): number {
  return NOTE_TO_SEMITONE[note] ?? 0
}

/**
 * Get the note at a given fret position on a given string
 *
 * @param stringNum - String number (1-6, where 1 is high E)
 * @param fret - Fret number (0 for open string)
 * @returns The note name at that position
 *
 * @example
 * getNoteAtPosition(6, 0)  // returns "E" (open low E string)
 * getNoteAtPosition(6, 5)  // returns "A"
 * getNoteAtPosition(1, 3)  // returns "G" (3rd fret, high E string)
 */
export function getNoteAtPosition(stringNum: number, fret: number): NoteName {
  const openNote = STANDARD_TUNING[stringNum - 1]
  const openNoteIndex = getNoteIndex(openNote)
  const noteIndex = (openNoteIndex + fret) % 12
  return CHROMATIC_NOTES[noteIndex]
}

/**
 * Find the lowest fret (0-12) where a note appears on a given string
 *
 * @param stringNum - String number (1-6)
 * @param targetNote - Note to find
 * @returns Fret number (0-11) where the note first appears
 *
 * @example
 * findNoteOnString(6, "A") // returns 5 (A on low E string)
 * findNoteOnString(5, "A") // returns 0 (open A string)
 */
export function findNoteOnString(stringNum: number, targetNote: NoteName): number {
  const openNote = STANDARD_TUNING[stringNum - 1]
  const openNoteIndex = getNoteIndex(openNote)
  const targetIndex = getNoteIndex(targetNote)
  const fret = (targetIndex - openNoteIndex + 12) % 12
  return fret
}

/**
 * Calculate the interval between two notes
 *
 * @param root - The root note
 * @param note - The note to compare
 * @returns Semitone distance (0-11)
 *
 * @example
 * getSemitoneDistance("C", "E")  // returns 4 (major third)
 * getSemitoneDistance("C", "G")  // returns 7 (perfect fifth)
 */
export function getSemitoneDistance(root: NoteName, note: NoteName): number {
  const rootIndex = getNoteIndex(root)
  const noteIndex = getNoteIndex(note)
  return (noteIndex - rootIndex + 12) % 12
}

/**
 * Check if a note belongs to a scale and return its interval
 *
 * @param note - The note to check
 * @param root - The root note of the scale
 * @param scaleIntervals - Array of intervals in the scale
 * @returns The interval name if found, null otherwise
 *
 * @example
 * getIntervalInScale("E", "C", ["R", "2", "3", "4", "5", "6", "7"])
 * // returns "3" (E is the major third of C)
 */
export function getIntervalInScale(
  note: NoteName,
  root: NoteName,
  scaleIntervals: Interval[]
): Interval | null {
  const semitones = getSemitoneDistance(root, note)

  for (const interval of scaleIntervals) {
    if (INTERVAL_SEMITONES[interval] === semitones) {
      return interval
    }
  }
  return null
}

/**
 * Transpose a note by a number of semitones
 *
 * @param note - Starting note
 * @param semitones - Number of semitones to transpose (can be negative)
 * @returns The transposed note
 *
 * @example
 * transposeNote("C", 4)   // returns "E"
 * transposeNote("G", -2)  // returns "F"
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const currentIndex = getNoteIndex(note)
  const newIndex = (currentIndex + semitones + 12) % 12
  return CHROMATIC_NOTES[newIndex]
}
