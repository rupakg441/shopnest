# Phase 10: newsletter subscriptions

The home page and footer subscription forms now save normalized email addresses in MongoDB through a rate-limited API. Repeat subscriptions are idempotent. The UI no longer reports a subscription as successful before the server accepts it, and the unsupported hard-coded welcome discount claim has been removed.

The current implementation does not include confirmation emails, unsubscribe links, or a marketing platform integration.
