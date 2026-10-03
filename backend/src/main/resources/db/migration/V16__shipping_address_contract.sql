-- Complete the customer shipping-address contract used by the storefront.
ALTER TABLE shipping_addresses
    ADD COLUMN IF NOT EXISTS label VARCHAR(80),
    ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(160),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
    ADD COLUMN IF NOT EXISTS building VARCHAR(100),
    ADD COLUMN IF NOT EXISTS apartment VARCHAR(100),
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Legacy rows may contain multiple defaults. Keep the oldest/default-priority row
-- and clear the rest before enforcing the invariant at database level.
WITH ranked_defaults AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY id ASC
        ) AS row_number
    FROM shipping_addresses
    WHERE is_default = TRUE
)
UPDATE shipping_addresses AS a
SET is_default = FALSE
FROM ranked_defaults AS r
WHERE a.id = r.id
  AND r.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_shipping_addresses_one_default_per_user
    ON shipping_addresses (user_id)
    WHERE is_default = TRUE;
