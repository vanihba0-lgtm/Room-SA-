import { GameState, GameAction, ActionResult } from '../types';
import { engineReducer } from './reducer';
import { createChamber101InitialState } from '../puzzles/chamber101';

export type StateListener = (state: GameState) => void;

export class GameEngineStore {
  private state: GameState;
  private listeners: Set<StateListener> = new Set();

  constructor(initialState?: GameState) {
    this.state = initialState ?? createChamber101InitialState();
  }

  public getState(): GameState {
    return this.state;
  }

  public dispatch(action: GameAction): ActionResult {
    const result = engineReducer(this.state, action);
    if (result.nextState !== this.state) {
      this.state = result.nextState;
      this.notify();
    }
    return result;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

/**
 * Singleton engine store instance for the active session
 */
export const gameStore = new GameEngineStore();
