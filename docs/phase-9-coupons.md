# Phase 9: coupons

Coupon management now supports fixed and percentage discounts, minimum order totals, optional maximum discount, start/expiry dates, usage limits, active state, and one use per customer. Admins can create, edit, and disable coupons.

Customers validate a code against the server cart. Checkout recalculates current prices, validates the code again, reserves its global usage count, and records the user/order usage. The frontend no longer grants the old hard-coded WELCOME10 discount. Order totals are recalculated from catalog prices and the validated coupon.

See [admin operations and coupon routes](api/README.md#admin-operations).

The coupon usage reservation and order creation use compensating rollback, not a MongoDB multi-document transaction. A process failure between those writes requires reconciliation.
