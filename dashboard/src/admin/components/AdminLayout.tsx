import type { ReactNode } from "react";
import { accessRoles, roleLabel, type AccessRole, type DevUser } from "../auth";
import { adminNavItems, type AdminSection } from "../routes";

interface AdminLayoutProps {
  activeSection: AdminSection;
  user: DevUser;
  onRoleChange: (role: AccessRole) => void;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

export function AdminLayout({
  activeSection,
  user,
  onRoleChange,
  onNavigate,
  children
}: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}>
          <span>S</span>
          <div>
            <strong>Solara</strong>
            <small>Administration</small>
          </div>
        </a>

        <nav className="admin-nav" aria-label="Administration">
          {adminNavItems.map((item) => (
            <a
              key={item.section}
              className={item.section === activeSection ? "active" : ""}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">SOLARA ADMIN PORTAL</p>
            <h1>{adminNavItems.find((item) => item.section === activeSection)?.label}</h1>
          </div>

          <div className="dev-auth-card" aria-label="Development authentication">
            <span>DEV AUTH</span>
            <strong>{user.name}</strong>
            <small>{user.organisation}</small>
            <select
              value={user.role}
              onChange={(event) => onRoleChange(event.target.value as AccessRole)}
            >
              {accessRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
