# ROOM S A — Testing Strategy & Quality Assurance

---

## 1. Testing Philosophy

**ROOM S A** prioritizes deterministic correctness and confidence. Because the core game engine is written as a pure TypeScript state machine decoupled from React and the DOM, testing is partitioned into three clear tiers:

1. **Engine Unit Tests (Zero DOM)**: Instantaneous, isolated testing of state transitions, rule evaluations, and edge cases.
2. **Component & Integration Tests (jsdom + RTL)**: Testing user interactions, accessibility roles, visual feedback, and modal lifecycle.
3. **End-to-End Puzzle Verification**: Scripted walks through the complete room flow (inspect -> collect -> inspect door -> fail -> terminal rewrite -> succeed -> escape -> restart).

---

## 2. Test Matrix & Coverage Targets

| Test Category | Target Module | What is Verified |
| :--- | :--- | :--- |
| **Engine Initial State** | `src/game/engine` | Pristine state initialization, correct starting room, locked exit, default deceptive rules active. |
| **Action Validation** | `src/game/rules` | Rejecting invalid actions (e.g. collecting non-existent item, unlocking door without key or required rule). |
| **Inventory State** | `src/game/engine` | Immutability of inventory array; duplicate item prevention; item acquisition timestamps. |
| **Rule System** | `src/game/rules` | Predicate evaluation under varying active rules; rejection of malformed rule proposals. |
| **Exit & Victory** | `src/game/engine` | Transition to `'escaped'` status only when all predicates pass; timestamping victory event. |
| **Post-Victory Lock** | `src/game/engine` | Invariance enforcement: actions dispatched after `'escaped'` are ignored or rejected. |
| **Chamber Restart** | `src/game/engine` | State reset returns identical initial snapshot; cleans event log; resets terminal. |
| **Component Rendering** | `src/components/*` | Accessible roles, proper labeling, focus rings, keyboard navigation, clean unmounting. |
| **AI Proposal Sandbox**| `src/services/ai` | Malformed JSON handling, out-of-bounds rule rejection, client schema enforcement. |

---

## 3. Engine Unit Testing Example Pattern

```typescript
// Conceptual pattern for Milestone 1 engine tests:
import { describe, it, expect } from 'vitest';
import { createInitialGameState, engineReducer } from '@/game/engine';

describe('Chamber 101 Engine Reducer', () => {
  it('rejects door unlock while deceptive RULE_01 is active', () => {
    let state = createInitialGameState();
    
    // Player collects the brass key
    state = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' }
    }).nextState;

    // Player attempts to unlock door (fails because RULE_01 demands copper)
    const result = engineReducer(state, { type: 'ATTEMPT_EXIT' });
    expect(result.success).toBe(false);
    expect(result.nextState.status).toBe('playing');
    expect(result.message).toMatch(/rejected.*copper/i);
  });

  it('allows exit after rewriting rule at the terminal', () => {
    let state = createInitialGameState();
    
    // Collect key
    state = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' }
    }).nextState;

    // Rewrite rule to accept brass
    state = engineReducer(state, {
      type: 'APPLY_VALIDATED_RULE',
      payload: {
        proposal: {
          targetRuleId: 'RULE_01',
          proposedStatement: 'Doors yield to brass keys.',
          newPredicateKey: 'RULE_ACCEPT_BRASS_KEY'
        }
      }
    }).nextState;

    // Attempt exit now succeeds
    const result = engineReducer(state, { type: 'ATTEMPT_EXIT' });
    expect(result.success).toBe(true);
    expect(result.nextState.status).toBe('escaped');
  });
});
```

---

## 4. Development & Verification Commands

All commands are run from the project root directory (`c:\Users\Vanih\room sa\room-s-a`):

### Development Server
Starts the local development server with instant HMR:
```powershell
npm run dev
```

### Unit & Component Testing
Runs all Vitest suites in single-run mode:
```powershell
npm test
```

### Continuous Test Watch Mode
Runs Vitest with interactive file-watching:
```powershell
npm run test:watch
```

### Static Type Checking
Executes TypeScript compiler without emitting JS to ensure strict type compliance:
```powershell
npm run typecheck
```

### Code Linting
Lints the entire codebase against ESLint 9 rules:
```powershell
npm run lint
```

### Production Build
Type checks and bundles the application with Rollup/Vite:
```powershell
npm run build
```
