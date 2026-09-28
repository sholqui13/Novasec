import type { CaseStatus } from '@core/models';

export type CasePriority = 'high' | 'medium' | 'low';

// Porcentaje sobre la imagen del mapa demostrativo (0–100).
export interface MapPosition {
  readonly x: number;
  readonly y: number;
}

export interface CaseAssignee {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface Case {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly status: CaseStatus;
  readonly priority: CasePriority;
  readonly location: string;
  readonly reportedAt: string;
  readonly assignee?: CaseAssignee;
  readonly mapPosition?: MapPosition;
}
