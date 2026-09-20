# MPPT Energy Cloud

Standalone cloud software for the EPEVER MPPT logger. It contains a Cloudflare
Worker API, a portable PostgreSQL schema, an ESP32-compatible telemetry contract,
a solar-data simulator, and a responsive React dashboard.

## Current milestone

This software can be developed and demonstrated without changing the ESP32,
Cloudflare DNS, or the existing IONOS website. The dashboard defaults to a
realistic demo-data mode.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL for live API storage (demo dashboard does not require it)

## Start the dashboard

```bash
npm install
npm run dev:dashboard
```

Open the URL shown by Vite. Demo mode is enabled by default.

## Build and test everything

```bash
npm run test
npm run build
```

## Simulate an ESP32 upload

When the Worker API is running and a development device has been created:

```bash
MPPT_API_URL=http://localhost:8787/api/v1 \
MPPT_DEVICE_ID=mppt-hawick-001 \
MPPT_DEVICE_TOKEN=replace-me \
npm run simulate
```

## Security

Do not commit `.dev.vars`, database credentials, Wi-Fi credentials, device
tokens, or Cloudflare tokens. Device tokens are stored in PostgreSQL only as
SHA-256 hashes. Production dashboard access will be protected separately from
device ingestion.

See `docs/DEVELOPMENT.md` for the implementation and deployment sequence.

