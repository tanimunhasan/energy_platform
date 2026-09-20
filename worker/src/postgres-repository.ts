import { Client } from "pg";
import type { LatestTelemetry, TelemetrySample } from "@mppt/contracts";
import type {
  DeviceIdentity,
  TelemetryQuery,
  TelemetryRepository
} from "./types";

type DbRow = Record<string, unknown>;

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function mapTelemetry(row: DbRow): LatestTelemetry {
  return {
    deviceId: String(row.device_code),
    deviceName: String(row.device_name),
    siteName: String(row.site_name),
    firmwareVersion: String(row.firmware_version),
    measuredAt: new Date(String(row.measured_at)).toISOString(),
    receivedAt: new Date(String(row.received_at)).toISOString(),
    lastContactAt: new Date(String(row.last_contact_at)).toISOString(),
    pvVoltageV: numberValue(row.pv_voltage_v),
    pvCurrentA: numberValue(row.pv_current_a),
    pvPowerW: numberValue(row.pv_power_w),
    batteryVoltageV: numberValue(row.battery_voltage_v),
    chargeCurrentA: numberValue(row.charge_current_a),
    chargePowerW: numberValue(row.charge_power_w),
    batterySocPercent: numberValue(row.battery_soc_percent),
    batteryStatusRaw: numberValue(row.battery_status_raw),
    chargingStatusRaw: numberValue(row.charging_status_raw),
    energyTodayWh: numberValue(row.energy_today_wh),
    energyMonthWh: numberValue(row.energy_month_wh),
    energyYearWh: numberValue(row.energy_year_wh),
    energyTotalWh: numberValue(row.energy_total_wh),
    wifiRssiDbm: row.wifi_rssi_dbm == null ? undefined : numberValue(row.wifi_rssi_dbm)
  };
}

const TELEMETRY_SELECT = `
  SELECT
    d.device_code,
    d.device_name,
    s.name AS site_name,
    d.last_contact_at,
    t.*
  FROM telemetry t
  JOIN devices d ON d.id = t.device_id
  JOIN sites s ON s.id = d.site_id
`;

export class PostgresTelemetryRepository implements TelemetryRepository {
  private readonly client: Client;

  constructor(connectionString: string) {
    this.client = new Client({ connectionString });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async close(): Promise<void> {
    await this.client.end();
  }

  async authorizeDevice(deviceCode: string, tokenHash: string): Promise<DeviceIdentity | null> {
    const result = await this.client.query(
      `SELECT id, device_code
       FROM devices
       WHERE device_code = $1 AND token_hash = $2 AND enabled = TRUE`,
      [deviceCode, tokenHash]
    );

    if (result.rowCount !== 1) return null;

    return {
      id: String(result.rows[0].id),
      deviceCode: String(result.rows[0].device_code)
    };
  }

  async insertBatch(
    device: DeviceIdentity,
    firmwareVersion: string,
    samples: TelemetrySample[]
  ): Promise<{ processed: number }> {
    await this.client.query("BEGIN");
    try {
      for (const sample of samples) {
        await this.client.query(
          `INSERT INTO telemetry (
             device_id, measured_at, pv_voltage_v, pv_current_a, pv_power_w,
             battery_voltage_v, charge_current_a, charge_power_w,
             battery_soc_percent, battery_status_raw, charging_status_raw,
             energy_today_wh, energy_month_wh, energy_year_wh, energy_total_wh,
             wifi_rssi_dbm, firmware_version
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
             $14, $15, $16, $17
           )
           ON CONFLICT (device_id, measured_at) DO UPDATE SET
             received_at = NOW(),
             firmware_version = EXCLUDED.firmware_version,
             wifi_rssi_dbm = EXCLUDED.wifi_rssi_dbm`,
          [
            device.id,
            sample.measuredAt,
            sample.pvVoltageV,
            sample.pvCurrentA,
            sample.pvPowerW,
            sample.batteryVoltageV,
            sample.chargeCurrentA,
            sample.chargePowerW,
            sample.batterySocPercent,
            sample.batteryStatusRaw,
            sample.chargingStatusRaw,
            sample.energyTodayWh,
            sample.energyMonthWh,
            sample.energyYearWh,
            sample.energyTotalWh,
            sample.wifiRssiDbm ?? null,
            firmwareVersion
          ]
        );
      }

      const newest = samples.reduce((latest, sample) =>
        sample.measuredAt > latest.measuredAt ? sample : latest
      );

      await this.client.query(
        `UPDATE devices SET
           firmware_version = $2,
           last_measurement_at = GREATEST(COALESCE(last_measurement_at, $3), $3),
           last_contact_at = NOW(),
           last_wifi_rssi_dbm = $4
         WHERE id = $1`,
        [device.id, firmwareVersion, newest.measuredAt, newest.wifiRssiDbm ?? null]
      );

      await this.client.query("COMMIT");
      return { processed: samples.length };
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw error;
    }
  }

  async latest(deviceCode?: string): Promise<LatestTelemetry | null> {
    const params: unknown[] = [];
    const filter = deviceCode ? "WHERE d.device_code = $1" : "";
    if (deviceCode) params.push(deviceCode);

    const result = await this.client.query(
      `${TELEMETRY_SELECT}
       ${filter}
       ORDER BY t.measured_at DESC
       LIMIT 1`,
      params
    );

    return result.rowCount ? mapTelemetry(result.rows[0]) : null;
  }

  async history(query: TelemetryQuery): Promise<LatestTelemetry[]> {
    const params: unknown[] = [query.from.toISOString(), query.to.toISOString()];
    let deviceFilter = "";
    if (query.deviceId) {
      params.push(query.deviceId);
      deviceFilter = `AND d.device_code = $${params.length}`;
    }
    params.push(query.limit);

    const result = await this.client.query(
      `${TELEMETRY_SELECT}
       WHERE t.measured_at >= $1 AND t.measured_at <= $2
       ${deviceFilter}
       ORDER BY t.measured_at ASC
       LIMIT $${params.length}`,
      params
    );

    return result.rows.map(mapTelemetry);
  }

  async dailyEnergy(deviceCode: string | undefined, from: Date, to: Date) {
    const params: unknown[] = [from.toISOString(), to.toISOString()];
    let deviceFilter = "";
    if (deviceCode) {
      params.push(deviceCode);
      deviceFilter = `AND d.device_code = $${params.length}`;
    }

    const result = await this.client.query(
      `SELECT
         TO_CHAR(t.measured_at AT TIME ZONE s.timezone, 'YYYY-MM-DD') AS date,
         MAX(t.energy_today_wh) AS energy_wh
       FROM telemetry t
       JOIN devices d ON d.id = t.device_id
       JOIN sites s ON s.id = d.site_id
       WHERE t.measured_at >= $1 AND t.measured_at <= $2
       ${deviceFilter}
       GROUP BY date
       ORDER BY date ASC`,
      params
    );

    return result.rows.map((row) => ({
      date: String(row.date),
      energyWh: numberValue(row.energy_wh)
    }));
  }
}

