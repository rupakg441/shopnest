# Phase 8: customer management and reports

## Customer management

Admin customer listings now return a bounded, safe profile summary. Admins can inspect a customer's saved addresses and order history, and block/unblock customer accounts. Blocking clears the refresh session and protected requests reject inactive users. Customer records are not physically deleted from the admin screen.

## Dashboard and reports

Dashboard metrics now come from MongoDB queries: active products and customers, open orders, paid revenue, low-stock count, order status totals, top sellers, 12 monthly revenue buckets, and 30 daily revenue buckets. The admin can download an order CSV with values escaped for spreadsheet safety.

## Remaining work

This phase does not add arbitrary date-range filters or CSV exports for products/customers. Revenue is based on the order's paid status; Stripe settlement and refund reconciliation remain pending the payment integration phase.
