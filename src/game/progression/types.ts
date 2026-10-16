/**
 * ROOM S A — Campaign, Objectives, Hints & Story Domain Types
 */
import { GameState } from '../types';

export type ObjectiveState = 'locked' | 'active' | 'completed';

export interface ChamberObjective {
  readonly id: string;
  readonly chamberId: string;
  readonly title: string;
  readonly description: string;
  readonly whyItMatters: string;
  readonly hints: readonly [string, string, string]; // [Nudge, Correlation, Solution]
  readonly isCompleted: (state: GameState) => boolean;
}

export interface LogbookEntry {
  readonly id: string;
  readonly chamberId: string;
  readonly title: string;
  readonly author: 'Diagnostic System' | 'Investigator Log' | 'The Architect' | 'Maintenance Advisory';
  readonly timestamp: string;
  readonly content: string;
  readonly tag: 'EVIDENCE' | 'ANOMALY' | 'ADVISORY' | 'DIRECTIVE';
}

export interface CampaignSaveData {
  readonly unlockedChambers: readonly string[];
  readonly completedChambers: readonly string[];
  readonly currentChamberId: string;
  readonly tutorialCompleted: boolean;
  readonly discoveredLogIds: readonly string[];
  readonly lastPlayedAt: number;
}
