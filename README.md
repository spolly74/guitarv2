# Guitar Lesson Builder

An AI-powered interactive guitar lesson builder built with Next.js, Claude AI, and real-time streaming.

## Overview

Guitar Lesson Builder is a web application that lets users create interactive guitar lessons through natural conversation with an AI assistant. The AI can generate chord diagrams, fretboard visualizations, and educational content based on user requests.

### Key Features

- **AI-Powered Lesson Creation** - Chat with Claude to build lessons naturally
- **Interactive Chord Diagrams** - SVG-based chord diagrams with proper fingerings
- **Fretboard Visualizations** - Scale patterns and note positions on the fretboard
- **Drag-and-Drop Layout** - Reorder and pin lesson blocks as needed
- **Real-Time Streaming** - See AI responses as they're generated
- **Verified Chord Database** - Voicings sourced from tombatossals/chords-db

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI**: Claude API (claude-sonnet-4-20250514) with tool use
- **Styling**: Tailwind CSS 4, shadcn/ui
- **State Management**: React hooks with UIPlanner pattern
- **Drag & Drop**: @dnd-kit/sortable
- **Validation**: Zod schemas
- **Database**: Supabase (authentication ready)

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/chat/          # Streaming chat API endpoint
│   ├── lesson/[id]/       # Lesson workspace page
│   └── globals.css        # Global styles and theme
├── components/
│   ├── chat/              # Chat interface components
│   ├── diagrams/          # Chord and fretboard SVG renderers
│   ├── layout/            # Three-pane responsive layout
│   ├── lesson/            # Lesson workspace and blocks
│   └── ui/                # shadcn/ui components
├── hooks/
│   └── useChat.ts         # Chat state management hook
├── lib/
│   ├── ai/                # Claude client and tool handlers
│   │   ├── claude-client.ts    # Streaming chat with agentic loop
│   │   ├── tool-handlers.ts    # Tool execution and validation
│   │   ├── tool-definitions.ts # Claude tool schemas
│   │   └── system-prompt.ts    # AI system prompt
│   ├── generators/        # Scale and pattern generators
│   ├── music/             # Music theory utilities
│   ├── planner/           # UI state management
│   ├── reference/         # Chord voicing database
│   └── schemas/           # Zod validation schemas
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd guitarv2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture

### AI Integration

The app uses Claude's tool use feature to create lesson content. The agentic loop in `lib/ai/claude-client.ts` handles multiple rounds of tool calls:

1. User sends message
2. Claude processes and may call tools (create_chord_diagram, create_fretboard_diagram, etc.)
3. Tool results are sent back to Claude
4. Claude continues until it has a complete response

### Lesson Blocks

Lessons are composed of blocks managed by the `UIPlanner`:

- **ChordDiagram** - Interactive chord fingering diagram
- **FretboardDiagram** - Scale patterns on the fretboard
- **TextBlock** - Markdown-formatted text content
- **VideoEmbed** - YouTube video embeds

### Chord Database

Chord voicings are sourced from the verified [tombatossals/chords-db](https://github.com/tombatossals/chords-db) repository. The database includes:

- All 12 root notes (with enharmonic equivalents)
- Major, minor, dominant 7th, minor 7th, and major 7th qualities
- Multiple voicing positions per chord (open, barre, high positions)

## Available Tools

The AI has access to these tools:

| Tool | Description |
|------|-------------|
| `lookup_chord_voicing` | Look up voicings from the chord database |
| `create_chord_diagram` | Create a chord diagram block |
| `create_fretboard_diagram` | Create a fretboard visualization |
| `add_text_block` | Add explanatory text |
| `embed_video` | Embed a YouTube video |

## Deployment

### Vercel

The project is configured for Vercel deployment:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy (root directory is the repository root)

## Development Notes

### Music Theory Utilities

The `lib/music/note-utils.ts` module provides shared utilities:

- `getNoteIndex(note)` - Get semitone value (0-11) for a note
- `getNoteAtPosition(string, fret)` - Get note at a fretboard position
- `getSemitoneDistance(root, note)` - Calculate interval in semitones
- `transposeNote(note, semitones)` - Transpose a note

### Adding New Block Types

1. Add the Zod schema to `lib/schemas/`
2. Create a renderer component in `components/diagrams/`
3. Add the tool definition to `lib/ai/tool-definitions.ts`
4. Add the handler to `lib/ai/tool-handlers.ts`
5. Register in `components/lesson/BlockRenderer.tsx`

## License

MIT
