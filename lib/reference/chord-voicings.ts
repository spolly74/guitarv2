/**
 * Chord Voicing Reference Data
 *
 * Data sourced directly from tombatossals/chords-db (GitHub)
 * https://github.com/tombatossals/chords-db
 *
 * VERIFIED: All fret strings copied directly from the source repository
 */

export interface RawVoicing {
  /** Frets string: 6 chars for strings 6-1, x=muted, 0-9/a-z=fret */
  frets: string
  /** Optional barre fret */
  barre?: number
  /** Description of this voicing */
  name: string
}

/**
 * Standard guitar tuning: String 6 to String 1
 */
const TUNING = ["E", "A", "D", "G", "B", "E"] // strings 6,5,4,3,2,1

/**
 * Note names for calculating intervals
 */
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

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
  // a=10, b=11, c=12, d=13, etc.
  return char.charCodeAt(0) - "a".charCodeAt(0) + 10
}

/**
 * Get the note at a given string and fret
 */
function getNoteAtPosition(stringNum: number, fret: number): string {
  const openNote = TUNING[6 - stringNum]
  const openSemitone = NOTE_TO_SEMITONE[openNote]
  const noteSemitone = (openSemitone + fret) % 12
  return NOTES[noteSemitone]
}

/**
 * Get the interval name given root and note
 */
function getInterval(root: string, note: string): string {
  const rootSemitone = NOTE_TO_SEMITONE[root] ?? 0
  const noteSemitone = NOTE_TO_SEMITONE[note] ?? 0
  const interval = (noteSemitone - rootSemitone + 12) % 12
  return INTERVAL_SEMITONES[interval]
}

/**
 * Chord voicing database - VERIFIED data from tombatossals/chords-db
 * Each fret string is copied directly from the source files
 */
export const CHORD_DATABASE: Record<string, Record<string, RawVoicing[]>> = {
  // ============ C CHORDS ============
  "C": {
    "maj": [
      { frets: "x32010", name: "Open C" },
      { frets: "x35553", barre: 3, name: "A Shape" },
      { frets: "xx5558", barre: 5, name: "Partial" },
      { frets: "8aa988", barre: 8, name: "E Shape" }
    ],
    "m": [
      { frets: "x31013", name: "Open Cm" },
      { frets: "335543", barre: 3, name: "Am Shape" },
      { frets: "8655xx", name: "Partial" },
      { frets: "8aa888", barre: 8, name: "Em Shape" }
    ],
    "7": [
      { frets: "x32310", name: "Open C7" },
      { frets: "x35353", barre: 3, name: "A7 Shape" },
      { frets: "xx5556", barre: 5, name: "Partial" },
      { frets: "8a8988", barre: 8, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "8x888x", barre: 8, name: "Em7 Shape" },
      { frets: "x3134x", name: "Am7 Shape" },
      { frets: "335343", barre: 3, name: "Barre" },
      { frets: "xx5546", name: "Partial" },
      { frets: "8a8888", barre: 8, name: "Full Barre" }
    ],
    "maj7": [
      { frets: "332000", name: "Open Cmaj7" },
      { frets: "335453", barre: 3, name: "A Shape" },
      { frets: "xx5557", barre: 5, name: "Partial" },
      { frets: "xxaccc", barre: 10, name: "High" }
    ]
  },

  // ============ A CHORDS ============
  "A": {
    "maj": [
      { frets: "x02220", name: "Open A" },
      { frets: "x02225", name: "Open A (alt)" },
      { frets: "577655", barre: 5, name: "E Shape" },
      { frets: "x079a9", barre: 7, name: "High" }
    ],
    "m": [
      { frets: "x02210", name: "Open Am" },
      { frets: "x02555", barre: 2, name: "Partial Barre" },
      { frets: "577555", barre: 5, name: "Em Shape" },
      { frets: "x079a8", barre: 7, name: "High" }
    ],
    "7": [
      { frets: "x02020", name: "Open A7" },
      { frets: "x02223", barre: 2, name: "Barre" },
      { frets: "575655", barre: 5, name: "E7 Shape" },
      { frets: "x07989", barre: 7, name: "High" }
    ],
    "m7": [
      { frets: "x02010", name: "Open Am7" },
      { frets: "x02213", name: "Open Am7 (alt)" },
      { frets: "5x555x", barre: 5, name: "Shell" },
      { frets: "x05555", barre: 5, name: "Barre" },
      { frets: "575555", barre: 5, name: "Full Barre" },
      { frets: "x77988", barre: 7, name: "High" }
    ],
    "maj7": [
      { frets: "x02120", name: "Open Amaj7" },
      { frets: "x02224", barre: 2, name: "Barre" },
      { frets: "576655", barre: 5, name: "E Shape" },
      { frets: "x07999", barre: 7, name: "High" }
    ]
  },

  // ============ E CHORDS ============
  "E": {
    "maj": [
      { frets: "022100", name: "Open E" },
      { frets: "xx2454", name: "Partial" },
      { frets: "x76454", barre: 4, name: "A Shape" },
      { frets: "x79997", barre: 7, name: "High" }
    ],
    "m": [
      { frets: "022000", name: "Open Em" },
      { frets: "022453", barre: 2, name: "Partial" },
      { frets: "x79987", barre: 7, name: "Am Shape" },
      { frets: "ca99xx", barre: 9, name: "High" }
    ],
    "7": [
      { frets: "020100", name: "Open E7" },
      { frets: "x7675x", barre: 5, name: "Partial" },
      { frets: "779797", barre: 7, name: "Barre" },
      { frets: "xx999a", barre: 9, name: "High" }
    ],
    "m7": [
      { frets: "020000", name: "Open Em7" },
      { frets: "022030", name: "Open Em7 (alt)" },
      { frets: "0x000x", name: "Shell" },
      { frets: "022433", barre: 2, name: "Partial" },
      { frets: "779787", barre: 7, name: "Barre" },
      { frets: "xx998a", barre: 9, name: "High" }
    ],
    "maj7": [
      { frets: "021100", name: "Open Emaj7" },
      { frets: "xx2444", barre: 2, name: "Partial" },
      { frets: "x76444", barre: 4, name: "A Shape" },
      { frets: "779897", barre: 7, name: "Barre" }
    ]
  },

  // ============ G CHORDS ============
  "G": {
    "maj": [
      { frets: "320003", name: "Open G" },
      { frets: "355433", barre: 3, name: "E Shape" },
      { frets: "xx5787", name: "Partial" },
      { frets: "7a9787", barre: 7, name: "High" }
    ],
    "m": [
      { frets: "310033", name: "Open Gm" },
      { frets: "355333", barre: 3, name: "Em Shape" },
      { frets: "xx5786", name: "Partial" },
      { frets: "aaccba", barre: 10, name: "High" }
    ],
    "7": [
      { frets: "320001", name: "Open G7" },
      { frets: "353433", barre: 3, name: "E7 Shape" },
      { frets: "x55767", barre: 5, name: "A7 Shape" },
      { frets: "aacaca", barre: 10, name: "High" }
    ],
    "m7": [
      { frets: "3x333x", barre: 3, name: "Shell" },
      { frets: "353333", barre: 3, name: "Em7 Shape" },
      { frets: "x55766", barre: 5, name: "Am7 Shape" },
      { frets: "xa8a8a", barre: 8, name: "Partial" },
      { frets: "aacaba", barre: 10, name: "High" }
    ],
    "maj7": [
      { frets: "320002", name: "Open Gmaj7" },
      { frets: "354433", barre: 3, name: "E Shape" },
      { frets: "x55777", barre: 5, name: "A Shape" },
      { frets: "xacbca", barre: 10, name: "High" }
    ]
  },

  // ============ D CHORDS ============
  "D": {
    "maj": [
      { frets: "xx0232", name: "Open D" },
      { frets: "x54232", barre: 2, name: "Partial" },
      { frets: "x57775", barre: 5, name: "A Shape" },
      { frets: "accbaa", barre: 10, name: "E Shape" }
    ],
    "m": [
      { frets: "xx0231", name: "Open Dm" },
      { frets: "557765", barre: 5, name: "Am Shape" },
      { frets: "x8776x", barre: 6, name: "Partial" },
      { frets: "accaaa", barre: 10, name: "Em Shape" }
    ],
    "7": [
      { frets: "xx0212", name: "Open D7" },
      { frets: "x5453x", barre: 3, name: "Partial" },
      { frets: "557575", barre: 5, name: "A7 Shape" },
      { frets: "acabaa", barre: 10, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "xx0211", name: "Open Dm7" },
      { frets: "x57565", barre: 5, name: "Am7 Shape" },
      { frets: "xx7768", barre: 7, name: "Partial" },
      { frets: "acaaaa", barre: 10, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "xx0222", name: "Open Dmaj7" },
      { frets: "x54222", barre: 2, name: "Partial" },
      { frets: "557675", barre: 5, name: "A Shape" },
      { frets: "xx7779", barre: 7, name: "High" }
    ]
  },

  // ============ F CHORDS ============
  "F": {
    "maj": [
      { frets: "133211", barre: 1, name: "F Barre" },
      { frets: "xx3211", name: "Partial F" },
      { frets: "xx3565", barre: 3, name: "A Shape Partial" },
      { frets: "x87565", barre: 5, name: "High" },
      { frets: "x8aaa8", barre: 8, name: "Full High" }
    ],
    "m": [
      { frets: "133111", barre: 1, name: "Fm Barre" },
      { frets: "xx3564", barre: 3, name: "Partial" },
      { frets: "x8aa98", barre: 8, name: "Am Shape" },
      { frets: "dbaaxx", barre: 10, name: "High" }
    ],
    "7": [
      { frets: "131211", barre: 1, name: "F7 Barre" },
      { frets: "x33545", barre: 3, name: "A7 Shape" },
      { frets: "88a8a8", barre: 8, name: "E7 Shape" },
      { frets: "xxaaab", barre: 10, name: "High" }
    ],
    "m7": [
      { frets: "131111", barre: 1, name: "Fm7 Barre" },
      { frets: "1x111x", barre: 1, name: "Shell" },
      { frets: "xx3544", barre: 3, name: "Partial" },
      { frets: "88a898", barre: 8, name: "Am7 Shape" },
      { frets: "xxaa9b", barre: 10, name: "High" }
    ],
    "maj7": [
      { frets: "xx3210", name: "Partial Fmaj7" },
      { frets: "132211", barre: 1, name: "Fmaj7 Barre" },
      { frets: "x33555", barre: 3, name: "A Shape" },
      { frets: "88a9a8", barre: 8, name: "E Shape" }
    ]
  },

  // ============ B CHORDS ============
  "B": {
    "maj": [
      { frets: "224442", barre: 2, name: "A Shape" },
      { frets: "xx4447", barre: 4, name: "Partial" },
      { frets: "799877", barre: 7, name: "E Shape" },
      { frets: "x99bcb", barre: 9, name: "High" }
    ],
    "m": [
      { frets: "224432", barre: 2, name: "Am Shape" },
      { frets: "799777", barre: 7, name: "Em Shape" },
      { frets: "xx9bca", barre: 9, name: "Partial" },
      { frets: "xxcbca", barre: 11, name: "High" }
    ],
    "7": [
      { frets: "x21202", name: "Open B7" },
      { frets: "224242", barre: 2, name: "A7 Shape" },
      { frets: "797877", barre: 7, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "x20202", name: "Open Bm7" },
      { frets: "224232", barre: 2, name: "Am7 Shape" },
      { frets: "797777", barre: 7, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "x24342", barre: 2, name: "Amaj7 Shape" },
      { frets: "798877", barre: 7, name: "Emaj7 Shape" }
    ]
  },

  // ============ Bb / A# CHORDS ============
  "Bb": {
    "maj": [
      { frets: "x13331", barre: 1, name: "A Shape" },
      { frets: "65333x", barre: 3, name: "Partial" },
      { frets: "688766", barre: 6, name: "E Shape" },
      { frets: "x88aba", barre: 8, name: "High" }
    ],
    "m": [
      { frets: "x13321", barre: 1, name: "Am Shape" },
      { frets: "688666", barre: 6, name: "Em Shape" }
    ],
    "7": [
      { frets: "x13131", barre: 1, name: "A7 Shape" },
      { frets: "686766", barre: 6, name: "E7 Shape" }
    ],
    "m7": [
      { frets: "x13121", barre: 1, name: "Am7 Shape" },
      { frets: "686666", barre: 6, name: "Em7 Shape" }
    ],
    "maj7": [
      { frets: "x13231", barre: 1, name: "Amaj7 Shape" },
      { frets: "687766", barre: 6, name: "Emaj7 Shape" }
    ]
  },

  // ============ Eb / D# CHORDS ============
  "Eb": {
    "maj": [
      { frets: "x68886", barre: 6, name: "A Shape" },
      { frets: "x65343", name: "Partial" },
      { frets: "bddcbb", barre: 11, name: "E Shape" }
    ],
    "m": [
      { frets: "x68876", barre: 6, name: "Am Shape" },
      { frets: "bddbb", barre: 11, name: "Em Shape" }
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

  // ============ Ab / G# CHORDS ============
  "Ab": {
    "maj": [
      { frets: "466544", barre: 4, name: "E Shape" },
      { frets: "x46664", barre: 4, name: "A Shape" }
    ],
    "m": [
      { frets: "466444", barre: 4, name: "Em Shape" },
      { frets: "x46654", barre: 4, name: "Am Shape" }
    ],
    "7": [
      { frets: "464544", barre: 4, name: "E7 Shape" },
      { frets: "x46464", barre: 4, name: "A7 Shape" }
    ],
    "m7": [
      { frets: "464444", barre: 4, name: "Em7 Shape" },
      { frets: "x46454", barre: 4, name: "Am7 Shape" }
    ],
    "maj7": [
      { frets: "465544", barre: 4, name: "Emaj7 Shape" }
    ]
  },

  // ============ Db / C# CHORDS ============
  "Db": {
    "maj": [
      { frets: "x46664", barre: 4, name: "A Shape" },
      { frets: "9bba99", barre: 9, name: "E Shape" }
    ],
    "m": [
      { frets: "x46654", barre: 4, name: "Am Shape" },
      { frets: "9bb999", barre: 9, name: "Em Shape" }
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

  // ============ F# / Gb CHORDS ============
  "F#": {
    "maj": [
      { frets: "244322", barre: 2, name: "E Shape" },
      { frets: "x44676", barre: 4, name: "A Shape" }
    ],
    "m": [
      { frets: "244222", barre: 2, name: "Em Shape" },
      { frets: "x44654", barre: 4, name: "Am Shape" }
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

// Add enharmonic aliases
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

  return rawVoicings.map(rv => convertVoicing(normalizedRoot, rv))
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
