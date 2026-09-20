export type DeviceStatus = "online" | "offline" | "maintenance" | "disabled";
export type MpptProtocol = "modbus_rtu_rs485";
export type CloudTransport = "https_rest" | "mqtt_future";

export interface CustomerAccount {
  id: string;
  name: string;
  status: "active" | "paused";
  userCount: number;
}

export interface Installation {
  id: string;
  customerId: string;
  name: string;
  address: string;
  timeZone: string;
}

export interface AdminDevice {
  id: string;
  name: string;
  deviceCode: string;
  deviceType: string;
  deviceModel: string;
  hardwareVersion: string;
  firmwareVersion: string;
  customerId: string;
  installationId: string;
  installationDate: string;
  locationAddress: string;
  latitude: number | null;
  longitude: number | null;
  timeZone: string;
  description: string;
  uploadIntervalMinutes: number;
  status: DeviceStatus;
  tags: string[];
  mpptProtocol: MpptProtocol;
  cloudTransport: CloudTransport;
  lastConnectedAt: string | null;
}

export const deviceStatusOptions: Array<{ value: DeviceStatus; label: string }> = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "maintenance", label: "Maintenance" },
  { value: "disabled", label: "Disabled" }
];

export const mpptProtocolOptions: Array<{ value: MpptProtocol; label: string }> = [
  { value: "modbus_rtu_rs485", label: "Modbus RTU over RS485" }
];

export const cloudTransportOptions: Array<{
  value: CloudTransport;
  label: string;
  disabled?: boolean;
}> = [
  { value: "https_rest", label: "HTTPS/REST" },
  { value: "mqtt_future", label: "MQTT (future option)", disabled: true }
];

export function deviceStatusLabel(status: DeviceStatus): string {
  return deviceStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function customerName(customers: CustomerAccount[], customerId: string): string {
  return customers.find((customer) => customer.id === customerId)?.name ?? "Unassigned customer";
}

export function installationName(installations: Installation[], installationId: string): string {
  return installations.find((installation) => installation.id === installationId)?.name ?? "Unassigned installation";
}
