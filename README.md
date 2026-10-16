# ROOM S A

> **The room lies.**

ROOM S A is an interactive sci-fi puzzle game where reality follows deceptive rules. The player investigates atmospheric containment chambers, uncovers contradictions between physical evidence and room laws, breaches logic terminals, rewrites the rules governing the environment, and escapes.

---

## Current Status: Milestone 2 (Rewrite Reality // Natural-Language AI Rewrites)

> **Milestones 1 & 2 are complete and fully verified!** Players can now speak to the chamber in plain English (e.g. *"Make brass keys work like copper keys"* or *"Allow this brass key to unlock the blast door"*). An AI proxy translates requests into strictly-typed proposals, while the deterministic engine retains 100% authoritative control over world state.

### What Is Implemented & Playable Today:
- ✅ **Chamber 101 ("The Obvious Lie")**: Interactive sci-fi chamber with perspective depth, animated spotlights, and responsive hotspots.
- ✅ **Natural-Language AI Assistant**: Anomaly Terminal features a natural-language input field and "INTERPRET REQUEST" action.
- ✅ **Fastify Backend AI Proxy (`server/`)**: Secure Node.js + Fastify service routing to Google Gemini API (`gemini-2.5-flash`) or local deterministic semantic parser.
- ✅ **Strict Schema & Dual Validation**: Untrusted proposals are schema-checked on the server and independently verified by the engine reducer before application.
- ✅ **Proposal Preview & Explanation**: Displays proposed rule ID, operation, target condition, confidence percentage, and technical explanation before committing.
- ✅ **Guaranteed Offline Fallback**: Deterministic commands (`OVERRIDE RULE_01 BRASS`) and quick override buttons work 100% offline without network.
- ✅ **Procedural Web Audio Sound Engine**: Synthesizes tactile keystroke clicks, mechanical door thuds, hydraulic hisses, and reality distortion sweeps with mute controls.
- ✅ **Comprehensive Test Suite**: 31 unit, integration, server, and security tests passing with zero failures.

### Planned For Future Milestones:
- ⏳ **Milestone 3**: Additional chambers (102 & 103), gravity/mass physics rules, and contradictory laws.
- ⏳ **Milestone 4**: Final polish, hackathon demo packaging, and expanded speedrun telemetry.

---

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript (Strict Mode)
- **Bundler & Dev Server**: Vite
- **Styling**: Vanilla CSS with CSS Custom Properties (Design Tokens), Flexbox, CSS Grid
- **Icons**: Lucide React
- **Engine Architecture**: Pure TypeScript deterministic state machine
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`, jsdom
- **Linting**: ESLint 9 (Flat Config) with `typescript-eslint`

For detailed technical justifications, consult [docs/TECH_STACK.md](docs/TECH_STACK.md).

---

## Architecture Overview

ROOM S A enforces a strict unidirectional data flow:

```
[Presentation: React Components]
          │ (Dispatches typed GameAction)
          ▼
[Application Bridge: useGameState Hook]
          │
          ▼
[Authoritative Reducer: Pure TypeScript Engine]
          │
          ▼ (Validates against active WorldRules)
[Rule & Predicate Evaluator]
          │
          ▼
[Immutable Next GameState Snapshot]
```

- **The Game Engine is the Single Source of Truth**: The engine is a pure state machine with zero dependencies on React, the browser DOM, or network services.
- **Fail-Closed Validation**: Every action is validated prior to updating state.
- **AI Proposal Boundary**: Future AI interpretation acts strictly as an untrusted proposal generator that passes through schema and game-rule validation before execution.

For diagrams and deep-dive specifications, consult [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Getting Started (Windows / PowerShell)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later; tested on v24)
- `npm` (v9.0.0 or later)

### Installation
Clone or navigate to the repository directory:
```powershell
cd "c:\Users\Vanih\room sa\room-s-a"
npm install
```

### Running the Application

#### Option A: Frontend Only (Offline Deterministic Mode)
ROOM S A runs 100% offline without any backend or API key:
```powershell
npm run dev
```
Open `http://localhost:5173`. In the terminal, use deterministic commands (`OVERRIDE RULE_01 BRASS`) or the quick-action protocol button.

#### Option B: Full Stack (Frontend + AI Proxy Backend)
To enable the natural-language AI Rewrite Assistant:

1. In Terminal 1, launch the Fastify AI proxy server:
```powershell
npm run server
```
*(By default, uses the built-in deterministic semantic parser. To connect real Gemini LLM, set `GEMINI_API_KEY` in `.env`)*

2. In Terminal 2, launch the Vite dev server:
```powershell
npm run dev
```
Open `http://localhost:5173`. The terminal will show `AI PROXY: ONLINE`. Type requests in plain English!

### Verification Commands
```powershell
# Static typecheck (client + server)
npm run typecheck

# Code linting
npm run lint

# Run all 31 automated tests
npm test

# Production bundle build
npm run build
```

---

## Project Structure

```
room-s-a/
├── docs/
│   ├── ARCHITECTURE.md     # Engine design, data flow & Mermaid diagrams
│   ├── TECH_STACK.md       # Stack evaluations & rendering decisions
│   ├── GAME_DESIGN.md      # Game vision, Chamber 101 spec & art direction
│   ├── ROADMAP.md          # Milestones 1 through 4 with acceptance criteria
│   └── TESTING.md          # Testing strategy, matrices & commands
├── public/
│   ├── assets/             # Static game assets
│   └── favicon.svg         # Sci-fi geometric chamber favicon
├── src/
│   ├── app/
│   │   ├── App.tsx         # Foundation root application component
│   │   └── app.css         # Foundational layout & atmospheric lighting
│   ├── components/
│   │   ├── game/           # Game canvas and viewport frames
│   │   ├── room/           # Chamber visual representation & layers
│   │   ├── objects/        # Interactive hotspots (pedestal, door, slate)
│   │   └── ui/             # HUD, inventory, terminal modal, victory overlay
│   ├── game/
│   │   ├── engine/         # Pure TypeScript state reducer & store
│   │   ├── rules/          # Rule registry, predicates, & proposal validators
│   │   ├── puzzles/        # Chamber configurations & initial states
│   │   ├── interactions/   # Action handlers & event emitters
│   │   └── types/          # Authoritative domain types (GameState, WorldRule, etc.)
│   ├── hooks/              # React state bridge hooks
│   ├── services/
│   │   └── ai/             # Future AI proposal schemas & proxy clients
│   ├── styles/
│   │   ├── tokens.css      # Design tokens (colors, spacing, shadows, fonts)
│   │   ├── reset.css       # Modern CSS reset
│   │   └── global.css      # Global typography & root styles
│   ├── test/
│   │   ├── setup.ts        # Vitest jest-dom setup
│   │   └── App.test.tsx    # Foundational UI tests
│   └── main.tsx            # React DOM mounting entry point
├── .env.example            # Environment configuration template
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint 9 configuration
├── index.html              # HTML5 entry template with Google Fonts
├── package.json            # Scripts, dependencies & metadata
├── tsconfig.json           # Strict TypeScript compiler options
├── tsconfig.node.json      # Node/tooling TypeScript configuration
└── vite.config.ts          # Vite & Vitest configuration
```

---

## Future AI Integration Plan

In **Milestone 2**, players will be able to type natural-language instructions into the in-game terminal to propose modifications to chamber rules (e.g., *"Allow brass keys to open blast doors"*).

- **Security Isolation**: Provider API keys remain strictly on a lightweight backend proxy. No client code possesses credentials.
- **Deterministic Offline Fallback**: If the AI backend is unreachable, the terminal provides deterministic command suggestions so the game remains completely playable without internet access or API credits.
- **Untrusted Proposals**: AI outputs are strictly parsed and schema-validated before being evaluated against the authoritative engine's game rules. The AI has zero capability to mutate game state directly.

For details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#6-future-ai-integration-boundary--security-model).

---

## License

MIT
