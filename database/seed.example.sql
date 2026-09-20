-- Development example only. Replace the token hash before running.
-- Generate one with: printf 'your-token' | sha256sum

WITH new_site AS (
    INSERT INTO sites (
        name,
        location,
        timezone,
        panel_capacity_w,
        battery_capacity_ah
    )
    VALUES (
        'Hawick Solar System',
        'Hawick, Scotland',
        'Europe/London',
        240,
        70
    )
    RETURNING id
)
INSERT INTO devices (
    site_id,
    device_code,
    device_name,
    token_hash
)
SELECT
    id,
    'mppt-hawick-001',
    'Hawick MPPT Logger',
    'REPLACE_WITH_64_CHARACTER_SHA256_TOKEN_HASH'
FROM new_site;

