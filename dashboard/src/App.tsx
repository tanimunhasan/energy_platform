import { useEffect, useMemo, useState } from "react";
import type { DailyEnergyPoint, LatestTelemetry } from "@mppt/contracts";
import type { EChartsOption } from "echarts";
import EChart from "./EChart";
import { loadDashboardData } from "./api";
import AdminApp from "./admin/AdminApp";

type DashboardData = {
  latest: LatestTelemetry;
  history: LatestTelemetry[];
  dailyEnergy: DailyEnergyPoint[];
  isDemo: boolean;
};

const chartText = "#a7b7ae";
const gridLine = "rgba(255,255,255,0.07)";

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function statusLabel(raw: number) {
  if (raw === 3) return "Boost charging";
  if (raw === 2) return "MPPT charging";
  if (raw === 1) return "Float charging";
  return "Not charging";
}

function MetricCard({
  label,
  value,
  unit,
  detail,
  tone = "green"
}: {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  tone?: "green" | "amber" | "blue";
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value} <span>{unit}</span>
      </div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}

function Loading() {
  return (
    <main className="loading-screen">
      <div className="sun-loader" />
      <p>Loading solar telemetry…</p>
    </main>
  );
}

function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData().then(setData).catch((reason: Error) => setError(reason.message));
  }, []);

  const powerOption = useMemo<EChartsOption>(() => {
    if (!data) return {};
    return {
      animationDuration: 600,
      tooltip: { trigger: "axis", valueFormatter: (value) => `${formatNumber(Number(value))} W` },
      legend: { data: ["PV power", "Charge power"], textStyle: { color: chartText }, top: 4 },
      grid: { left: 48, right: 18, top: 48, bottom: 38 },
      xAxis: {
        type: "time",
        axisLabel: { color: chartText },
        axisLine: { lineStyle: { color: gridLine } },
        splitLine: { show: false }
      },
      yAxis: {
        type: "value",
        name: "Power (W)",
        nameTextStyle: { color: chartText },
        axisLabel: { color: chartText },
        splitLine: { lineStyle: { color: gridLine } }
      },
      series: [
        {
          name: "PV power",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: data.history.map((row) => [row.measuredAt, row.pvPowerW]),
          lineStyle: { color: "#f5bd34", width: 3 },
          areaStyle: { color: "rgba(245,189,52,0.14)" }
        },
        {
          name: "Charge power",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: data.history.map((row) => [row.measuredAt, row.chargePowerW]),
          lineStyle: { color: "#38d39f", width: 2 }
        }
      ]
    };
  }, [data]);

  const energyOption = useMemo<EChartsOption>(() => {
    if (!data) return {};
    return {
      tooltip: { trigger: "axis", valueFormatter: (value) => `${formatNumber(Number(value) / 1000, 2)} kWh` },
      grid: { left: 48, right: 16, top: 24, bottom: 46 },
      xAxis: {
        type: "category",
        data: data.dailyEnergy.map((point) => point.date.slice(5)),
        axisLabel: { color: chartText },
        axisLine: { lineStyle: { color: gridLine } }
      },
      yAxis: {
        type: "value",
        name: "kWh",
        axisLabel: { color: chartText, formatter: (value: number) => (value / 1000).toFixed(1) },
        nameTextStyle: { color: chartText },
        splitLine: { lineStyle: { color: gridLine } }
      },
      series: [
        {
          type: "bar",
          data: data.dailyEnergy.map((point) => point.energyWh),
          itemStyle: {
            color: "#38d39f",
            borderRadius: [5, 5, 0, 0]
          }
        }
      ]
    };
  }, [data]);

  if (error) {
    return <main className="loading-screen error"><h1>Dashboard unavailable</h1><p>{error}</p></main>;
  }
  if (!data) return <Loading />;

  const latest = data.latest;
  const freshnessMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(latest.lastContactAt).valueOf()) / 60_000)
  );
  const online = freshnessMinutes < 45;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><span>☀</span></div>
        <div className="brand-copy"><strong>Solara</strong><small>Energy intelligence</small></div>
        <nav>
          <a className="active" href="#overview">Overview</a>
          <a href="#performance">Performance</a>
          <a href="#energy">Energy</a>
          <a href="#device">Device health</a>
        </nav>
        <div className="site-card">
          <span>Installation</span>
          <strong>{latest.siteName}</strong>
          <small>240 W PV · 70 Ah LiFePO₄</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar" id="overview">
          <div>
            <p className="eyebrow">OFF-GRID SOLAR MONITORING</p>
            <h1>Good afternoon, Sayed</h1>
            <p>Here is how your Hawick installation is performing.</p>
          </div>
          <div className="header-status">
            {data.isDemo && <span className="demo-pill">DEMO DATA</span>}
            <span className={`online-pill ${online ? "online" : "offline"}`}>
              <i /> {online ? "System online" : "System offline"}
            </span>
          </div>
        </header>

        <section className="metrics-grid">
          <MetricCard label="PV POWER" value={formatNumber(latest.pvPowerW)} unit="W" detail={`${formatNumber(latest.pvVoltageV)} V · ${formatNumber(latest.pvCurrentA)} A`} tone="amber" />
          <MetricCard label="BATTERY SOC" value={String(latest.batterySocPercent)} unit="%" detail={`${formatNumber(latest.batteryVoltageV, 2)} V battery voltage`} />
          <MetricCard label="CHARGE POWER" value={formatNumber(latest.chargePowerW)} unit="W" detail={`${formatNumber(latest.chargeCurrentA)} A charging current`} tone="blue" />
          <MetricCard label="ENERGY TODAY" value={formatNumber(latest.energyTodayWh / 1000, 2)} unit="kWh" detail={`${formatNumber(latest.energyMonthWh / 1000, 1)} kWh this month`} />
        </section>

        <section className="content-grid" id="performance">
          <article className="panel chart-panel wide">
            <div className="panel-heading">
              <div><span>POWER PERFORMANCE</span><h2>Solar generation today</h2></div>
              <span className="updated">5-minute measurements</span>
            </div>
            <EChart option={powerOption} />
          </article>

          <article className="panel flow-panel">
            <div className="panel-heading"><div><span>LIVE FLOW</span><h2>Energy direction</h2></div></div>
            <div className="energy-flow">
              <div className="flow-node sun"><b>☀</b><span>Solar array</span><strong>{formatNumber(latest.pvPowerW)} W</strong></div>
              <div className="flow-line"><i /></div>
              <div className="flow-node controller"><b>MPPT</b><span>Tracer 3210AN</span><strong>{Math.round((latest.chargePowerW / Math.max(latest.pvPowerW, 1)) * 100)}% conversion</strong></div>
              <div className="flow-line"><i /></div>
              <div className="flow-node battery"><b>{latest.batterySocPercent}%</b><span>Battery</span><strong>{statusLabel(latest.chargingStatusRaw)}</strong></div>
            </div>
          </article>
        </section>

        <section className="content-grid lower" id="energy">
          <article className="panel chart-panel wide">
            <div className="panel-heading">
              <div><span>ENERGY YIELD</span><h2>Last 14 days</h2></div>
              <strong className="lifetime">{formatNumber(latest.energyTotalWh / 1000, 1)} kWh lifetime</strong>
            </div>
            <EChart option={energyOption} />
          </article>

          <article className="panel health-panel" id="device">
            <div className="panel-heading"><div><span>DEVICE HEALTH</span><h2>{latest.deviceName}</h2></div></div>
            <dl>
              <div><dt>Last measurement</dt><dd>{new Date(latest.measuredAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</dd></div>
              <div><dt>Cloud contact</dt><dd>{freshnessMinutes === 0 ? "Just now" : `${freshnessMinutes} min ago`}</dd></div>
              <div><dt>Wi-Fi signal</dt><dd>{latest.wifiRssiDbm ?? "—"} dBm</dd></div>
              <div><dt>Firmware</dt><dd>{latest.firmwareVersion}</dd></div>
              <div><dt>Logging interval</dt><dd>5 minutes</dd></div>
              <div><dt>Cloud upload</dt><dd>30 minutes</dd></div>
            </dl>
          </article>
        </section>

        <footer>
          <span>Hawick Solar Energy</span>
          <span>All timestamps shown in Europe/London</span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(path: string) {
    window.history.pushState(null, "", path);
    setPathname(window.location.pathname);
    window.scrollTo({ top: 0 });
  }

  if (pathname.startsWith("/admin")) {
    return <AdminApp pathname={pathname} navigate={navigate} />;
  }

  return <CustomerDashboard />;
}
