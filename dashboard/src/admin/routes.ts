export type AdminSection =
  | "overview"
  | "customers"
  | "installations"
  | "devices"
  | "users"
  | "reports"
  | "alerts"
  | "audit-log"
  | "settings";

export type AdminRoute =
  | { kind: "section"; section: AdminSection }
  | { kind: "device-new" }
  | { kind: "device-edit"; deviceId: string }
  | { kind: "unknown"; path: string };

export interface AdminNavItem {
  section: AdminSection;
  label: string;
  href: string;
}

export const adminNavItems: AdminNavItem[] = [
  { section: "overview", label: "Admin overview", href: "/admin" },
  { section: "customers", label: "Customers", href: "/admin/customers" },
  { section: "installations", label: "Installations", href: "/admin/installations" },
  { section: "devices", label: "Devices", href: "/admin/devices" },
  { section: "users", label: "Users", href: "/admin/users" },
  { section: "reports", label: "Reports", href: "/admin/reports" },
  { section: "alerts", label: "Alerts", href: "/admin/alerts" },
  { section: "audit-log", label: "Audit log", href: "/admin/audit-log" },
  { section: "settings", label: "Platform settings", href: "/admin/settings" }
];

const adminSections = new Set(adminNavItems.map((item) => item.section));

export function getActiveAdminSection(route: AdminRoute): AdminSection {
  if (route.kind === "section") return route.section;
  if (route.kind === "device-new" || route.kind === "device-edit") return "devices";
  return "overview";
}

export function parseAdminPath(pathname: string): AdminRoute {
  const trimmed = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  const path = trimmed || "/admin";
  const parts = path.split("/").filter(Boolean);

  if (parts[0] !== "admin") return { kind: "unknown", path: pathname };
  if (parts.length === 1) return { kind: "section", section: "overview" };

  const section = parts[1] as AdminSection;
  if (section === "overview" && parts.length === 2) {
    return { kind: "section", section: "overview" };
  }

  if (section === "devices") {
    if (parts.length === 2) return { kind: "section", section: "devices" };
    if (parts[2] === "new" && parts.length === 3) return { kind: "device-new" };
    if (parts[2] && parts[3] === "edit" && parts.length === 4) {
      return { kind: "device-edit", deviceId: decodeURIComponent(parts[2]) };
    }
  }

  if (adminSections.has(section) && parts.length === 2) {
    return { kind: "section", section };
  }

  return { kind: "unknown", path: pathname };
}
