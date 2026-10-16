# ROOM S A — Technology Stack & Architectural Decisions

## 1. Stack Summary

| Domain | Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Component-driven UI composition, fast reconciliation, ecosystem maturity, and clean hooks-based state bindings. |
| **Language** | **TypeScript (Strict Mode)** | Complete type safety across engine actions, rule predicates, and component interfaces; elimination of runtime null/undefined surprises. |
| **Build Tool** | **Vite** | Instant HMR, zero-latency build cycles, optimized Rollup bundling, native ESM support. |
| **Styling** | **Vanilla CSS + Custom Properties** | Zero runtime overhead, full control over design tokens, seamless CSS Grid / Flexbox layouts, and hardware-accelerated transitions. |
| **Icons** | **Lucide React** | Clean, minimalist, geometric icons fitting the austere sci-fi aesthetic (terminals, locks, inventory, anomalous glyphs). |
| **Game Engine** | **Custom Standalone TypeScript Engine** | Pure functional reducer architecture; zero UI/DOM coupling; 100% deterministic and unit-testable. |
| **Unit & Integration Testing** | **Vitest + React Testing Library + jsdom** | Blazing-fast test runner native to Vite; idiomatic component testing; engine testable without DOM overhead. |
| **Linting & Code Quality** | **ESLint 9 (Flat Config) + typescript-eslint** | Strict linting enforcement, preventing unused variables, unhandled promises, and syntax anomalies. |

---

## 2. Rendering Architecture Evaluation

A foundational technical question is how to render the deceptive room environments, interactive hotspots, terminals, and reality-warping effects.

### Options Evaluated:

| Rendering Approach | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **3D WebGL (Three.js / Babylon.js)** | Full 3D camera navigation, immersive lighting. | Huge bundle footprint (2MB+), complex asset pipeline, high battery/GPU consumption, clumsy UI/text rendering for terminals. | **Rejected** for Phase 1. Overkill for puzzle logic and introduces high friction for web play. |
| **HTML5 Canvas (2D Context)** | High particle throughput, custom sprite blitting. | Poor accessibility; manual hit-testing required for hotspots; blurry text rendering unless scaled manually; poor keyboard navigation. | **Rejected** as primary view layer. |
| **Hybrid 2D: Semantic HTML + Modern CSS + SVG** | Razor-sharp typography on retina displays; native accessibility; trivial click/focus hotspot detection; CSS filter distortions for reality shifts; lightweight bundle (<100KB). | Not suited for thousands of simultaneous moving sprites (which a puzzle game does not need). | **Selected as Primary Architecture.** |

### Selected Rendering Strategy:
- **Environment Backdrop**: Scaled SVG and layered CSS container with responsive aspect ratios (16:9 / 4:3 fixed canvas box).
- **Interactive Hotspots**: Absolute/relative positioned semantic `<button>` elements with SVG overlays, custom cursor styles, and accessible ARIA attributes.
- **Reality Shift Transitions**: CSS custom property transitions, backdrop blur filters, chromatic aberration animations, and ambient scanlines.
- **Terminal System**: High-contrast monospace DOM component featuring keyboard navigation, auto-focus, and audit log history.

---

## 3. Game Engine: Why a Custom Deterministic Reducer?

Rather than coupling game state to React component state (`useState` scattered across UI components) or importing a bulky general-purpose game engine (e.g. Phaser), ROOM S A uses an **in-house deterministic reducer**:

$$\text{NextState} = \text{engineReducer}(\text{CurrentState}, \text{Action})$$

### Advantages:
1. **Total Testability**: Engine logic can be thoroughly tested with zero browser dependencies. A test can simulate 50 player moves in 5 milliseconds.
2. **Deterministic Replay & Undo**: Since each state transition is an immutable pure function, recording player sessions and replaying them for bug reports or speedrun validation is trivial.
3. **Save/Load Readiness**: Serializing the entire state to JSON is a single `JSON.stringify(gameState)` call.
4. **Clean AI Boundary**: When the rule rewrite system accepts an AI proposal, it is processed via the same immutable action pipeline as regular clicks.

---

## 4. Testing Framework Choice

- **Vitest**: Chosen for tight integration with Vite config and fast worker-based execution.
- **React Testing Library**: Enforces testing behavior rather than implementation details (e.g. querying by accessible role or text instead of internal state).
- **jsdom**: Simulates the browser environment for React component rendering tests.

---

## 5. Security & Future Backend Strategy

### Client-Side Isolation
- The Phase 1 client contains **zero external network requests**, zero telemetry trackers, and zero API keys.
- All game rules for Milestone 1 are compiled locally.

### Future Backend Architecture (Milestone 2)
When natural-language rule alterations are introduced:
- A lightweight **Node.js + Fastify** proxy will be deployed.
- The backend will hold provider API keys (e.g. Gemini API).
- The client sends `{ rawInput: string, currentContext: RoomContext }`.
- The backend prompts the LLM to output a strict JSON schema:
  ```json
  {
    "targetRuleId": "RULE_DOOR_KEY_REQUIREMENT",
    "proposedStatement": "Doors yield to brass keys.",
    "newPredicateKey": "RULE_ACCEPT_BRASS_KEY"
  }
  ```
- The backend validates the JSON against a Zod schema before returning it to the client.
- The client engine validates the proposal against the active game constraints before applying it.
- **Fallback**: If the backend is unreachable, the client falls back to deterministic terminal autocompletion.
