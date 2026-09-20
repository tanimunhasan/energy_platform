import type { AdminDevice, CustomerAccount, Installation } from "../device-models";

interface AdminOverviewProps {
  customers: CustomerAccount[];
  installations: Installation[];
  devices: AdminDevice[];
}

function StatCard({
  label,
  value,
  detail,
  tone = "green"
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "green" | "amber" | "blue";
}) {
  return (
    <article className={`metric-card admin-stat ${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}

export function AdminOverview({ customers, installations, devices }: AdminOverviewProps) {
  const onlineDevices = devices.filter((device) => device.status === "online").length;
  const pausedCustomers = customers.filter((customer) => customer.status === "paused").length;
  const fiveMinuteUploaders = devices.filter((device) => device.uploadIntervalMinutes <= 5).length;

  return (
    <div className="admin-page">
      <section className="admin-mock-banner">
        <strong>Mocked Phase 1 data</strong>
        <span>Admin authentication, customers, installations and devices are local development fixtures.</span>
      </section>

      <section className="metrics-grid admin-metrics">
        <StatCard
          label="CUSTOMERS"
          value={String(customers.length)}
          detail={`${pausedCustomers} paused account${pausedCustomers === 1 ? "" : "s"}`}
          tone="green"
        />
        <StatCard
          label="INSTALLATIONS"
          value={String(installations.length)}
          detail="Assigned to mock customer organisations"
          tone="blue"
        />
        <StatCard
          label="DEVICES"
          value={String(devices.length)}
          detail={`${onlineDevices} currently marked online`}
          tone="amber"
        />
        <StatCard
          label="UPLOAD POLICY"
          value={String(fiveMinuteUploaders)}
          detail="Devices configured for five-minute uploads"
          tone="green"
        />
      </section>

      <section className="admin-overview-grid">
        <article className="panel admin-panel">
          <div className="panel-heading">
            <div>
              <span>OPERATIONS</span>
              <h2>Device fleet snapshot</h2>
            </div>
          </div>
          <div className="fleet-list">
            {devices.map((device) => (
              <div className="fleet-row" key={device.id}>
                <span className={`status-dot ${device.status}`} />
                <div>
                  <strong>{device.name}</strong>
                  <small>{device.deviceCode}</small>
                </div>
                <b>{device.uploadIntervalMinutes} min</b>
              </div>
            ))}
          </div>
        </article>

        <article className="panel admin-panel">
          <div className="panel-heading">
            <div>
              <span>PHASE 1 SCOPE</span>
              <h2>Administration foundation</h2>
            </div>
          </div>
          <div className="phase-list">
            <p>Protected admin routes</p>
            <p>Development role switching</p>
            <p>Device list and add/edit workflow</p>
            <p>Future credentials, ingestion and CSV reporting routes reserved</p>
          </div>
        </article>
      </section>
    </div>
  );
}
