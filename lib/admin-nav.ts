import {
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  Newspaper,
  PanelBottom,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/startseite", label: "Startseite", icon: Home },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/termine", label: "Termine", icon: Calendar },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/landschaft", label: "Landschaft", icon: Layers },
  { href: "/admin/grundlagen", label: "Grundlagen", icon: BookOpen },
  { href: "/admin/fragen", label: "Fragen", icon: HelpCircle },
  { href: "/admin/seiten", label: "Seiten", icon: FileText },
  { href: "/admin/medien", label: "Medien", icon: ImageIcon },
  { href: "/admin/footer", label: "Footer", icon: PanelBottom },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
];
