# ROOM S A — 3D Architecture & First-Person Vertical Slice Plan

## Executive Summary
This document specifies the technical architecture and migration plan to transform **ROOM S A** from the 2D layout into a genuine, highly interactive first-person 3D puzzle-adventure chamber using **Three.js**, **@react-three/fiber**, **@react-three/drei**, and **@react-three/rapier**.

---

## 1. Architectural Principles
1. **Engine Authority**: The existing authoritative reducer (`src/game/engine/reducer.ts`), deterministic rule registry (`src/game/rules/`), and state machine remain the 100% authoritative source of truth.
2. **Pure 3D Rendering**: The chamber is rendered in real 3D with perspective projection, procedural sci-fi geometry, PBR materials, spot/point lights, and physical collision boundaries.
3. **Raycast Interaction Pipeline**: The player aims their reticle at 3D objects. A forward camera raycaster (range: 3.5 units) detects interactable colliders and surfaces contextual prompts (`[E] Collect`, `[E] Access Terminal`, `[R] Inspect`).
4. **Hybrid DOM HUD**: 3D canvas renders the immersive environment; React DOM overlays render the reticle, prompts, inventory bar, rule status pill, Anomaly Terminal modal, and pause/controls menu.
5. **Graceful Degeneration & Testability**: Vitest tests run headlessly against engine logic, interaction math, and React UI components. WebGL error boundaries catch context loss.

---

## 2. Technology Stack & Dependencies
- **Three.js** `^0.186.1` — WebGL 3D graphics library.
- **@react-three/fiber** `^9.8.2` — React reconciler for Three.js (supports React 19).
- **@react-three/drei** `^10.7.9` — Helpers (`PointerLockControls`, `Float`, `Text`, `Html`, `Sparkles`).
- **@react-three/rapier** `^2.2.0` — WebAssembly-based physics & collision engine.
- **Lucide-react** `^1.16.0` — Clean sci-fi icons for HUD.
- **Web Audio API** — Real-time synthesized spatial and event audio.

---

## 3. Chamber 101 3D Spatial Layout
The chamber is a 12m x 12m x 5m high-tech containment laboratory:
- **Center (0, 0, 0)**: Specimen Pedestal with amber induction beam and floating, rotating Brass Key #101.
- **North Wall (0, 2.5, -6)**: Heavy Monolithic Blast Door with hydraulic lock clamps, amber/emerald status display, and animated slide opening upon clearance.
- **East Wall (5.8, 1.8, 0)**: Wall-recessed Anomaly Terminal with amber CRT phosphors, glowing keys, and proximity prompt.
- **West Wall (-5.8, 1.8, 0)**: Observation Slate & Diagnostic Mechanism with readable lore on the deceptive rules.
- **Lighting**:
  - Warm overhead spotlight on pedestal.
  - Cyan perimeter floor LED conduits.
  - Directional amber warning pulse on blast door lock mechanism (shifts to emerald when Rule 1 is rewritten).
  - Ambient bounce light for high legibility and colorful sci-fi aesthetics.

---

## 4. Player Controller & Controls
- **Movement**: `W`, `A`, `S`, `D` with smooth acceleration and velocity clamping.
- **Sprint**: `Shift` (1.5x speed modifier).
- **Jump**: `Space` (impulse applied through Rapier physics body).
- **Look**: Mouse movement via `PointerLockControls`. Click canvas to engage pointer lock; `Escape` unlocks and opens Pause/Controls menu.
- **Interaction**:
  - `E` or `Left Click`: Primary interact (Collect key, activate terminal, attempt exit, toggle mechanism).
  - `R`: Inspect targeted object for atmospheric lore and clues.

---

## 5. Risk Assessment & Mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| React 19 + R3F compatibility | Low | Verified: R3F v9 + Drei v10 + Rapier v2 installed and typecheck passed cleanly with React 19. |
| Pointer lock user friction | Medium | Clear overlay with "CLICK TO ENTER CHAMBER" and visible `ESC to release` banner; pause menu handles unlock seamlessly. |
| Integrated GPU performance | Low | Procedural low-poly meshes, baked-style lighting without expensive dynamic cascaded shadow maps, bounded physics step rate. |
| Test suite breakage from 3D Canvas | Low | Decoupled architecture: Canvas is mocked or tested through DOM layers; pure unit tests verify engine and math. |
