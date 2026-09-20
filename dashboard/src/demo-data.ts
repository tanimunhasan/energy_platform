import type { DailyEnergyPoint, LatestTelemetry } from "@mppt/contracts";

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export function buildDemoHistory(): LatestTelemetry[] {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 288 }, (_, index) => {
    const measured = new Date(start.valueOf() + index * 5 * 60 * 1000);
    const hour = measured.getUTCHours() + measured.getUTCMinutes() / 60;
    const daylight = Math.max(0, Math.sin(((hour - 7) / 10) * Math.PI));
    const passingClouds = Math.max(0.38, 0.84 + 0.16 * Math.sin(index * 0.39));
    const pvPowerW = Math.max(0, 221 * daylight * passingClouds);
    const pvVoltageV = pvPowerW > 1 ? 31.5 + 7.4 * daylight : 0;
    const pvCurrentA = pvVoltageV ? pvPowerW / pvVoltageV : 0;
    const chargePowerW = pvPowerW * 0.945;
    const batteryVoltageV = 12.82 + daylight * 0.62;
    const energyTodayWh = Math.max(0, 810 * Math.min(1, Math.max(0, (hour - 7) / 10)));

    return {
      deviceId: "mppt-hawick-001",
      deviceName: "Hawick MPPT Logger",
      siteName: "Hawick Solar System",
      firmwareVersion: "1.1.0-demo",
      measuredAt: measured.toISOString(),
      receivedAt: measured.toISOString(),
      lastContactAt: now.toISOString(),
      pvVoltageV: round(pvVoltageV),
      pvCurrentA: round(pvCurrentA),
      pvPowerW: round(pvPowerW),
      batteryVoltageV: round(batteryVoltageV),
      chargeCurrentA: round(chargePowerW / batteryVoltageV),
      chargePowerW: round(chargePowerW),
      batterySocPercent: Math.round(58 + daylight * 28),
      batteryStatusRaw: 0,
      chargingStatusRaw: pvPowerW > 120 ? 3 : pvPowerW > 2 ? 2 : 0,
      energyTodayWh: round(energyTodayWh, 0),
      energyMonthWh: 12_400 + round(energyTodayWh, 0),
      energyYearWh: 83_300 + round(energyTodayWh, 0),
      energyTotalWh: 193_800 + round(energyTodayWh, 0),
      wifiRssiDbm: -62
    };
  }).filter((row) => new Date(row.measuredAt) <= now);
}

export function buildDemoDailyEnergy(): DailyEnergyPoint[] {
  const now = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now.valueOf() - (13 - index) * 24 * 60 * 60 * 1000);
    const variation = 0.52 + 0.42 * Math.abs(Math.sin(index * 1.21));
    return {
      date: date.toISOString().slice(0, 10),
      energyWh: Math.round(930 * variation)
    };
  });
}

