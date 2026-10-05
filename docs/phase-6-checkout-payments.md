# Phase 6: checkout and payments

## Implemented in this pass

- Checkout is limited to signed-in customers because order creation is an authenticated endpoint.
- Customers can select a saved address to prefill checkout, or enter a new address.
- Checkout exposes Cash on Delivery and submits that method explicitly.
- The order API recalculates item prices from active catalog products and the selected variant, then calculates tax and shipping on the server. Client totals and promo flags are ignored.
- COD orders start with `paymentStatus: pending`; the API no longer marks orders as paid before receiving payment.

## Remaining work

- Stripe checkout sessions, signed webhook verification, payment failure handling, and refunds.
- MongoDB multi-document transactions around order, coupon usage, and stock movement writes. Conditional stock reservation and compensating rollback are in place, with reconciliation still required after a process failure.
- Persisting an address snapshot and address ID directly on the order.

Do not enable card payment or mark a card order paid until Stripe intent verification and webhook handling are implemented.
