import { useMemo, useState } from "react";
import { DevAuthProvider, canAccessAdminRoute, roleLabel, useDevAuth } from "./auth";
import {
  createBlankDeviceFormValues,
  deviceToFormValues,
  formValuesToDevice,
  type DeviceFormValues
} from "./device-form";
import type { AdminDevice } from "./device-models";
import { mockCustomers, mockDevices, mockInstallations } from "./mock-data";
import {
  getActiveAdminSection,
  parseAdminPath,
  type AdminRoute,
  type AdminSection
} from "./routes";
import { AdminLayout } from "./components/AdminLayout";
import { AdminOverview } from "./components/AdminOverview";
import { DeviceForm } from "./components/DeviceForm";
import { DeviceList } from "./components/DeviceList";

interface AdminAppProps {
  pathname: string;
  navigate: (path: string) => void;
}

function nextDeviceId(deviceCode: string): string {
  const suffix = deviceCode.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "device";
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `device-${suffix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `device-${suffix}-${Date.now()}`;
}

function PlaceholderPage({ title, section }: { title: string; section: AdminSection }) {
  return (
    <div className="admin-page">
      <section className="panel admin-panel placeholder-panel">
        <span>PHASE 2 RESERVED ROUTE</span>
        <h2>{title}</h2>
        <p>
          The protected route and navigation entry are in place. Persistent data,
          permissions and workflows for {section.replace("-", " ")} are deferred.
        </p>
      </section>
    </div>
  );
}

function ProtectedNotice({ route }: { route: AdminRoute }) {
  return (
    <div className="admin-page">
      <section className="panel admin-panel protected-panel">
        <span>PROTECTED ROUTE</span>
        <h2>Access restricted</h2>
        <p>
          The current development role cannot open this admin area. Device identities
          are API-only and customer viewers are limited to dashboard/report access.
        </p>
        <small>Route: {route.kind === "unknown" ? route.path : route.kind}</small>
      </section>
    </div>
  );
}

function UnknownPage() {
  return (
    <div className="admin-page">
      <section className="panel admin-panel protected-panel">
        <span>ADMIN ROUTE</span>
        <h2>Page not found</h2>
        <p>This admin route has not been defined.</p>
      </section>
    </div>
  );
}

function AdminPortalContent({ pathname, navigate }: AdminAppProps) {
  const { user, setRole } = useDevAuth();
  const [devices, setDevices] = useState<AdminDevice[]>(mockDevices);
  const [flash, setFlash] = useState<string | undefined>();

  const route = useMemo(() => parseAdminPath(pathname), [pathname]);
  const activeSection = getActiveAdminSection(route);
  const allowed = canAccessAdminRoute(user.role, route);

  function deviceCodeInUse(currentDeviceId: string | undefined) {
    return (deviceCode: string) => {
      const normalized = deviceCode.trim().toLowerCase();
      return devices.some((device) =>
        device.id !== currentDeviceId && device.deviceCode.toLowerCase() === normalized
      );
    };
  }

  function saveDevice(mode: "create" | "edit", currentDevice: AdminDevice | undefined, values: DeviceFormValues) {
    const id = currentDevice?.id ?? nextDeviceId(values.deviceCode);
    const nextDevice = formValuesToDevice(values, id, currentDevice);
    setDevices((current) => {
      if (mode === "edit") return current.map((device) => device.id === id ? nextDevice : device);
      return [nextDevice, ...current];
    });
    setFlash(`${nextDevice.name} ${mode === "edit" ? "updated" : "created"} in mock device registry.`);
    navigate("/admin/devices");
  }

  function renderContent() {
    if (!allowed) return <ProtectedNotice route={route} />;
    if (route.kind === "unknown") return <UnknownPage />;

    if (route.kind === "device-new") {
      const firstCustomer = mockCustomers[0];
      const firstInstallation = mockInstallations.find((installation) => installation.customerId === firstCustomer.id);
      return (
        <DeviceForm
          key="new-device"
          mode="create"
          initialValues={createBlankDeviceFormValues(
            firstCustomer.id,
            firstInstallation?.id ?? "",
            firstInstallation?.timeZone
          )}
          customers={mockCustomers}
          installations={mockInstallations}
          deviceCodeInUse={deviceCodeInUse(undefined)}
          onCancel={() => navigate("/admin/devices")}
          onSubmit={(values) => saveDevice("create", undefined, values)}
        />
      );
    }

    if (route.kind === "device-edit") {
      const device = devices.find((item) => item.id === route.deviceId);
      if (!device) return <UnknownPage />;
      return (
        <DeviceForm
          key={device.id}
          mode="edit"
          initialValues={deviceToFormValues(device)}
          customers={mockCustomers}
          installations={mockInstallations}
          deviceCodeInUse={deviceCodeInUse(device.id)}
          onCancel={() => navigate("/admin/devices")}
          onSubmit={(values) => saveDevice("edit", device, values)}
        />
      );
    }

    if (route.section === "overview") {
      return <AdminOverview customers={mockCustomers} installations={mockInstallations} devices={devices} />;
    }

    if (route.section === "devices") {
      return (
        <DeviceList
          devices={devices}
          customers={mockCustomers}
          installations={mockInstallations}
          flash={flash}
          onNavigate={(path) => {
            setFlash(undefined);
            navigate(path);
          }}
        />
      );
    }

    const title = {
      customers: "Customers",
      installations: "Installations",
      users: "Users",
      reports: "Reports",
      alerts: "Alerts",
      "audit-log": "Audit log",
      settings: "Platform settings"
    }[route.section];

    return <PlaceholderPage title={title} section={route.section} />;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      user={user}
      onRoleChange={setRole}
      onNavigate={(path) => {
        setFlash(undefined);
        navigate(path);
      }}
    >
      <div className="admin-context-line">
        <span>Development authentication</span>
        <strong>{roleLabel(user.role)}</strong>
        <small>Mocked user and tenant scope</small>
      </div>
      {renderContent()}
    </AdminLayout>
  );
}

export default function AdminApp(props: AdminAppProps) {
  return (
    <DevAuthProvider>
      <AdminPortalContent {...props} />
    </DevAuthProvider>
  );
}
