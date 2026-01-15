import { v4 as uuidv4 } from "uuid"
import type { NoteName, Interval } from "@/lib/schemas/primitives"
import { CHROMATIC_NOTES, STANDARD_TUNING } from "@/lib/schemas/primitives"
import type { ChordDiagramData, ChordDiagramPosition } from "@/lib/schemas/diagram-data"

type ChordQuality = "m7" | "7" | "maj7"
type StringSet = "low" | "middle" | "high"

interface ShellVoicingInput {
  root: NoteName
  quality: ChordQuality
  stringSet: StringSet
}

/**
 * Shell voicing shape - describes fret offsets from the root
 * Each shape has positions relative to the root note
 */
interface ShellShape {
  // String number (1-6) to fret offset from root position
  positions: Array<{
    string: number
    fretOffset: number
    interval: Interval
  }>
  // Which string has the root note
  rootString: number
}

/**
 * Shell voicing shapes for each quality and string set combination
 *
 * Shell voicings typically include: root, 3rd/b3, and 7th/b7
 * Low = root on strings 5-6
 * Middle = root on strings 3-4
 * High = root on strings 1-2
 */
const SHELL_SHAPES: Record<ChordQuality, Record<StringSet, ShellShape>> = {
  // Minor 7: R, b3, b7
  "m7": {
    low: {
      rootString: 6,
      positions: [
        { string: 6, fretOffset: 0, interval: "R" },
        { string: 4, fretOffset: 0, interval: "b7" },
        { string: 3, fretOffset: 0, interval: "b3" }
      ]
    },
    middle: {
      rootString: 5,
      positions: [
        { string: 5, fretOffset: 0, interval: "R" },
        { string: 3, fretOffset: 0, interval: "b7" },
        { string: 2, fretOffset: 0, interval: "b3" }
      ]
    },
    high: {
      rootString: 4,
      positions: [
        { string: 4, fretOffset: 0, interval: "R" },
        { string: 2, fretOffset: 0, interval: "b7" },
        { string: 1, fretOffset: 0, interval: "b3" }
      ]
    }
  },
  // Dominant 7: R, 3, b7
  "7": {
    low: {
      rootString: 6,
      positions: [
        { string: 6, fretOffset: 0, interval: "R" },
        { string: 4, fretOffset: 1, interval: "b7" },
        { string: 3, fretOffset: 1, interval: "3" }
      ]
    },
    middle: {
      rootString: 5,
      positions: [
        { string: 5, fretOffset: 0, interval: "R" },
        { string: 3, fretOffset: 1, interval: "b7" },
        { string: 2, fretOffset: 1, interval: "3" }
      ]
    },
    high: {
      rootString: 4,
      positions: [
        { string: 4, fretOffset: 0, interval: "R" },
        { string: 2, fretOffset: 1, interval: "b7" },
        { string: 1, fretOffset: 1, interval: "3" }
      ]
    }
  },
  // Major 7: R, 3, 7
  "maj7": {
    low: {
      rootString: 6,
      positions: [
        { string: 6, fretOffset: 0, interval: "R" },
        { string: 4, fretOffset: 2, interval: "7" },
        { string: 3, fretOffset: 1, interval: "3" }
      ]
    },
    middle: {
      rootString: 5,
      positions: [
        { string: 5, fretOffset: 0, interval: "R" },
        { string: 3, fretOffset: 2, interval: "7" },
        { string: 2, fretOffset: 1, interval: "3" }
      ]
    },
    high: {
      rootString: 4,
      positions: [
        { string: 4, fretOffset: 0, interval: "R" },
        { string: 2, fretOffset: 2, interval: "7" },
        { string: 1, fretOffset: 1, interval: "3" }
      ]
    }
  }
}

/**
 * Get the semitone value of a note
 */
function getNoteIndex(note: NoteName): number {
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
 * Find the fret where a note appears on a given string
 * Returns the lowest fret position (0-12)
 */
function findNoteOnString(stringNum: number, targetNote: NoteName): number {
  const openNote = STANDARD_TUNING[stringNum - 1]
  const openNoteIndex = getNoteIndex(openNote)
  const targetIndex = getNoteIndex(targetNote)
  const fret = (targetIndex - openNoteIndex + 12) % 12
  return fret
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
 * Quality display names
 */
const QUALITY_NAMES: Record<ChordQuality, string> = {
  "m7": "m7",
  "7": "7",
  "maj7": "maj7"
}

/**
 * Generate a ChordDiagramData for a shell voicing
 */
export function generateShellVoicing(input: ShellVoicingInput): ChordDiagramData {
  const { root, quality, stringSet } = input
  const shape = SHELL_SHAPES[quality][stringSet]

  // Find where the root note is on the root string
  const rootFret = findNoteOnString(shape.rootString, root)

  // Calculate actual positions
  const positions: ChordDiagramPosition[] = shape.positions.map(pos => {
    const fret = rootFret + pos.fretOffset
    const note = getNoteAtPosition(pos.string, fret)
    return {
      position: { string: pos.string, fret },
      interval: pos.interval,
      note
    }
  })

  // Determine muted strings (all strings not in the voicing)
  const usedStrings = new Set(positions.map(p => p.position.string))
  const mutedStrings: number[] = []
  for (let s = 1; s <= 6; s++) {
    if (!usedStrings.has(s)) {
      mutedStrings.push(s)
    }
  }

  // Calculate base fret for display
  const frets = positions.map(p => p.position.fret).filter(f => f > 0)
  const baseFret = frets.length > 0 ? Math.min(...frets) : undefined

  return {
    id: uuidv4(),
    root,
    quality: QUALITY_NAMES[quality],
    positions,
    baseFret,
    mutedStrings,
    metadata: {
      name: `${root}${QUALITY_NAMES[quality]} Shell (${stringSet} strings)`
    }
  }
}
