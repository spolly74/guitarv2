/**
 * Chord Voicing Reference Data
 *
 * Data sourced from tombatossals/chords-db (GitHub)
 * https://github.com/tombatossals/chords-db
 *
 * Format: frets string where each char is a fret (0-9, a=10, b=11, c=12, x=muted)
 * Position in string: 0=string6 (low E), 5=string1 (high E)
 */

export interface RawVoicing {
  /** Frets string: 6 chars for strings 6-1, x=muted, 0-9/a-z=fret */
  frets: string
  /** Optional barre fret */
  barre?: number
  /** Description of this voicing */
  name: string
}

export interface ChordVoicing {
  root: string
  quality: string
  voicings: RawVoicing[]
}

/**
 * Standard guitar tuning: String 6 to String 1
 */
const TUNING = ["E", "A", "D", "G", "B", "E"] // strings 6,5,4,3,2,1

/**
 * Note names for calculating intervals
 */
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

/**
 * Semitone values for notes
 */
const NOTE_TO_SEMITONE: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1,
  "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "Fb": 4, "E#": 5,
  "F": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10,
  "B": 11, "Cb": 11, "B#": 0
}

/**
 * Intervals from root in semitones
 */
const INTERVAL_SEMITONES: Record<number, string> = {
  0: "R",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "b5",
  7: "5",
  8: "#5",
  9: "6",
  10: "b7",
  11: "7"
}

/**
 * Parse a fret character to number (-1 for muted)
 */
function parseFretChar(char: string): number {
  if (char === "x" || char === "X") return -1
  if (char >= "0" && char <= "9") return parseInt(char)
  // a=10, b=11, c=12, etc.
  return char.charCodeAt(0) - "a".charCodeAt(0) + 10
}

/**
 * Get the note at a given string and fret
 */
function getNoteAtPosition(stringNum: number, fret: number): string {
  const openNote = TUNING[6 - stringNum] // Convert string number (1-6) to array index
  const openSemitone = NOTE_TO_SEMITONE[openNote]
  const noteSemitone = (openSemitone + fret) % 12
  return NOTES[noteSemitone]
}

/**
 * Get the interval name given root and note
 */
function getInterval(root: string, note: string): string {
  const rootSemitone = NOTE_TO_SEMITONE[root]
  const noteSemitone = NOTE_TO_SEMITONE[note]
  const interval = (noteSemitone - rootSemitone + 12) % 12
  return INTERVAL_SEMITONES[interval]
}

/**
 * Chord voicing database - verified data from tombatossals/chords-db
 */
export const CHORD_DATABASE: Record<string, Record<string, RawVoicing[]>> = {
  // C chords
  "C": {
    "maj": [
      { frets: "x32010", name: "Open C (C Shape)" },
      { frets: "x35553", barre: 3, name: "A Shape barre" },
      { frets: "8aa988", barre: 8, name: "E Shape barre" }
    ],
    "m": [
      { frets: "x35543", barre: 3, name: "Am Shape barre" },
      { frets: "8aa888", barre: 8, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "x32310", name: "Open C7" },
      { frets: "x35353", barre: 3, name: "A Shape" },
      { frets: "8a898x", barre: 8, name: "E Shape" }
    ],
    "m7": [
      { frets: "x3534x", name: "Am7 Shape" },
      { frets: "8a888x", barre: 8, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "x32000", name: "Open Cmaj7" },
      { frets: "x35453", barre: 3, name: "A Shape" }
    ]
  },
  // G chords
  "G": {
    "maj": [
      { frets: "320003", name: "Open G (G Shape)" },
      { frets: "320033", name: "Open G (alt)" },
      { frets: "355433", barre: 3, name: "E Shape barre" }
    ],
    "m": [
      { frets: "355333", barre: 3, name: "Em Shape barre" },
      { frets: "xx5333", barre: 3, name: "Em Shape (4 strings)" }
    ],
    "7": [
      { frets: "320001", name: "Open G7" },
      { frets: "353433", barre: 3, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "353333", barre: 3, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "320002", name: "Open Gmaj7" }
    ]
  },
  // D chords
  "D": {
    "maj": [
      { frets: "xx0232", name: "Open D (D Shape)" },
      { frets: "x57775", barre: 5, name: "A Shape barre" }
    ],
    "m": [
      { frets: "xx0231", name: "Open Dm (Dm Shape)" },
      { frets: "x57765", barre: 5, name: "Am Shape barre" }
    ],
    "7": [
      { frets: "xx0212", name: "Open D7" },
      { frets: "x57575", barre: 5, name: "A7 Shape" }
    ],
    "m7": [
      { frets: "xx0211", name: "Open Dm7" },
      { frets: "x57565", barre: 5, name: "Am7 Shape" }
    ],
    "maj7": [
      { frets: "xx0222", name: "Open Dmaj7" }
    ]
  },
  // A chords
  "A": {
    "maj": [
      { frets: "x02220", name: "Open A (A Shape)" },
      { frets: "577655", barre: 5, name: "E Shape barre" }
    ],
    "m": [
      { frets: "x02210", name: "Open Am (Am Shape)" },
      { frets: "577555", barre: 5, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "x02020", name: "Open A7" },
      { frets: "575655", barre: 5, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "x02010", name: "Open Am7" },
      { frets: "575555", barre: 5, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "x02120", name: "Open Amaj7" }
    ]
  },
  // E chords
  "E": {
    "maj": [
      { frets: "022100", name: "Open E (E Shape)" }
    ],
    "m": [
      { frets: "022000", name: "Open Em (Em Shape)" }
    ],
    "7": [
      { frets: "020100", name: "Open E7" }
    ],
    "m7": [
      { frets: "020000", name: "Open Em7" },
      { frets: "022030", name: "Open Em7 (alt)" }
    ],
    "maj7": [
      { frets: "021100", name: "Open Emaj7" }
    ]
  },
  // F chords
  "F": {
    "maj": [
      { frets: "133211", barre: 1, name: "E Shape barre" },
      { frets: "xx3211", name: "Partial F" }
    ],
    "m": [
      { frets: "133111", barre: 1, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "131211", barre: 1, name: "E7 Shape barre" }
    ],
    "m7": [
      { frets: "131111", barre: 1, name: "Em7 Shape barre" }
    ],
    "maj7": [
      { frets: "132211", barre: 1, name: "Emaj7 Shape barre" },
      { frets: "xx3210", name: "Partial Fmaj7" }
    ]
  },
  // B chords
  "B": {
    "maj": [
      { frets: "x24442", barre: 2, name: "A Shape barre" },
      { frets: "799877", barre: 7, name: "E Shape barre" }
    ],
    "m": [
      { frets: "x24432", barre: 2, name: "Am Shape barre" },
      { frets: "799777", barre: 7, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "x21202", name: "Open B7" },
      { frets: "x24242", barre: 2, name: "A7 Shape" }
    ],
    "m7": [
      { frets: "x24232", barre: 2, name: "Am7 Shape" },
      { frets: "797777", barre: 7, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "x24342", barre: 2, name: "Amaj7 Shape" }
    ]
  },
  // Bb / A# chords
  "Bb": {
    "maj": [
      { frets: "x13331", barre: 1, name: "A Shape barre" },
      { frets: "688766", barre: 6, name: "E Shape barre" }
    ],
    "m": [
      { frets: "x13321", barre: 1, name: "Am Shape barre" },
      { frets: "688666", barre: 6, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "x13131", barre: 1, name: "A7 Shape" },
      { frets: "686766", barre: 6, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "x13121", barre: 1, name: "Am7 Shape" }
    ],
    "maj7": [
      { frets: "x13231", barre: 1, name: "Amaj7 Shape" }
    ]
  },
  // Eb / D# chords
  "Eb": {
    "maj": [
      { frets: "x68886", barre: 6, name: "A Shape barre" },
      { frets: "x65343", name: "Open-ish Eb" }
    ],
    "m": [
      { frets: "x68876", barre: 6, name: "Am Shape barre" }
    ],
    "7": [
      { frets: "x68686", barre: 6, name: "A7 Shape" }
    ],
    "m7": [
      { frets: "x68676", barre: 6, name: "Am7 Shape" }
    ],
    "maj7": [
      { frets: "x68786", barre: 6, name: "Amaj7 Shape" }
    ]
  },
  // Ab / G# chords
  "Ab": {
    "maj": [
      { frets: "466544", barre: 4, name: "E Shape barre" }
    ],
    "m": [
      { frets: "466444", barre: 4, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "464544", barre: 4, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "464444", barre: 4, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "465544", barre: 4, name: "Emaj7 Shape" }
    ]
  },
  // Db / C# chords
  "Db": {
    "maj": [
      { frets: "x46664", barre: 4, name: "A Shape barre" }
    ],
    "m": [
      { frets: "x46654", barre: 4, name: "Am Shape barre" }
    ],
    "7": [
      { frets: "x46464", barre: 4, name: "A7 Shape" }
    ],
    "m7": [
      { frets: "x46454", barre: 4, name: "Am7 Shape" }
    ],
    "maj7": [
      { frets: "x46564", barre: 4, name: "Amaj7 Shape" }
    ]
  },
  // F# / Gb chords
  "F#": {
    "maj": [
      { frets: "244322", barre: 2, name: "E Shape barre" }
    ],
    "m": [
      { frets: "244222", barre: 2, name: "Em Shape barre" }
    ],
    "7": [
      { frets: "242322", barre: 2, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "242222", barre: 2, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "243322", barre: 2, name: "Emaj7 Shape" }
    ]
  }
}

// Add sharp/flat aliases
CHORD_DATABASE["A#"] = CHORD_DATABASE["Bb"]
CHORD_DATABASE["D#"] = CHORD_DATABASE["Eb"]
CHORD_DATABASE["G#"] = CHORD_DATABASE["Ab"]
CHORD_DATABASE["C#"] = CHORD_DATABASE["Db"]
CHORD_DATABASE["Gb"] = CHORD_DATABASE["F#"]

/**
 * Convert a raw voicing to the format expected by create_chord_diagram
 */
export function convertVoicing(
  root: string,
  quality: string,
  rawVoicing: RawVoicing
): {
  positions: { position: { string: number; fret: number }; interval: string; note: string }[]
  baseFret: number
  mutedStrings: number[]
  name: string
} {
  const positions: { position: { string: number; fret: number }; interval: string; note: string }[] = []
  const mutedStrings: number[] = []
  let minFret = Infinity
  let maxFret = 0

  // Parse frets string (index 0 = string 6, index 5 = string 1)
  for (let i = 0; i < 6; i++) {
    const fret = parseFretChar(rawVoicing.frets[i])
    const stringNum = 6 - i // Convert to string number (6 = low E, 1 = high E)

    if (fret === -1) {
      mutedStrings.push(stringNum)
    } else {
      const note = getNoteAtPosition(stringNum, fret)
      const interval = getInterval(root, note)

      positions.push({
        position: { string: stringNum, fret },
        interval,
        note
      })

      if (fret > 0) {
        minFret = Math.min(minFret, fret)
        maxFret = Math.max(maxFret, fret)
      }
    }
  }

  // Determine baseFret for position marker
  let baseFret = 1
  if (rawVoicing.barre) {
    baseFret = rawVoicing.barre
  } else if (minFret > 3 && minFret !== Infinity) {
    baseFret = minFret
  }

  return {
    positions,
    baseFret,
    mutedStrings,
    name: rawVoicing.name
  }
}

/**
 * Look up chord voicings from the database
 */
export function lookupVoicings(
  root: string,
  quality: string
): {
  positions: { position: { string: number; fret: number }; interval: string; note: string }[]
  baseFret: number
  mutedStrings: number[]
  name: string
}[] {
  // Normalize the root note
  const normalizedRoot = root.charAt(0).toUpperCase() + root.slice(1)

  // Get voicings for this root
  const rootVoicings = CHORD_DATABASE[normalizedRoot]
  if (!rootVoicings) {
    return []
  }

  // Normalize quality
  const normalizedQuality = quality.toLowerCase()
  const qualityAliases: Record<string, string> = {
    "major": "maj",
    "minor": "m",
    "min": "m",
    "dom7": "7",
    "dominant7": "7"
  }
  const lookupQuality = qualityAliases[normalizedQuality] || normalizedQuality

  const rawVoicings = rootVoicings[lookupQuality]
  if (!rawVoicings) {
    return []
  }

  return rawVoicings.map(rv => convertVoicing(normalizedRoot, quality, rv))
}

/**
 * Get a specific voicing by index
 */
export function getVoicing(
  root: string,
  quality: string,
  index: number = 0
): {
  root: string
  quality: string
  positions: { position: { string: number; fret: number }; interval: string; note: string }[]
  baseFret: number
  mutedStrings: number[]
  name: string
} | null {
  const voicings = lookupVoicings(root, quality)
  if (voicings.length === 0 || index >= voicings.length) {
    return null
  }

  return {
    root,
    quality,
    ...voicings[index]
  }
}

/**
 * List all available chord types for a root
 */
export function getAvailableQualities(root: string): string[] {
  const normalizedRoot = root.charAt(0).toUpperCase() + root.slice(1)
  const rootVoicings = CHORD_DATABASE[normalizedRoot]
  if (!rootVoicings) {
    return []
  }
  return Object.keys(rootVoicings)
}

/**
 * List all available roots
 */
export function getAvailableRoots(): string[] {
  return Object.keys(CHORD_DATABASE).filter(r => !["A#", "D#", "G#", "C#", "Gb"].includes(r))
}
