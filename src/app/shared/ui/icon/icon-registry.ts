import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clipboard,
  Clock,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Funnel,
  Info,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Map as MapIcon,
  MapPin,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TriangleAlert,
  User,
  X,
  type LucideIconData,
} from 'lucide-angular';

const Exclamation: LucideIconData = [
  ['path', { d: 'M12 7v6' }],
  ['path', { d: 'M12 17h.01' }],
];

export const NVS_ICONS = {
  // Navigation
  dashboard: LayoutDashboard,
  cases: FolderOpen,
  map: MapIcon,
  'map-pin': MapPin,
  notifications: Bell,
  user: User,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,

  // Actions
  plus: Plus,
  search: Search,
  edit: Pencil,
  delete: Trash2,
  close: X,
  eye: Eye,
  'eye-off': EyeOff,
  filter: Funnel,
  refresh: RefreshCw,
  download: Download,

  // Feedback
  check: Check,
  'check-circle': CircleCheck,
  'alert-circle': CircleAlert,
  'alert-triangle': TriangleAlert,
  'x-circle': CircleX,
  clipboard: Clipboard,
  clock: Clock,
  info: Info,
  exclamation: Exclamation,
  loader: LoaderCircle,
} as const satisfies Record<string, LucideIconData>;

export type IconName = keyof typeof NVS_ICONS;

export const ICON_NAMES = Object.keys(NVS_ICONS) as readonly IconName[];
