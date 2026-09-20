CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    timezone TEXT NOT NULL DEFAULT 'Europe/London',
    panel_capacity_w INTEGER CHECK (panel_capacity_w > 0),
    battery_capacity_ah INTEGER CHECK (battery_capacity_ah > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    device_code VARCHAR(64) NOT NULL UNIQUE,
    device_name TEXT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    firmware_version VARCHAR(32),
    last_measurement_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    last_wifi_rssi_dbm SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT wifi_rssi_range CHECK (
        last_wifi_rssi_dbm IS NULL OR last_wifi_rssi_dbm BETWEEN -120 AND 0
    )
);

CREATE TABLE telemetry (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pv_voltage_v DOUBLE PRECISION NOT NULL CHECK (pv_voltage_v >= 0),
    pv_current_a DOUBLE PRECISION NOT NULL CHECK (pv_current_a >= 0),
    pv_power_w DOUBLE PRECISION NOT NULL CHECK (pv_power_w >= 0),
    battery_voltage_v DOUBLE PRECISION NOT NULL CHECK (battery_voltage_v >= 0),
    charge_current_a DOUBLE PRECISION NOT NULL CHECK (charge_current_a >= 0),
    charge_power_w DOUBLE PRECISION NOT NULL CHECK (charge_power_w >= 0),
    battery_soc_percent SMALLINT NOT NULL CHECK (battery_soc_percent BETWEEN 0 AND 100),
    battery_status_raw INTEGER NOT NULL CHECK (battery_status_raw BETWEEN 0 AND 65535),
    charging_status_raw INTEGER NOT NULL CHECK (charging_status_raw BETWEEN 0 AND 65535),
    energy_today_wh DOUBLE PRECISION NOT NULL CHECK (energy_today_wh >= 0),
    energy_month_wh DOUBLE PRECISION NOT NULL CHECK (energy_month_wh >= 0),
    energy_year_wh DOUBLE PRECISION NOT NULL CHECK (energy_year_wh >= 0),
    energy_total_wh DOUBLE PRECISION NOT NULL CHECK (energy_total_wh >= 0),
    wifi_rssi_dbm SMALLINT,
    firmware_version VARCHAR(32) NOT NULL,
    CONSTRAINT telemetry_wifi_rssi_range CHECK (
        wifi_rssi_dbm IS NULL OR wifi_rssi_dbm BETWEEN -120 AND 0
    ),
    CONSTRAINT telemetry_device_time_unique UNIQUE (device_id, measured_at)
);

CREATE INDEX telemetry_device_time_desc_idx
    ON telemetry (device_id, measured_at DESC);

CREATE INDEX telemetry_measured_at_idx
    ON telemetry (measured_at);

CREATE TABLE device_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    event_code VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    details JSONB
);

CREATE INDEX device_events_device_time_desc_idx
    ON device_events (device_id, occurred_at DESC);

