import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import type { AdminRoute, AdminSection } from "./routes";

export type AccessRole =
  | "super_admin"
  | "customer_admin"
  | "customer_viewer"
  | "device";

export interface DevUser {
  id: string;
  name: string;
  email: string;
  organisation: string;
  role: AccessRole;
}

interface DevAuthContextValue {
  user: DevUser;
  setRole: (role: AccessRole) => void;
}

export const accessRoles: AccessRole[] = [
  "super_admin",
  "customer_admin",
  "customer_viewer",
  "device"
];

const roleLabels: Record<AccessRole, string> = {
  super_admin: "Super Admin",
  customer_admin: "Customer Admin",
  customer_viewer: "Customer Viewer",
  device: "Device"
};

const storageKey = "solara.dev-auth.role";

const DevAuthContext = createContext<DevAuthContextValue | null>(null);

export function roleLabel(role: AccessRole): string {
  return roleLabels[role];
}

export function isAccessRole(value: string | null): value is AccessRole {
  return !!value && accessRoles.includes(value as AccessRole);
}

export function canAccessAdminSection(role: AccessRole, section: AdminSection): boolean {
  if (role === "super_admin") return true;
  if (role === "customer_admin") return section !== "settings";
  if (role === "customer_viewer") return section === "overview" || section === "reports";
  return false;
}

export function canAccessAdminRoute(role: AccessRole, route: AdminRoute): boolean {
  if (route.kind === "unknown") return role !== "device";
  if (route.kind === "device-new" || route.kind === "device-edit") {
    return role === "super_admin" || role === "customer_admin";
  }
  return canAccessAdminSection(role, route.section);
}

function buildDevUser(role: AccessRole): DevUser {
  if (role === "super_admin") {
    return {
      id: "dev-super-admin",
      name: "Sayed Tan",
      email: "admin@solara.local",
      organisation: "Solara Platform",
      role
    };
  }

  if (role === "device") {
    return {
      id: "dev-device",
      name: "Hawick MPPT Logger",
      email: "mppt-hawick-001@devices.solara.local",
      organisation: "API identity",
      role
    };
  }

  return {
    id: `dev-${role}`,
    name: role === "customer_admin" ? "Hawick Admin" : "Hawick Viewer",
    email: role === "customer_admin" ? "manager@hawick.local" : "viewer@hawick.local",
    organisation: "Hawick Solar Energy",
    role
  };
}

function initialRole(): AccessRole {
  if (typeof window === "undefined") return "super_admin";
  const stored = window.localStorage.getItem(storageKey);
  return isAccessRole(stored) ? stored : "super_admin";
}

export function DevAuthProvider({ children }: { children: ReactNode }) {
  const [role, setCurrentRole] = useState<AccessRole>(initialRole);

  const value = useMemo<DevAuthContextValue>(() => {
    return {
      user: buildDevUser(role),
      setRole(nextRole) {
        setCurrentRole(nextRole);
        window.localStorage.setItem(storageKey, nextRole);
      }
    };
  }, [role]);

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
}

export function useDevAuth(): DevAuthContextValue {
  const context = useContext(DevAuthContext);
  if (!context) throw new Error("useDevAuth must be used inside DevAuthProvider");
  return context;
}
