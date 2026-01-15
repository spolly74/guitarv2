"use client"

import type { FretboardDiagramData } from "@/lib/schemas"
import {
  FRETBOARD_SVG,
  INLAY_FRETS,
  DOUBLE_INLAY_FRETS,
  fretX,
  stringY,
  notePosition,
  calculateWidth,
  getGridBounds
} from "./svg/fretboard-geometry"

export interface FretboardDiagramProps {
  data: FretboardDiagramData
  highlightRoots?: boolean
}

export function FretboardDiagram({
  data,
  highlightRoots = true
}: FretboardDiagramProps) {
  const { fromFret, toFret } = data.range
  const width = calculateWidth(fromFret, toFret)
  const bounds = getGridBounds(fromFret, toFret)

  // Generate fret numbers to display
  const fretNumbers = Array.from(
    { length: toFret - fromFret + 1 },
    (_, i) => fromFret + i
  )

  return (
    <svg
      viewBox={`0 0 ${width} ${FRETBOARD_SVG.HEIGHT}`}
      className="fretboard-diagram"
      role="img"
      aria-label={data.label ?? `${data.root} fretboard diagram`}
    >
      {/* Title for accessibility */}
      <title>{data.label ?? `${data.root} scale/arpeggio`}</title>

      {/* Label */}
      {data.label && (
        <text
          x={width / 2}
          y={12}
          textAnchor="middle"
          className="fill-foreground text-xs font-medium"
        >
          {data.label}
        </text>
      )}

      {/* Nut (if starting from fret 0) */}
      {fromFret === 0 && (
        <line
          x1={FRETBOARD_SVG.LEFT_MARGIN}
          y1={bounds.top}
          x2={FRETBOARD_SVG.LEFT_MARGIN}
          y2={bounds.bottom}
          className="nut"
          strokeWidth={4}
        />
      )}

      {/* String lines (horizontal) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`string-${i + 1}`}
          x1={FRETBOARD_SVG.LEFT_MARGIN}
          y1={stringY(i + 1)}
          x2={bounds.right}
          y2={stringY(i + 1)}
          className="string-line"
          strokeWidth={FRETBOARD_SVG.STRING_WIDTH}
        />
      ))}

      {/* Fret lines (vertical) */}
      {fretNumbers.map((fret) => (
        <line
          key={`fret-${fret}`}
          x1={fretX(fret, fromFret) + FRETBOARD_SVG.FRET_SPACING / 2}
          y1={bounds.top}
          x2={fretX(fret, fromFret) + FRETBOARD_SVG.FRET_SPACING / 2}
          y2={bounds.bottom}
          className="fret-line"
          strokeWidth={FRETBOARD_SVG.FRET_WIDTH}
        />
      ))}

      {/* Fret inlay markers */}
      {fretNumbers
        .filter(fret => INLAY_FRETS.includes(fret))
        .map((fret) => {
          const x = fretX(fret, fromFret)
          const isDouble = DOUBLE_INLAY_FRETS.includes(fret)

          if (isDouble) {
            return (
              <g key={`inlay-${fret}`}>
                <circle
                  cx={x}
                  cy={stringY(4.5)}
                  r={3}
                  className="fill-muted-foreground/30"
                />
                <circle
                  cx={x}
                  cy={stringY(2.5)}
                  r={3}
                  className="fill-muted-foreground/30"
                />
              </g>
            )
          }

          return (
            <circle
              key={`inlay-${fret}`}
              cx={x}
              cy={(bounds.top + bounds.bottom) / 2}
              r={3}
              className="fill-muted-foreground/30"
            />
          )
        })}

      {/* Fret numbers */}
      {fretNumbers
        .filter(fret => fret > 0)
        .map((fret) => (
          <text
            key={`fret-num-${fret}`}
            x={fretX(fret, fromFret)}
            y={bounds.bottom + 15}
            textAnchor="middle"
            className="fret-number"
          >
            {fret}
          </text>
        ))}

      {/* Notes */}
      {data.notes.map((note, i) => {
        const { cx, cy } = notePosition(
          note.position.string,
          note.position.fret,
          fromFret
        )
        const isRoot = highlightRoots && (note.isRoot || note.interval === "R")
        const radius = isRoot ? FRETBOARD_SVG.ROOT_RADIUS : FRETBOARD_SVG.NOTE_RADIUS

        return (
          <g
            key={`note-${i}`}
            className={`note ${isRoot ? "note--root" : ""}`}
            data-interval={note.interval}
            data-note={note.note}
          >
            <circle cx={cx} cy={cy} r={radius} />
            <text
              x={cx}
              y={cy + 3}
              textAnchor="middle"
              className="interval-label"
              style={{ fontSize: "8px" }}
            >
              {note.interval}
            </text>
            <title>{`${note.note} (${note.interval}) - String ${note.position.string}, Fret ${note.position.fret}`}</title>
          </g>
        )
      })}
    </svg>
  )
}
