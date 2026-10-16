/**
 * ROOM S A — Audio Facade & Backward-Compatible Audio Exports
 * Delegates to centralized soundManager to prevent lag and duplicate contexts.
 */
import { soundManager } from './soundManager';

export { soundManager } from './soundManager';
export type { AudioSettings } from './soundManager';

export function isMuted(): boolean {
  return soundManager.isMuted();
}

export function setMuted(muted: boolean): void {
  soundManager.setSettings({ muted });
}

export function toggleMuted(): boolean {
  return soundManager.toggleMute();
}

export function playKeystrokeSound(): void {
  soundManager.playKeystroke();
}

export function playRealityShiftSound(): void {
  soundManager.playRealityShift();
}

export function playDoorUnlockSound(): void {
  soundManager.playDoorUnlock();
}

export function playDoorLockedSound(): void {
  soundManager.playDoorLocked();
}

export function playSuccessChime(): void {
  soundManager.playObjectiveComplete();
}

export function playFailureBuzz(): void {
  soundManager.playDoorLocked();
}

export function playFootstepSound(): void {
  soundManager.playFootstep();
}

export function playHoverCue(targetId?: string): void {
  soundManager.playHoverCue(targetId);
}

export function playPickupSound(): void {
  soundManager.playPickup();
}

export function playDropSound(): void {
  soundManager.playDrop();
}

export function playChamberWinSound(): void {
  soundManager.playChamberWin();
}
