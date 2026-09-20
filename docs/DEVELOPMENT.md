# Development and deployment sequence

1. Run the dashboard using simulated telemetry.
2. Create a managed PostgreSQL database.
3. Apply `database/migrations/0001_initial.sql`.
4. Register a site and device using a hashed development token.
5. Configure Cloudflare Hyperdrive and Worker secrets.
6. Run the MPPT simulator against the deployed API.
7. Verify charts, aggregation, duplicate handling, and CSV export.
8. Connect a new subdomain only after the temporary Cloudflare deployment works.
9. Add ESP32 synchronization after the software platform is accepted.

No Cloudflare Tunnel is required. The planned application should use a fresh
subdomain such as `solar.tanimunhasan.co.uk`, leaving existing IONOS web and
mail records unchanged.

