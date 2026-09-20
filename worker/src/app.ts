import { Hono } from "hono";
import { telemetryBatchSchema } from "@mppt/contracts";
import type { ApiFailure, ApiSuccess, LatestTelemetry } from "@mppt/contracts";
import { readBearerToken, sha256Hex } from "./security";
import type { TelemetryRepository } from "./types";

type Variables = {
  repository: TelemetryRepository;
};

function failure(code: string, message: string, details?: unknown): ApiFailure {
  return { ok: false, error: { code, message, ...(details === undefined ? {} : { details }) } };
}

function parseDate(value: string | undefined, fallback: Date): Date | null {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function createApp(repositoryFactory: () => Promise<TelemetryRepository>) {
  const app = new Hono<{ Variables: Variables }>();

  app.use("/api/v1/*", async (c, next) => {
    const repository = await repositoryFactory();
    c.set("repository", repository);
    try {
      await next();
    } finally {
      await repository.close?.();
    }
  });

  app.get("/api/v1/health", (c) =>
    c.json<ApiSuccess<{ service: string; time: string }>>({
      ok: true,
      data: { service: "mppt-energy-cloud", time: new Date().toISOString() }
    })
  );

  app.post("/api/v1/telemetry/batch", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = telemetryBatchSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(failure("INVALID_PAYLOAD", "Telemetry payload is invalid", parsed.error.flatten()), 400);
    }

    const token = readBearerToken(c.req.header("Authorization"));
    if (!token) {
      return c.json(failure("UNAUTHORIZED", "A device bearer token is required"), 401);
    }

    const repository = c.get("repository");
    const device = await repository.authorizeDevice(parsed.data.deviceId, await sha256Hex(token));
    if (!device) {
      return c.json(failure("UNAUTHORIZED", "Device credentials are invalid"), 401);
    }

    const result = await repository.insertBatch(
      device,
      parsed.data.firmwareVersion,
      parsed.data.samples
    );

    return c.json<ApiSuccess<{ processed: number; serverTime: string }>>({
      ok: true,
      data: { processed: result.processed, serverTime: new Date().toISOString() }
    });
  });

  app.get("/api/v1/dashboard/latest", async (c) => {
    const latest = await c.get("repository").latest(c.req.query("deviceId"));
    if (!latest) return c.json(failure("NOT_FOUND", "No telemetry is available"), 404);
    return c.json<ApiSuccess<LatestTelemetry>>({ ok: true, data: latest });
  });

  app.get("/api/v1/telemetry", async (c) => {
    const now = new Date();
    const from = parseDate(c.req.query("from"), new Date(now.valueOf() - 24 * 60 * 60 * 1000));
    const to = parseDate(c.req.query("to"), now);
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 1000), 1), 5000);

    if (!from || !to || from > to || !Number.isFinite(limit)) {
      return c.json(failure("INVALID_QUERY", "Invalid date range or limit"), 400);
    }

    const rows = await c.get("repository").history({
      deviceId: c.req.query("deviceId"),
      from,
      to,
      limit
    });
    return c.json<ApiSuccess<LatestTelemetry[]>>({ ok: true, data: rows });
  });

  app.get("/api/v1/energy/daily", async (c) => {
    const now = new Date();
    const from = parseDate(c.req.query("from"), new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000));
    const to = parseDate(c.req.query("to"), now);
    if (!from || !to || from > to) {
      return c.json(failure("INVALID_QUERY", "Invalid date range"), 400);
    }
    const rows = await c.get("repository").dailyEnergy(c.req.query("deviceId"), from, to);
    return c.json({ ok: true, data: rows });
  });

  app.notFound((c) => c.json(failure("NOT_FOUND", "Route not found"), 404));
  app.onError((error, c) => {
    console.error("Unhandled request error", error);
    return c.json(failure("INTERNAL_ERROR", "The request could not be completed"), 500);
  });

  return app;
}

