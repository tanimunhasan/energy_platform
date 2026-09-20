import type { AdminDevice, CustomerAccount, Installation } from "./device-models";

export const mockCustomers: CustomerAccount[] = [
  {
    id: "customer-hawick",
    name: "Hawick Solar Energy",
    status: "active",
    userCount: 4
  },
  {
    id: "customer-north-ridge",
    name: "North Ridge Microgrid",
    status: "active",
    userCount: 7
  },
  {
    id: "customer-island-lodge",
    name: "Island Lodge Storage",
    status: "paused",
    userCount: 2
  }
];

export const mockInstallations: Installation[] = [
  {
    id: "installation-hawick-yard",
    customerId: "customer-hawick",
    name: "Hawick Solar System",
    address: "Hawick, Scottish Borders",
    timeZone: "Europe/London"
  },
  {
    id: "installation-north-ridge",
    customerId: "customer-north-ridge",
    name: "North Ridge Pump House",
    address: "North Ridge service road",
    timeZone: "Europe/London"
  },
  {
    id: "installation-island-lodge",
    customerId: "customer-island-lodge",
    name: "Island Lodge Battery Shed",
    address: "Island Lodge utility outbuilding",
    timeZone: "Europe/London"
  }
];

export const mockDevices: AdminDevice[] = [
  {
    id: "device-hawick-mppt",
    name: "Hawick MPPT Logger",
    deviceCode: "mppt-hawick-001",
    deviceType: "MPPT solar charge controller gateway",
    deviceModel: "EPEVER Tracer 3210AN",
    hardwareVersion: "HW-1.0",
    firmwareVersion: "1.1.0-demo",
    customerId: "customer-hawick",
    installationId: "installation-hawick-yard",
    installationDate: "2026-09-01",
    locationAddress: "Hawick, Scottish Borders",
    latitude: 55.422,
    longitude: -2.786,
    timeZone: "Europe/London",
    description: "ESP32 telemetry gateway for the customer dashboard demo installation.",
    uploadIntervalMinutes: 30,
    status: "online",
    tags: ["demo", "epever", "rs485"],
    mpptProtocol: "modbus_rtu_rs485",
    cloudTransport: "https_rest",
    lastConnectedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString()
  },
  {
    id: "device-north-ridge-pump",
    name: "Pump House Controller",
    deviceCode: "mppt-north-ridge-002",
    deviceType: "MPPT solar charge controller gateway",
    deviceModel: "EPEVER Tracer 4210AN",
    hardwareVersion: "HW-1.0",
    firmwareVersion: "1.0.4",
    customerId: "customer-north-ridge",
    installationId: "installation-north-ridge",
    installationDate: "2026-08-12",
    locationAddress: "North Ridge service road",
    latitude: 55.953,
    longitude: -3.189,
    timeZone: "Europe/London",
    description: "Monitoring battery-supported water pump power.",
    uploadIntervalMinutes: 15,
    status: "offline",
    tags: ["field", "pump"],
    mpptProtocol: "modbus_rtu_rs485",
    cloudTransport: "https_rest",
    lastConnectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "device-island-lodge",
    name: "Island Lodge Battery Shed",
    deviceCode: "mppt-island-lodge-003",
    deviceType: "MPPT solar charge controller gateway",
    deviceModel: "EPEVER Tracer 2210AN",
    hardwareVersion: "HW-0.9",
    firmwareVersion: "1.0.1",
    customerId: "customer-island-lodge",
    installationId: "installation-island-lodge",
    installationDate: "2026-07-29",
    locationAddress: "Island Lodge utility outbuilding",
    latitude: null,
    longitude: null,
    timeZone: "Europe/London",
    description: "Paused customer installation retained for onboarding review.",
    uploadIntervalMinutes: 60,
    status: "maintenance",
    tags: ["maintenance", "battery"],
    mpptProtocol: "modbus_rtu_rs485",
    cloudTransport: "https_rest",
    lastConnectedAt: null
  }
];
