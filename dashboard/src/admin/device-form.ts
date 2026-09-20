import type { AdminDevice, CloudTransport, DeviceStatus, MpptProtocol } from "./device-models";

export interface DeviceFormValues {
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
  latitude: string;
  longitude: string;
  timeZone: string;
  description: string;
  uploadIntervalMinutes: string;
  status: DeviceStatus;
  tags: string;
  mpptProtocol: MpptProtocol;
  cloudTransport: CloudTransport;
}

export type DeviceFormErrors = Partial<Record<keyof DeviceFormValues, string>>;

export function createBlankDeviceFormValues(
  customerId: string,
  installationId: string,
  timeZone = "Europe/London"
): DeviceFormValues {
  return {
    name: "",
    deviceCode: "",
    deviceType: "MPPT solar charge controller gateway",
    deviceModel: "",
    hardwareVersion: "",
    firmwareVersion: "",
    customerId,
    installationId,
    installationDate: new Date().toISOString().slice(0, 10),
    locationAddress: "",
    latitude: "",
    longitude: "",
    timeZone,
    description: "",
    uploadIntervalMinutes: "30",
    status: "offline",
    tags: "",
    mpptProtocol: "modbus_rtu_rs485",
    cloudTransport: "https_rest"
  };
}

export function deviceToFormValues(device: AdminDevice): DeviceFormValues {
  return {
    name: device.name,
    deviceCode: device.deviceCode,
    deviceType: device.deviceType,
    deviceModel: device.deviceModel,
    hardwareVersion: device.hardwareVersion,
    firmwareVersion: device.firmwareVersion,
    customerId: device.customerId,
    installationId: device.installationId,
    installationDate: device.installationDate,
    locationAddress: device.locationAddress,
    latitude: device.latitude == null ? "" : String(device.latitude),
    longitude: device.longitude == null ? "" : String(device.longitude),
    timeZone: device.timeZone,
    description: device.description,
    uploadIntervalMinutes: String(device.uploadIntervalMinutes),
    status: device.status,
    tags: device.tags.join(", "),
    mpptProtocol: device.mpptProtocol,
    cloudTransport: device.cloudTransport
  };
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function validateDeviceForm(values: DeviceFormValues): DeviceFormErrors {
  const errors: DeviceFormErrors = {};
  const required: Array<keyof DeviceFormValues> = [
    "name",
    "deviceCode",
    "deviceType",
    "deviceModel",
    "customerId",
    "installationId",
    "installationDate",
    "locationAddress",
    "timeZone",
    "uploadIntervalMinutes"
  ];

  for (const field of required) {
    if (!String(values[field]).trim()) errors[field] = "Required";
  }

  if (values.deviceCode && !/^[a-zA-Z0-9_-]+$/.test(values.deviceCode)) {
    errors.deviceCode = "Use letters, numbers, hyphens or underscores";
  }

  const uploadInterval = Number(values.uploadIntervalMinutes);
  if (!Number.isFinite(uploadInterval) || uploadInterval < 1 || uploadInterval > 1440) {
    errors.uploadIntervalMinutes = "Use 1 to 1440 minutes";
  }

  const latitude = values.latitude.trim() ? Number(values.latitude) : null;
  if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    errors.latitude = "Use -90 to 90";
  }

  const longitude = values.longitude.trim() ? Number(values.longitude) : null;
  if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    errors.longitude = "Use -180 to 180";
  }

  if (values.installationDate && Number.isNaN(new Date(values.installationDate).valueOf())) {
    errors.installationDate = "Use a valid date";
  }

  return errors;
}

export function hasDeviceFormErrors(errors: DeviceFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formValuesToDevice(
  values: DeviceFormValues,
  id: string,
  existing?: AdminDevice
): AdminDevice {
  return {
    id,
    name: values.name.trim(),
    deviceCode: values.deviceCode.trim(),
    deviceType: values.deviceType.trim(),
    deviceModel: values.deviceModel.trim(),
    hardwareVersion: values.hardwareVersion.trim(),
    firmwareVersion: values.firmwareVersion.trim(),
    customerId: values.customerId,
    installationId: values.installationId,
    installationDate: values.installationDate,
    locationAddress: values.locationAddress.trim(),
    latitude: values.latitude.trim() ? Number(values.latitude) : null,
    longitude: values.longitude.trim() ? Number(values.longitude) : null,
    timeZone: values.timeZone.trim(),
    description: values.description.trim(),
    uploadIntervalMinutes: Number(values.uploadIntervalMinutes),
    status: values.status,
    tags: parseTags(values.tags),
    mpptProtocol: values.mpptProtocol,
    cloudTransport: values.cloudTransport,
    lastConnectedAt: existing?.lastConnectedAt ?? null
  };
}
