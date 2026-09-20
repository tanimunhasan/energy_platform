import type { ApiSuccess, DailyEnergyPoint, LatestTelemetry } from "@mppt/contracts";
import { buildDemoDailyEnergy, buildDemoHistory } from "./demo-data";

const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const demoMode = String(import.meta.env.VITE_DEMO_MODE ?? "true") === "true";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  const body = (await response.json()) as ApiSuccess<T>;
  return body.data;
}

export async function loadDashboardData(): Promise<{
  latest: LatestTelemetry;
  history: LatestTelemetry[];
  dailyEnergy: DailyEnergyPoint[];
  isDemo: boolean;
}> {
  if (demoMode) {
    const history = buildDemoHistory();
    return {
      latest: history.at(-1)!,
      history,
      dailyEnergy: buildDemoDailyEnergy(),
      isDemo: true
    };
  }

  const now = new Date();
  const from = new Date(now.valueOf() - 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [latest, history, dailyEnergy] = await Promise.all([
    getJson<LatestTelemetry>("/dashboard/latest"),
    getJson<LatestTelemetry[]>(`/telemetry?from=${encodeURIComponent(from)}&to=${encodeURIComponent(now.toISOString())}`),
    getJson<DailyEnergyPoint[]>(`/energy/daily?from=${encodeURIComponent(monthStart)}&to=${encodeURIComponent(now.toISOString())}`)
  ]);

  return { latest, history, dailyEnergy, isDemo: false };
}

