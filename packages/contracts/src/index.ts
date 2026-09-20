import { z } from "zod";

export const telemetrySampleSchema = z.object({
  measuredAt: z.iso.datetime({ offset: true }),
  pvVoltageV: z.number().finite().min(0).max(200),
  pvCurrentA: z.number().finite().min(0).max(100),
  pvPowerW: z.number().finite().min(0).max(10_000),
  batteryVoltageV: z.number().finite().min(0).max(100),
  chargeCurrentA: z.number().finite().min(0).max(100),
  chargePowerW: z.number().finite().min(0).max(10_000),
  batterySocPercent: z.number().int().min(0).max(100),
  batteryStatusRaw: z.number().int().min(0).max(65_535),
  chargingStatusRaw: z.number().int().min(0).max(65_535),
  energyTodayWh: z.number().finite().min(0),
  energyMonthWh: z.number().finite().min(0),
  energyYearWh: z.number().finite().min(0),
  energyTotalWh: z.number().finite().min(0),
  wifiRssiDbm: z.number().int().min(-120).max(0).optional()
});

export const telemetryBatchSchema = z.object({
  deviceId: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  firmwareVersion: z.string().trim().min(1).max(32),
  samples: z.array(telemetrySampleSchema).min(1).max(100)
});

export type TelemetrySample = z.infer<typeof telemetrySampleSchema>;
export type TelemetryBatch = z.infer<typeof telemetryBatchSchema>;

export type LatestTelemetry = TelemetrySample & {
  deviceId: string;
  deviceName: string;
  siteName: string;
  firmwareVersion: string;
  receivedAt: string;
  lastContactAt: string;
};

export interface DailyEnergyPoint {
  date: string;
  energyWh: number;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

