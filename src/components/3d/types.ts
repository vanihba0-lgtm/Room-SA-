import { Vector3 } from 'three';

export interface InteractiveTarget {
  readonly id: string;
  readonly name: string;
  readonly actionText: string;
  readonly inspectText: string;
  readonly position: [number, number, number];
  readonly interactionDistance?: number;
}

export interface PlayerControlsState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
}

export interface CameraLookTarget {
  point: Vector3;
  targetId: string;
  distance: number;
}
