import type { IconName } from '@shared/ui/icon';

export type SidebarTheme = 'dark' | 'light';

export interface NavItem {
  readonly label: string;
  readonly icon: IconName;
  readonly path: string;
  readonly exact?: boolean;
  readonly badge?: number;
}

export interface NavSection {
  readonly label?: string;
  readonly items: readonly NavItem[];
}
