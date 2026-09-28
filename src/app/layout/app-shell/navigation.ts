import type { NavSection } from '../sidebar';

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'dashboard', path: '/', exact: true },
      { label: 'Cases', icon: 'clipboard', path: '/cases' },
      { label: 'Map', icon: 'map', path: '/map' },
    ],
  },
  {
    items: [{ label: 'Settings', icon: 'settings', path: '/settings' }],
  },
];
