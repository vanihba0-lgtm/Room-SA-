/**
 * ROOM S A — Campaign Progression & Save System
 * Deterministically manages the 6-chamber campaign progression with localStorage persistence.
 */
import { CampaignSaveData } from './types';

export interface ChamberMetadata {
  readonly id: string;
  readonly number: number;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly coreConcept: string;
  readonly isImplemented: boolean;
}

export const CAMPAIGN_CHAMBERS: readonly ChamberMetadata[] = [
  {
    id: 'chamber_101',
    number: 1,
    name: 'The Obvious Lie',
    subtitle: 'Rule Verification & Deception Mechanics',
    description: 'A sealed containment cell where official simulation rules forbid your only key.',
    coreConcept: 'Question authoritative assertions. Examine physical sensors vs written rules.',
    isImplemented: true,
  },
  {
    id: 'chamber_102',
    number: 2,
    name: 'The Signal Foundry',
    subtitle: 'Mass Induction & Signal Resonance',
    description: 'An electromagnetic foundry with dual load cells and deceptive calibration labels.',
    coreConcept: 'Correlate physical weight constraints with tuned harmonic frequency channels.',
    isImplemented: true,
  },
  {
    id: 'chamber_103',
    number: 3,
    name: 'The Gravity Archive',
    subtitle: 'Buoyancy Inversion & Deck Clamps',
    description: 'A subterranean data repository where magnetic aerogel is pinned by artificial gravity.',
    coreConcept: 'Test mass versus magnetic polarity to elevate the archival core.',
    isImplemented: true,
  },
  {
    id: 'chamber_104',
    number: 4,
    name: 'The Zero-Day Vault',
    subtitle: 'Access-Control Logic & Checksums',
    description: 'A high-security cryptographic vault enforcing expired root clearance credentials.',
    coreConcept: 'Expose stale permissions in the telemetry matrix and elevate guest tokens.',
    isImplemented: true,
  },
  {
    id: 'chamber_105',
    number: 5,
    name: 'The Causality Engine',
    subtitle: 'State Machines & Temporal Inversion',
    description: 'A quantum reactor where the official linear event sequence is chronologically impossible.',
    coreConcept: 'Reconstruct state transitions from telemetry timestamps, not the written manual.',
    isImplemented: true,
  },
  {
    id: 'chamber_106',
    number: 6,
    name: 'The Rule Engine',
    subtitle: 'The Grand Finale — Dissolve the Simulation',
    description: 'The central core of the Architect\'s recursive diagnostic loop.',
    coreConcept: 'Synthesize all learned principles to rewrite the Prime Axiom and liberate reality.',
    isImplemented: true,
  },
];

const CAMPAIGN_STORAGE_KEY = 'room_sa_campaign_save_v1';

export function getInitialCampaignSave(): CampaignSaveData {
  return {
    unlockedChambers: ['chamber_101'],
    completedChambers: [],
    currentChamberId: 'chamber_101',
    tutorialCompleted: false,
    discoveredLogIds: ['log_c101_audit'],
    lastPlayedAt: Date.now(),
  };
}

export function loadCampaignSave(): CampaignSaveData {
  if (typeof window === 'undefined') return getInitialCampaignSave();
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return getInitialCampaignSave();
    const parsed = JSON.parse(raw);
    return {
      unlockedChambers: Array.isArray(parsed.unlockedChambers) ? parsed.unlockedChambers : ['chamber_101'],
      completedChambers: Array.isArray(parsed.completedChambers) ? parsed.completedChambers : [],
      currentChamberId: typeof parsed.currentChamberId === 'string' ? parsed.currentChamberId : 'chamber_101',
      tutorialCompleted: Boolean(parsed.tutorialCompleted),
      discoveredLogIds: Array.isArray(parsed.discoveredLogIds) ? parsed.discoveredLogIds : ['log_c101_audit'],
      lastPlayedAt: Number(parsed.lastPlayedAt) || Date.now(),
    };
  } catch {
    return getInitialCampaignSave();
  }
}

export function saveCampaignProgress(save: CampaignSaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Ignore sandboxed environments
  }
}

export function markChamberCompleted(
  saveOrChamberId: CampaignSaveData | string,
  maybeChamberId?: string
): CampaignSaveData {
  let save: CampaignSaveData;
  let chamberId: string;
  if (typeof saveOrChamberId === 'string') {
    save = loadCampaignSave();
    chamberId = saveOrChamberId;
  } else {
    save = saveOrChamberId;
    chamberId = maybeChamberId!;
  }

  const completed = save.completedChambers.includes(chamberId)
    ? save.completedChambers
    : [...save.completedChambers, chamberId];

  // Determine next chamber to unlock
  const chamberIndex = CAMPAIGN_CHAMBERS.findIndex((c) => c.id === chamberId);
  const nextChamber = CAMPAIGN_CHAMBERS[chamberIndex + 1];

  let unlocked = [...save.unlockedChambers];
  if (nextChamber && !unlocked.includes(nextChamber.id)) {
    unlocked.push(nextChamber.id);
  }

  const updated: CampaignSaveData = {
    ...save,
    completedChambers: completed,
    unlockedChambers: unlocked,
    lastPlayedAt: Date.now(),
  };

  saveCampaignProgress(updated);
  return updated;
}

export function hasCompletedIntro(): boolean {
  return loadCampaignSave().tutorialCompleted;
}

export function markIntroCompleted(): void {
  const save = loadCampaignSave();
  saveCampaignProgress({ ...save, tutorialCompleted: true });
}

export function recordLogDiscovered(save: CampaignSaveData, logId: string): CampaignSaveData {
  if (save.discoveredLogIds.includes(logId)) return save;
  const updated: CampaignSaveData = {
    ...save,
    discoveredLogIds: [...save.discoveredLogIds, logId],
    lastPlayedAt: Date.now(),
  };
  saveCampaignProgress(updated);
  return updated;
}

