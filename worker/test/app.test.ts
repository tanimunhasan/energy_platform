import { describe, expect, it } from "vitest";
import type { DailyEnergyPoint, LatestTelemetry, TelemetrySample } from "@mppt/contracts";
import { createApp } from "../src/app";
import { sha256Hex } from "../src/security";
import type { DeviceIdentity, TelemetryQuery, TelemetryRepository } from "../src/types";

class MemoryRepository implements TelemetryRepository {
  rows: LatestTelemetry[] = [];
  expectedHash = "";

  async authorizeDevice(deviceCode: string, tokenHash: string): Promise<DeviceIdentity | null> {
    return deviceCode === "mppt-hawick-001" && tokenHash === this.expectedHash
      ? { id: "device-1", deviceCode }
      : null;
  }

  async insertBatch(device: DeviceIdentity, firmwareVersion: string, samples: TelemetrySample[]) {
    for (const sample of samples) {
      const row: LatestTelemetry = {
        ...sample,
        deviceId: device.deviceCode,
        deviceName: "Test Logger",
        siteName: "Hawick Solar System",
        firmwareVersion,
        receivedAt: new Date().toISOString(),
        lastContactAt: new Date().toISOString()
      };
      const index = this.rows.findIndex(
        (existing) => existing.deviceId === row.deviceId && existing.measuredAt === row.measuredAt
      );
      if (index >= 0) this.rows[index] = row;
      else this.rows.push(row);
    }
    return { processed: samples.length };
  }

  async latest() {
    return this.rows.at(-1) ?? null;
  }

  async history(_query: TelemetryQuery) {
    return this.rows;
  }

  async dailyEnergy(): Promise<DailyEnergyPoint[]> {
    return [{ date: "2026-09-20", energyWh: 410 }];
  }
}

const sample = {
  measuredAt: "2026-09-20T10:30:00.000Z",
  pvVoltageV: 38.42,
  pvCurrentA: 3.16,
  pvPowerW: 121.39,
  batteryVoltageV: 13.41,
  chargeCurrentA: 8.73,
  chargePowerW: 117.06,
  batterySocPercent: 81,
  batteryStatusRaw: 0,
  chargingStatusRaw: 3,
  energyTodayWh: 540,
  energyMonthWh: 12400,
  energyYearWh: 83300,
  energyTotalWh: 193800,
  wifiRssiDbm: -62
};

describe("MPPT API", () => {
  it("accepts an authenticated telemetry batch and prevents duplicate rows", async () => {
    const repository = new MemoryRepository();
    repository.expectedHash = await sha256Hex("test-token");
    const app = createApp(async () => repository);
    const request = () =>
      app.request("/api/v1/telemetry/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token"
        },
        body: JSON.stringify({
          deviceId: "mppt-hawick-001",
          firmwareVersion: "1.1.0",
          samples: [sample]
        })
      });

    expect((await request()).status).toBe(200);
    expect((await request()).status).toBe(200);
    expect(repository.rows).toHaveLength(1);
  });

  it("rejects an invalid device token", async () => {
    const repository = new MemoryRepository();
    repository.expectedHash = await sha256Hex("correct-token");
    const app = createApp(async () => repository);
    const response = await app.request("/api/v1/telemetry/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer incorrect-token"
      },
      body: JSON.stringify({
        deviceId: "mppt-hawick-001",
        firmwareVersion: "1.1.0",
        samples: [sample]
      })
    });

    expect(response.status).toBe(401);
  });

  it("rejects measurements outside the telemetry contract", async () => {
    const repository = new MemoryRepository();
    repository.expectedHash = await sha256Hex("test-token");
    const app = createApp(async () => repository);
    const response = await app.request("/api/v1/telemetry/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token"
      },
      body: JSON.stringify({
        deviceId: "mppt-hawick-001",
        firmwareVersion: "1.1.0",
        samples: [{ ...sample, batterySocPercent: 140 }]
      })
    });

    expect(response.status).toBe(400);
  });
});

