import type { DailyEnergyPoint, LatestTelemetry, TelemetrySample } from "@mppt/contracts";

export interface DeviceIdentity {
  id: string;
  deviceCode: string;
}

export interface TelemetryQuery {
  deviceId?: string;
  from: Date;
  to: Date;
  limit: number;
}

export interface TelemetryRepository {
  authorizeDevice(deviceCode: string, tokenHash: string): Promise<DeviceIdentity | null>;
  insertBatch(
    device: DeviceIdentity,
    firmwareVersion: string,
    samples: TelemetrySample[]
  ): Promise<{ processed: number }>;
  latest(deviceCode?: string): Promise<LatestTelemetry | null>;
  history(query: TelemetryQuery): Promise<LatestTelemetry[]>;
  dailyEnergy(deviceCode: string | undefined, from: Date, to: Date): Promise<DailyEnergyPoint[]>;
  close?(): Promise<void>;
}

export interface WorkerEnv {
  HYPERDRIVE: {
    connectionString: string;
  };
}

