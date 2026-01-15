/**
 * ChordDiagramSVG v1 - Canonical Dimensions and Geometry
 * From SVG Rendering Contract v1
 */

export const CHORD_SVG = {
  WIDTH: 240,
  HEIGHT: 320,
  LEFT_MARGIN: 40,
  RIGHT_MARGIN: 20,
  TOP_MARGIN: 40,
  BOTTOM_MARGIN: 20,
  STRING_SPACING: 32,
  FRET_SPACING: 48,
  VISIBLE_FRETS: 4,
  STRINGS: 6,
  NOTE_RADIUS: 10,
  ROOT_RADIUS: 12,
  NUT_WIDTH: 4,
  FRET_WIDTH: 1,
  STRING_WIDTH: 1,
} as const

/**
 * Calculate X coordinate for a string
 * String 1 = high E (leftmost), String 6 = low E (rightmost)
 */
export function stringX(stringNumber: number): number {
  return CHORD_SVG.LEFT_MARGIN + (stringNumber - 1) * CHORD_SVG.STRING_SPACING
}

/**
 * Calculate Y coordinate for a fret line
 * fretIndex 0 = nut position
 */
export function fretY(fretIndex: number): number {
  return CHORD_SVG.TOP_MARGIN + fretIndex * CHORD_SVG.FRET_SPACING
}

/**
 * Calculate center position for a note circle
 * Positioned between fret lines (in the middle of the fret space)
 */
export function notePosition(
  string: number,
  fret: number,
  baseFret: number = 1
): { cx: number; cy: number } {
  const relativeFret = fret === 0 ? 0 : fret - baseFret + 1

  return {
    cx: stringX(string),
    cy: relativeFret === 0
      ? fretY(0) - 15 // Open string position above nut
      : fretY(relativeFret) - CHORD_SVG.FRET_SPACING / 2
  }
}

/**
 * Get the grid boundary coordinates
 */
export function getGridBounds() {
  return {
    left: stringX(1),
    right: stringX(CHORD_SVG.STRINGS),
    top: fretY(0),
    bottom: fretY(CHORD_SVG.VISIBLE_FRETS)
  }
}
