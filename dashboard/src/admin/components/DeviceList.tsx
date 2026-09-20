import {
  customerName,
  deviceStatusLabel,
  installationName,
  type AdminDevice,
  type CustomerAccount,
  type Installation
} from "../device-models";

interface DeviceListProps {
  devices: AdminDevice[];
  customers: CustomerAccount[];
  installations: Installation[];
  flash?: string;
  onNavigate: (path: string) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function DeviceList({
  devices,
  customers,
  installations,
  flash,
  onNavigate
}: DeviceListProps) {
  return (
    <div className="admin-page">
      {flash && <div className="admin-flash">{flash}</div>}

      <section className="panel admin-panel">
        <div className="admin-section-heading">
          <div>
            <span>MOCK DEVICE REGISTRY</span>
            <h2>Devices</h2>
          </div>
          <button className="admin-primary-button" type="button" onClick={() => onNavigate("/admin/devices/new")}>
            + Add device
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Owner</th>
                <th>Installation</th>
                <th>Status</th>
                <th>Protocol</th>
                <th>Transport</th>
                <th>Last connected</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>
                    <strong>{device.name}</strong>
                    <small>{device.deviceCode}</small>
                    <div className="tag-row">
                      {device.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  </td>
                  <td>{customerName(customers, device.customerId)}</td>
                  <td>{installationName(installations, device.installationId)}</td>
                  <td>
                    <span className="table-status">
                      <i className={`status-dot ${device.status}`} />
                      {deviceStatusLabel(device.status)}
                    </span>
                  </td>
                  <td>Modbus RTU / RS485</td>
                  <td>{device.cloudTransport === "https_rest" ? "HTTPS/REST" : "MQTT"}</td>
                  <td>{formatDate(device.lastConnectedAt)}</td>
                  <td>
                    <button
                      className="admin-ghost-button"
                      type="button"
                      onClick={() => onNavigate(`/admin/devices/${encodeURIComponent(device.id)}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
