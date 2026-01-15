/**
 * FretboardDiagramSVG v1 - Canonical Dimensions and Geometry
 * From SVG Rendering Contract v1
 */

export const FRETBOARD_SVG = {
  WIDTH: 640,
  HEIGHT: 160,
  LEFT_MARGIN: 40,
  RIGHT_MARGIN: 20,
  TOP_MARGIN: 20,
  BOTTOM_MARGIN: 20,
  STRING_SPACING: 20,
  FRET_SPACING: 48,
  NOTE_RADIUS: 8,
  ROOT_RADIUS: 10,
  FRET_WIDTH: 1,
  STRING_WIDTH: 1,
} as const

/**
 * Fret positions where inlay markers appear
 */
export const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
export const DOUBLE_INLAY_FRETS = [12, 24]

/**
 * Calculate X coordinate for a fret position
 */
export function fretX(fret: number, fromFret: number): number {
  return FRETBOARD_SVG.LEFT_MARGIN + (fret - fromFret) * FRETBOARD_SVG.FRET_SPACING
}

/**
 * Calculate Y coordinate for a string
 * String 6 (low E) appears at top, String 1 (high E) at bottom
 */
export function stringY(stringNumber: number): number {
  return FRETBOARD_SVG.TOP_MARGIN + (6 - stringNumber) * FRETBOARD_SVG.STRING_SPACING
}

/**
 * Calculate center position for a note circle
 * Positioned to the left of the fret line (in playing position)
 */
export function notePosition(
  string: number,
  fret: number,
  fromFret: number
): { cx: number; cy: number } {
  return {
    cx: fret === 0
      ? FRETBOARD_SVG.LEFT_MARGIN - 15 // Open string position
      : fretX(fret, fromFret) - FRETBOARD_SVG.FRET_SPACING / 2,
    cy: stringY(string)
  }
}

/**
 * Calculate the required width for a given fret range
 */
export function calculateWidth(fromFret: number, toFret: number): number {
  const fretCount = toFret - fromFret + 1
  return FRETBOARD_SVG.LEFT_MARGIN + fretCount * FRETBOARD_SVG.FRET_SPACING + FRETBOARD_SVG.RIGHT_MARGIN
}

/**
 * Get the grid boundary coordinates
 */
export function getGridBounds(fromFret: number, toFret: number) {
  return {
    left: FRETBOARD_SVG.LEFT_MARGIN,
    right: fretX(toFret, fromFret) + FRETBOARD_SVG.FRET_SPACING / 2,
    top: stringY(6),
    bottom: stringY(1)
  }
}
