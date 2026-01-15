import { v4 as uuidv4 } from "uuid"
import type { NoteName, Interval } from "@/lib/schemas/primitives"
import { CHROMATIC_NOTES, STANDARD_TUNING, INTERVAL_SEMITONES } from "@/lib/schemas/primitives"
import type { FretboardDiagramData, FretboardNote } from "@/lib/schemas/diagram-data"

type ScaleType = "major" | "minor_pentatonic" | "major_pentatonic" | "blues"

interface ScaleGeneratorInput {
  root: NoteName
  scale: ScaleType
  range: { fromFret: number; toFret: number }
}

/**
 * Scale formulas as intervals
 */
const SCALE_FORMULAS: Record<ScaleType, Interval[]> = {
  major: ["R", "2", "3", "4", "5", "6", "7"],
  minor_pentatonic: ["R", "b3", "4", "5", "b7"],
  major_pentatonic: ["R", "2", "3", "5", "6"],
  blues: ["R", "b3", "4", "#4", "5", "b7"]
}

const SCALE_LABELS: Record<ScaleType, string> = {
  major: "Major Scale",
  minor_pentatonic: "Minor Pentatonic",
  major_pentatonic: "Major Pentatonic",
  blues: "Blues Scale"
}

/**
 * Get the semitone value of a note
 */
function getNoteIndex(note: NoteName): number {
  // Handle enharmonic equivalents
  const normalized: Record<string, number> = {
    "C": 0, "C#": 1, "Db": 1,
    "D": 2, "D#": 3, "Eb": 3,
    "E": 4,
    "F": 5, "F#": 6, "Gb": 6,
    "G": 7, "G#": 8, "Ab": 8,
    "A": 9, "A#": 10, "Bb": 10,
    "B": 11
  }
  return normalized[note] ?? 0
}

/**
 * Get the note at a given fret on a given string
 */
function getNoteAtPosition(stringNum: number, fret: number): NoteName {
  const openNote = STANDARD_TUNING[stringNum - 1]
  const openNoteIndex = getNoteIndex(openNote)
  const noteIndex = (openNoteIndex + fret) % 12
  return CHROMATIC_NOTES[noteIndex]
}

/**
 * Check if a note is in the scale
 */
function getIntervalInScale(
  note: NoteName,
  root: NoteName,
  scaleIntervals: Interval[]
): Interval | null {
  const rootIndex = getNoteIndex(root)
  const noteIndex = getNoteIndex(note)
  const semitones = (noteIndex - rootIndex + 12) % 12

  // Find matching interval
  for (const interval of scaleIntervals) {
    if (INTERVAL_SEMITONES[interval] === semitones) {
      return interval
    }
  }
  return null
}

/**
 * Generate a FretboardDiagramData for a scale
 */
export function generateScale(input: ScaleGeneratorInput): FretboardDiagramData {
  const { root, scale, range } = input
  const formula = SCALE_FORMULAS[scale]
  const notes: FretboardNote[] = []

  // Iterate through all positions in the range
  for (let string = 1; string <= 6; string++) {
    for (let fret = range.fromFret; fret <= range.toFret; fret++) {
      const note = getNoteAtPosition(string, fret)
      const interval = getIntervalInScale(note, root, formula)

      if (interval !== null) {
        notes.push({
          position: { string, fret },
          interval,
          note,
          isRoot: interval === "R"
        })
      }
    }
  }

  return {
    id: uuidv4(),
    root,
    label: `${root} ${SCALE_LABELS[scale]}`,
    range,
    notes,
    metadata: {
      scaleFormula: formula
    }
  }
}
