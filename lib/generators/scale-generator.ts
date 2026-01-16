/**
 * Scale Generator
 *
 * Generates fretboard diagram data for various scale types.
 * Used by the AI to create scale visualizations on the fretboard.
 */

import { v4 as uuidv4 } from "uuid"
import type { NoteName, Interval } from "@/lib/schemas/primitives"
import type { FretboardDiagramData, FretboardNote } from "@/lib/schemas/diagram-data"
import { getNoteAtPosition, getIntervalInScale } from "@/lib/music/note-utils"

/** Supported scale types */
export type ScaleType = "major" | "minor_pentatonic" | "major_pentatonic" | "blues"

/** Input parameters for scale generation */
export interface ScaleGeneratorInput {
  /** Root note of the scale */
  root: NoteName
  /** Type of scale to generate */
  scale: ScaleType
  /** Fret range to display */
  range: { fromFret: number; toFret: number }
}

/**
 * Scale formulas defined as arrays of intervals
 */
const SCALE_FORMULAS: Record<ScaleType, Interval[]> = {
  major: ["R", "2", "3", "4", "5", "6", "7"],
  minor_pentatonic: ["R", "b3", "4", "5", "b7"],
  major_pentatonic: ["R", "2", "3", "5", "6"],
  blues: ["R", "b3", "4", "#4", "5", "b7"]
}

/**
 * Human-readable scale names for display
 */
const SCALE_LABELS: Record<ScaleType, string> = {
  major: "Major Scale",
  minor_pentatonic: "Minor Pentatonic",
  major_pentatonic: "Major Pentatonic",
  blues: "Blues Scale"
}

/**
 * Generate fretboard diagram data for a scale
 *
 * Iterates through all positions in the specified fret range and
 * identifies notes that belong to the requested scale.
 *
 * @param input - Scale generation parameters
 * @returns FretboardDiagramData ready for rendering
 *
 * @example
 * const scale = generateScale({
 *   root: "A",
 *   scale: "minor_pentatonic",
 *   range: { fromFret: 5, toFret: 8 }
 * })
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
