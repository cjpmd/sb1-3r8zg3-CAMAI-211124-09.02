import {
  User,
  Upload,
  Image,
  Video,
  Settings,
  LogOut,
  Instagram,
  Facebook,
  Youtube,
  Share,
  CreditCard,
  Check,
  X,
  Loader2,
  Zap,
  LogOut as LogOutIcon,
  Camera,
  Share2,
  Edit,
  Link,
  BarChart2,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Bell,
  Calendar,
  Clock,
  Search,
  Trash,
  Download,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const Icons = {
  user: User,
  upload: Upload,
  image: Image,
  video: Video,
  settings: Settings,
  logout: LogOutIcon,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  creditCard: CreditCard,
  check: Check,
  x: X,
  spinner: Loader2,
  zap: Zap,
  logOut: LogOutIcon,
  link: Link,
  chart: BarChart2,
  post: Send,
  plus: Plus,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  menu: Menu,
  moon: Moon,
  sun: Sun,
  bell: Bell,
  calendar: Calendar,
  clock: Clock,
  search: Search,
  trash: Trash,
  download: Download,
  externalLink: ExternalLink,
  refresh: RefreshCw,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  camera: Camera,
  share: Share,
  share2: Share2,
  edit: Edit,
  tiktok: (props: any) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.8218 0H12.9469V16.2795C12.9469 18.4889 11.1584 20.2774 8.94898 20.2774C6.73959 20.2774 4.95105 18.4889 4.95105 16.2795C4.95105 14.0991 6.70874 12.3396 8.85644 12.2814V8.34577C4.53827 8.40402 1 11.9733 1 16.2795C1 20.6147 4.61372 24 8.94898 24C13.2842 24 16.8979 20.6147 16.8979 16.2795V7.95203C18.6нн 9.21246 20.7783 9.96021 23 9.99106V6.05543C19.7614 5.93703 16.8218 3.24695 16.8218 0Z"
        fill="currentColor"
      />
    </svg>
  ),
} as const;
