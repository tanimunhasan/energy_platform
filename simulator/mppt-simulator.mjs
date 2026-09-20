const apiBase = process.env.MPPT_API_URL ?? "http://localhost:8787/api/v1";
const deviceId = process.env.MPPT_DEVICE_ID ?? "mppt-hawick-001";
const deviceToken = process.env.MPPT_DEVICE_TOKEN;

if (!deviceToken) {
  console.error("MPPT_DEVICE_TOKEN is required.");
  process.exit(1);
}

const round = (value, digits = 2) => Number(value.toFixed(digits));

function generateSample(date, sampleIndex) {
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  const daylight = Math.max(0, Math.sin(((hour - 7) / 10) * Math.PI));
  const cloudFactor = 0.72 + 0.22 * Math.sin(sampleIndex * 1.73);
  const pvPowerW = Math.max(0, 210 * daylight * cloudFactor);
  const pvVoltageV = pvPowerW > 1 ? 31 + 8 * daylight : 0;
  const pvCurrentA = pvVoltageV ? pvPowerW / pvVoltageV : 0;
  const chargePowerW = pvPowerW * 0.94;
  const batteryVoltageV = 12.75 + Math.min(0.85, daylight * 0.75);
  const chargeCurrentA = chargePowerW / Math.max(batteryVoltageV, 1);
  const energyTodayWh = Math.max(0, 780 * Math.min(1, (hour - 7) / 10));

  return {
    measuredAt: date.toISOString(),
    pvVoltageV: round(pvVoltageV),
    pvCurrentA: round(pvCurrentA),
    pvPowerW: round(pvPowerW),
    batteryVoltageV: round(batteryVoltageV),
    chargeCurrentA: round(chargeCurrentA),
    chargePowerW: round(chargePowerW),
    batterySocPercent: Math.round(54 + daylight * 33),
    batteryStatusRaw: 0,
    chargingStatusRaw: pvPowerW > 100 ? 3 : pvPowerW > 1 ? 2 : 0,
    energyTodayWh: round(energyTodayWh, 0),
    energyMonthWh: 12400 + round(energyTodayWh, 0),
    energyYearWh: 83300 + round(energyTodayWh, 0),
    energyTotalWh: 193800 + round(energyTodayWh, 0),
    wifiRssiDbm: -58 - (sampleIndex % 8)
  };
}

const now = new Date();
const samples = Array.from({ length: 12 }, (_, index) =>
  generateSample(new Date(now.valueOf() - (11 - index) * 5 * 60 * 1000), index)
);

const response = await fetch(`${apiBase}/telemetry/batch`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${deviceToken}`
  },
  body: JSON.stringify({ deviceId, firmwareVersion: "simulator-0.1.0", samples })
});

console.log(response.status, await response.text());
if (!response.ok) process.exit(1);

