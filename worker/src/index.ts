import { createApp } from "./app";
import { PostgresTelemetryRepository } from "./postgres-repository";
import type { WorkerEnv } from "./types";

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const app = createApp(async () => {
      const repository = new PostgresTelemetryRepository(env.HYPERDRIVE.connectionString);
      await repository.connect();
      return repository;
    });

    return app.fetch(request);
  }
};

