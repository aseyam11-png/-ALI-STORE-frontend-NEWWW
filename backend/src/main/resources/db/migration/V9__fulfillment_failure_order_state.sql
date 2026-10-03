-- V9: represent an order whose fulfillment can no longer complete under the
-- existing supplier/shipment model. This prevents multi-supplier orders from
-- becoming permanently stuck in SHIPPED when one supplier shipment is cancelled.

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'FULFILLMENT_FAILED'
    ));
