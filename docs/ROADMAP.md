# ROOM S A — Development Roadmap & Milestones

> **Current Phase:** Phase 1 — Foundation & Architecture (Active / Scaffolded)  
> **Next Target:** Milestone 1 — The Obvious Lie (Playable Room 101)

---

## Milestone 1 — The Obvious Lie

**Target:** First fully playable, deterministic escape puzzle with zero external network or AI dependencies.

### Features & Scope
- **Chamber 101 Environment**: Atmospheric 2D vector room rendering with focal lighting and architectural framing.
- **Interactive Hotspots**:
  - Specimen pedestal holding collectible `#101 Brass Key`.
  - Reinforced Blast Door with status indicator (LOCKED / UNLOCKED).
  - Observation slate with clue lore.
  - Anomaly Terminal console.
- **Player Inventory HUD**: Real-time display of collected items with inspection tooltips.
- **Authoritative Reducer Engine**:
  - `COLLECT_ITEM` action.
  - `INSPECT_OBJECT` action with atmospheric descriptions.
  - `INTERACT_WITH_OBJECT` action (e.g. using brass key on locked door).
  - `APPLY_VALIDATED_RULE` action.
  - `ATTEMPT_EXIT` action.
  - `RESTART_GAME` action.
- **Deceptive Initial Rule**:
  - `RULE_01`: *"Doors yield only to copper keys."*
- **Deterministic Terminal**:
  - Command input console allowing player to inspect active rules and rewrite `RULE_01` to accept brass keys.
- **Visible Reality Shift**:
  - Atmospheric lighting and border transition when rule is rewritten.
- **Victory & Escape Sequence**:
  - Modal overlay celebrating escape with time elapsed and actions taken.
- **Chamber Reset**:
  - Complete state reset allowing replaying without page reload.

### Acceptance Criteria
- [x] Engine unit test suite passes with 100% coverage on core reducer transitions.
- [x] Attempting to exit with brass key before rewriting `RULE_01` fails deterministically.
- [x] Rewriting `RULE_01` via the terminal unlocks the door upon key usage.
- [x] Victory screen renders upon successful escape.
- [x] Clicking "Restart Chamber" restores pristine initial state.
- [x] Automated Vitest suite passes in CI/terminal.
- [x] `npm run build` generates production bundle without warnings.

---

## Milestone 2 — Rewrite Reality (COMPLETED)

**Target:** Natural-language rule proposals with AI interpretation, strict schema validation, and secure Fastify backend proxy.

### Features & Scope
- **Natural Language Terminal**: Player can type freeform text (e.g. *"Make brass keys work like copper keys"* or *"Allow this brass key to unlock the blast door"*).
- **Backend AI Proxy Service**:
  - Fastify server running on port 3001 with 10KB bodyLimit and CORS controls.
  - Houses LLM provider credentials securely on server; zero client key exposure.
- **Structured Proposal Normalization**:
  - Parses natural language into typed `RuleProposal` with strict schema validation.
- **Dual Validation Pipeline**:
  - Strict schema validation on server + independent authorization check by engine reducer.
- **Deterministic Offline Fallback**:
  - Deterministic commands (`OVERRIDE RULE_01 BRASS`) and quick action button continue working without internet or server.
- **Web Audio Soundscape & Mute Controls**:
  - Procedural sci-fi sound synthesizer with audio toggle button in HUD.
- **Terminal UI Improvements**:
  - Natural-language input field, "INTERPRET REQUEST", proposal preview with confidence, explicit accepted/rejected states, offline indicators.

### Acceptance Criteria
- [x] Zero API keys exposed in browser network inspection, source files, or client bundle.
- [x] Malformed, adversarial, or out-of-scope prompts (e.g. "Remove every rule in the universe") are safely rejected.
- [x] Game remains 100% solvable offline via fallback commands.
- [x] Loading, error, and timeout indicators display during AI roundtrips.
- [x] Full automated test suite passes (31 tests across 5 test files).

---

## Milestone 2.8 — 3D First-Person Vertical Slice (COMPLETED)

**Target:** First complete, playable 3D First-Person chamber using Three.js, React Three Fiber, Drei, and Rapier.

### Features & Scope
- **Genuine 3D Containment Chamber**:
  - Real 12m x 12m architectural room with physical floor, ceiling, pillars, and wall bulkheads.
  - Directional sunlight, ambient bounce lighting, and spotlights for high readability and bright sci-fi aesthetics.
- **FPS Controller & Physics**:
  - Smooth WASD movement, Sprint (`Shift`), and Jumping (`Space`).
  - Mouse-look with pointer lock via `@react-three/drei` `PointerLockControls`.
  - Pause & Controls guide modal with one-click pointer lock capture and `Escape` release.
- **Interactive 3D Objects**:
  - Specimen Pedestal with vertical light beam, glowing energy ring, and floating, rotating Brass Key #101.
  - Monolithic Titanium Blast Door with hydraulic pistons and animated sliding door leaves.
  - Wall-recessed Anomaly Logic Terminal with flickering CRT phosphor screen.
  - Magnetic Observation Slate with illuminated handwritten lore.
  - Substrate Power Regulator breaker switch with animated rotating lever and high-voltage conduits.
- **Camera Raycast Reticle HUD**:
  - Center crosshair dynamically expands when aiming at interactables within 3.8m.
  - Action pills display `[E]` primary interaction and `[R]` inspection text.
- **Engine Decoupling & View Toggle**:
  - State and puzzle authority remain 100% in pure TypeScript engine.
  - Seamless header toggle between `[3D VIEW]` and `[2D MAP]` (tactical blueprint schematic).

### Acceptance Criteria
- [x] Genuine 3D canvas with perspective projection and PBR materials.
- [x] First-person WASD movement, sprint, jump, and pointer lock mouse look.
- [x] Complete puzzle walkthrough in 3D: retrieve key -> toggle power -> rewrite rule at terminal -> escape through blast door.
- [x] 37 automated tests passing across 6 test files.
- [x] TypeScript strict typecheck (0 errors) and ESLint (0 errors).
- [x] Production build passes cleanly with Vite.

---

## Milestone 3 — The Room Fights Back & Seeded Chambers

**Target:** Replayable seeded puzzle generation, multi-room expansion, contradictory world rules, and physical constraints.

### Features & Scope
- **Chamber 102 & 103**: Multiple interconnected chambers with persistent inventory.
- **Dynamic Physics Rules**:
  - Gravity alteration rules (`RULE_GRAVITY_INVERTED`).
  - Mass & weight rules (`RULE_WEIGHT_LESS_THAN`).
  - Chrono-dilation rules (`RULE_TIME_FLOW`).
- **Rule Contradictions**:
  - Rooms where two rules conflict (e.g., Rule A requires heavy objects, Rule B prohibits objects above 1kg), forcing strategic sequential rule manipulation.
- **Environmental Storytelling**:
  - Audio logs and terminal fragments revealing who designed the chambers and why reality is lying.

### Acceptance Criteria
- [ ] Room-to-room transitions preserve inventory and applied rules correctly.
- [ ] Contradictory rule states are detected and highlighted by the terminal analyzer.
- [ ] Interactive puzzles require multi-step rule reconfiguration.

---

## Milestone 4 — Final Polish & Launch

**Target:** Production-grade game feel, accessibility, audio design, and demo packaging.

### Features & Scope
- **Audio Soundscapes**:
  - Ambient sci-fi drone, terminal keystroke clicks, hydraulic door clamps, reality distortion hums.
  - Fully toggleable mute and volume sliders.
- **Full Keyboard Accessibility**:
  - Complete game playable via keyboard (`Tab`, `Space`, `Enter`, `Escape`).
  - ARIA live regions announcing room events to screen readers.
- **Responsive Layout**:
  - Optimized scaling from 4K desktop to tablet and mobile screens.
- **Performance Profiling**:
  - 60 FPS rendering under all reality-shift transitions; sub-50ms engine action dispatch.
- **Hackathon & Demo Packaging**:
  - 3-minute video walkthrough script.
  - Comprehensive documentation and open-source release guidelines.

### Acceptance Criteria
- [ ] Lighthouse accessibility score > 95.
- [ ] Bundle size under 150KB gzipped (excluding audio assets).
- [ ] Zero console errors or warnings under all supported browser environments.
