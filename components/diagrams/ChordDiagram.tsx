"use client"

import type { ChordDiagramData } from "@/lib/schemas"
import {
  CHORD_SVG,
  stringX,
  fretY,
  notePosition,
  getGridBounds
} from "./svg/chord-geometry"

export interface ChordDiagramProps {
  data: ChordDiagramData
  animate?: boolean
  showIntervals?: boolean
}

export function ChordDiagram({
  data,
  animate = false,
  showIntervals = false
}: ChordDiagramProps) {
  const baseFret = data.baseFret ?? 1
  const bounds = getGridBounds()

  // Determine which strings have notes (for muted/open display)
  const playedStrings = new Set(data.positions.map(p => p.position.string))
  const mutedStrings = new Set(data.mutedStrings ?? [])

  return (
    <svg
      viewBox={`0 0 ${CHORD_SVG.WIDTH} ${CHORD_SVG.HEIGHT}`}
      className="chord-diagram"
      role="img"
      aria-label={`${data.root}${data.quality} chord diagram`}
    >
      {/* Title for accessibility */}
      <title>{`${data.root}${data.quality} chord`}</title>

      {/* Chord name label */}
      <text
        x={CHORD_SVG.WIDTH / 2}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-sm font-medium"
      >
        {data.metadata?.name ?? `${data.root}${data.quality}`}
      </text>

      {/* Nut (thick line at fret 1) */}
      {baseFret === 1 && (
        <line
          x1={bounds.left}
          y1={bounds.top}
          x2={bounds.right}
          y2={bounds.top}
          className="nut"
          strokeWidth={CHORD_SVG.NUT_WIDTH}
        />
      )}

      {/* Fret lines */}
      {Array.from({ length: CHORD_SVG.VISIBLE_FRETS + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={bounds.left}
          y1={fretY(i)}
          x2={bounds.right}
          y2={fretY(i)}
          className="fret-line"
          strokeWidth={CHORD_SVG.FRET_WIDTH}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: CHORD_SVG.STRINGS }).map((_, i) => (
        <line
          key={`string-${i + 1}`}
          x1={stringX(i + 1)}
          y1={bounds.top}
          x2={stringX(i + 1)}
          y2={bounds.bottom}
          className="string-line"
          strokeWidth={CHORD_SVG.STRING_WIDTH}
        />
      ))}

      {/* Muted string markers (X above string) */}
      {Array.from({ length: CHORD_SVG.STRINGS }).map((_, i) => {
        const stringNum = i + 1
        if (mutedStrings.has(stringNum)) {
          return (
            <text
              key={`muted-${stringNum}`}
              x={stringX(stringNum)}
              y={bounds.top - 10}
              textAnchor="middle"
              className="muted-marker"
            >
              ✕
            </text>
          )
        }
        // Open string marker (O above string) - only if not played and not muted
        if (!playedStrings.has(stringNum) && !mutedStrings.has(stringNum)) {
          return null // Unmarked strings are assumed to not be played
        }
        return null
      })}

      {/* Open string markers (O) for notes at fret 0 */}
      {data.positions
        .filter(p => p.position.fret === 0)
        .map((pos, i) => (
          <text
            key={`open-${i}`}
            x={stringX(pos.position.string)}
            y={bounds.top - 10}
            textAnchor="middle"
            className="muted-marker"
          >
            ○
          </text>
        ))}

      {/* Base fret label (when not at position 1) */}
      {baseFret > 1 && (
        <text
          x={bounds.left - 15}
          y={fretY(0) + CHORD_SVG.FRET_SPACING / 2 + 4}
          textAnchor="middle"
          className="base-fret-label"
        >
          {baseFret}fr
        </text>
      )}

      {/* Notes */}
      {data.positions
        .filter(p => p.position.fret > 0) // Skip open strings (rendered as O above)
        .map((pos, i) => {
          const { cx, cy } = notePosition(
            pos.position.string,
            pos.position.fret,
            baseFret
          )
          const isRoot = pos.interval === "R"
          const radius = isRoot ? CHORD_SVG.ROOT_RADIUS : CHORD_SVG.NOTE_RADIUS

          return (
            <g
              key={`note-${i}`}
              className={`note ${isRoot ? "note--root" : ""} ${animate ? "note--animate" : ""}`}
              data-interval={pos.interval}
              data-note={pos.note}
            >
              <circle cx={cx} cy={cy} r={radius} />
              {showIntervals && (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className="interval-label"
                >
                  {pos.interval}
                </text>
              )}
              <title>{`${pos.note} (${pos.interval}) - String ${pos.position.string}, Fret ${pos.position.fret}`}</title>
            </g>
          )
        })}
    </svg>
  )
}
