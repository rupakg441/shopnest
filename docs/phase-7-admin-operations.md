# Phase 7: admin operations foundations

## Reviews

Purchase-verified reviews are created as pending. Admins can list by moderation status, approve/reject, and delete. Public product pages show approved reviews only, and product rating aggregates only include approved reviews. Editing a published review by its owner returns it to pending moderation.

## Inventory

Admins can filter active products by low/out-of-stock levels, search by title or SKU, adjust product or SKU variant stock, and inspect recent movement history. Each adjustment records the actor, reason, delta, and before/after quantity. Negative stock and stale concurrent adjustments are rejected.

## API

See [API reference](api/README.md#admin-operations) for the admin routes and payloads. The admin console exposes Reviews and Inventory pages.

## Remaining work

Order placement now reserves product and variant stock with conditional atomic updates, writes stock movement records, and rolls reservations back if order creation fails. Cancellation is protected against duplicate restocking and records movements. Multi-document transactions are not used, so an infrastructure failure between the order state change and its stock movements still needs an operational reconciliation path. This phase does not implement supplier purchase orders or automated stock alerts.
