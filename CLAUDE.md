# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server on port 3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS v4 with custom animations
- **Storage**: localStorage (API config, history), sessionStorage (current reading flow)
- **API**: OpenAI-compatible LLM APIs with streaming (SSE)

## Architecture Overview

### Data Flow
```
Home (question + spread) → Draw (FanDeck selection) → Analysis (AI interpretation + chat) → History
```

Session data passes between pages via sessionStorage. Persistent data (API config, reading history up to 50 items) uses localStorage.

### Key Directories
- `app/` - Next.js pages (all client components with `'use client'`)
- `app/api/chat/route.ts` - Server proxy for default LLM (protects API key)
- `components/` - UI components (FanDeck, FlipCard, FlyingCard, AnalysisDisplay, ModelSelector, Toast, etc.)
- `hooks/` - Custom React hooks (useTarotAnalysis for streaming analysis)
- `types/` - TypeScript type definitions (tarot.ts)
- `data/` - Static JSON (78 tarot cards, 6 spreads)
- `utils/` - LLM config, prompts, history manager, SSE parser, card images

### Dual LLM Configuration
1. **Default LLM** (server-side): Requests proxy through `/api/chat` to protect server API key
2. **Custom LLM** (user-configured): Direct browser requests to user's endpoint for privacy

Environment variables: `DEFAULT_LLM_*` (server-side), `NEXT_PUBLIC_*` (client-side indicator)

### Component Patterns
- **FanDeck**: 160° arc, 380px radius for card selection with hover/selection states
- **FlipCard**: 3D CSS transforms with preserve-3d for card reveals
- **FlyingCard**: Animated movement from deck to spread positions using DOM refs
- **TarotChat**: Follow-up chat with SSE streaming and markdown rendering
- **useTarotAnalysis**: Hook for streaming AI analysis with SSE parsing (`utils/sseParser.ts`)

### Data Structures
- Cards: `tarot-cards.json` with uprightKeywords/reversedKeywords, suit info
- Spreads: `spreads.json` with position definitions and descriptions
- Card images: PNG files in `/public/cards/`

## Key Patterns

- All interactive pages use `'use client'` directive
- 50% reversal probability on card draw (Fisher-Yates shuffle)
- Prompts constructed in `utils/prompts.ts` with per-spread guidance in `spreadPromptGuidance`
- History managed by singleton `historyManager` with unique IDs: `reading_${timestamp}_${randomId}`
- Glass-panel styling: `border border-white/20 bg-white/5 backdrop-blur`

## Adding Features

**New Spread**: Add to `data/spreads.json`, optionally add guidance in `utils/prompts.ts::spreadPromptGuidance`, add layout in `app/draw/page.tsx::renderSpreadLayout()`

**Customize AI**: Edit `utils/prompts.ts` for system/user prompts and spread-specific overrides
