# API reference

Base URL: `http://localhost:5000/api`

## Health

`GET /health` returns JSON indicating that the API is running. The server opens its listener only after the configured MongoDB connection succeeds, so a successful response also reports `database: "connected"`.

```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

## Existing route groups

| Prefix | Purpose |
| --- | --- |
| `/auth` | Registration and login |
| `/users` | Customer profile operations |
| `/products` | Product catalog |
| `/categories` | Product categories |
| `/cart` | Customer cart |
| `/wishlist` | Customer wishlist |
| `/addresses` | Saved customer addresses |
| `/admin` | Admin dashboard, orders, reviews, and inventory |
| `/coupons` | Customer coupon validation |
| `/newsletter` | Newsletter subscriptions |
| `/content` | Published storefront banners and pages |
| `/orders` | Orders |
| `/reviews` | Product reviews |
| `/ai` | Authenticated ShopNest Concierge |
| `/uploads` | Admin-only Cloudinary image uploads |

Domain request and response details are described in the sections below.

## Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create customer; sends email verification when enabled |
| `POST` | `/auth/login` | Customer sign in |
| `POST` | `/auth/admin/login` | Admin sign in (admin or superadmin role required) |
| `POST` | `/auth/refresh` | Rotate refresh cookie and issue access token |
| `POST` | `/auth/logout` | Revoke refresh session and clear cookie |
| `GET` | `/auth/me` | Current profile; bearer access token required |
| `POST` | `/auth/verify-email` | Consume one time verification token |
| `POST` | `/auth/resend-verification` | Resend verification email without account enumeration |
| `POST` | `/auth/forgot-password` | Request one time password reset link |
| `POST` | `/auth/reset-password` | Set a new password with a valid reset token |

Access token responses use the existing envelope: `{ success, message, data: { token, user } }`. Refresh tokens are only set as the HTTP-only `shopnest_refresh` cookie. Configure `EMAIL_VERIFICATION_REQUIRED`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `be/.env`. A missing SMTP transport is logged locally during development; production fails instead of silently discarding account mail.

## Catalog and uploads

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/categories` | Public | Active categories and parent summaries |
| `GET` | `/categories/admin` | Admin | Includes disabled categories |
| `POST` | `/categories` | Admin | Create a category |
| `PUT` | `/categories/:id` | Admin | Update category fields |
| `DELETE` | `/categories/:id` | Admin | Soft disables a category |
| `GET` | `/products` | Public | Search/filter/sort/page; 24 per page, maximum 100 |
| `GET` | `/products/filters` | Public | Available brand names and price bounds |
| `GET` | `/products/admin` | Admin | Includes inactive products |
| `POST` | `/products` | Admin | Create product |
| `PUT` | `/products/:id` | Admin | Update product |
| `DELETE` | `/products/:id` | Admin | Soft disables a product |
| `POST` | `/uploads/products` | Admin | Multipart field `images`, up to 8 images |
| `POST` | `/uploads/categories` | Admin | Multipart field `image`, one image |

Uploads accept JPEG, PNG, WebP, or AVIF files up to 5 MiB each. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the server.

`GET /products` accepts `search`, comma-separated `category` and `brand`, `minPrice`, `maxPrice`, `rating`, `sort` (`featured`, `newest`, `price_asc`, `price_desc`, `rating`, `title`), `page`, and `limit` query parameters.

## Customer data

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/cart` | Get the signed-in customer's cart with current catalog prices |
| `POST` | `/cart/items` | Add product and quantity/options; server validates product and stock |
| `PUT` | `/cart/items/:productId` | Change quantity/options |
| `DELETE` | `/cart/items/:productId` | Remove an item |
| `DELETE` | `/cart` | Clear cart |
| `GET` | `/wishlist` | Get saved product summaries |
| `POST` | `/wishlist/items` | Save a product by `productId` |
| `DELETE` | `/wishlist/items/:productId` | Remove a saved product |
| `GET` | `/addresses` | List the signed-in customer's addresses |
| `POST` | `/addresses` | Create an address; fields include recipient, phone, address lines, city, postal code and country |
| `PUT` | `/addresses/:id` | Update an owned address or mark it as default |
| `DELETE` | `/addresses/:id` | Delete an owned address |

## Admin operations

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Dashboard counts, recent orders, sales buckets, and top products |
| `GET` | `/admin/orders` | List orders for the admin order screen |
| `PUT` | `/admin/orders/:id/status` | Update an order status |
| `GET` | `/admin/settings` | Retrieve store identity, support contacts, and announcement settings |
| `PUT` | `/admin/settings` | Save store settings; all editable fields are validated on the server |
| `GET` | `/users` | List customer accounts |
| `GET` | `/users/:id` | Retrieve one customer's profile, addresses, and order history |
| `PUT` | `/users/:id` | Update customer fields or block/unblock an account |
| `GET` | `/admin/reports/orders.csv` | Download the order ledger as a spreadsheet-safe CSV |

`GET /content/store-settings` is public and returns the store name, support contact, and enabled announcement for the storefront.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/admin/reviews?status=pending` | List reviews for moderation (status is optional) |
| `PUT` | `/admin/reviews/:id/status` | Set review status to `approved`, `rejected`, or `pending` |
| `DELETE` | `/admin/reviews/:id` | Delete a review and recalculate its product rating |
| `GET` | `/admin/inventory?stock=low&search=...` | List active inventory; `stock` accepts `low` or `out` |
| `POST` | `/admin/inventory/:id/adjust` | Adjust stock with `{ "delta": 5, "reason": "...", "variantSku": "..." }`; variant SKU is optional |
| `GET` | `/admin/inventory/:id/history` | View up to 100 recent stock movements |
| `GET` | `/admin/coupons` | List coupons and usage counts |
| `POST` | `/admin/coupons` | Create a fixed or percentage coupon |
| `PUT` | `/admin/coupons/:id` | Update coupon configuration |
| `DELETE` | `/admin/coupons/:id` | Disable a coupon |
| `POST` | `/coupons/validate` | Validate a coupon against the signed-in customer's server cart |
| `POST` | `/newsletter` | Subscribe an email address to ShopNest updates (rate limited) |

## CMS routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/content/banners?placement=home_hero` | Retrieve active, date-valid banners for a placement |
| `GET` | `/content/pages/:slug` | Retrieve a published content page |
| `GET` | `/admin/banners` | List all storefront banners |
| `POST` | `/admin/banners` | Create a banner with an HTTPS image URL |
| `PUT` | `/admin/banners/:id` | Update banner content and schedule |
| `DELETE` | `/admin/banners/:id` | Disable a banner |
| `GET` | `/admin/pages` | List content pages, including drafts |
| `POST` | `/admin/pages` | Create a content page |
| `PUT` | `/admin/pages/:id` | Update page content or publish state |
| `DELETE` | `/admin/pages/:id` | Unpublish a page |

Public pages render as plain text. Banner images must use HTTPS; CTA targets accept internal paths or HTTPS URLs.

`GET /admin/dashboard` returns paid revenue, active customer/product/order counts, pending and low-stock counts, the last 12 monthly and 30 daily revenue buckets, top-selling items, order status totals, and recent orders. Revenue excludes unpaid, cancelled, and refunded orders. Cash-on-delivery orders are counted as paid after an admin marks them delivered.

New customer reviews remain pending until approved. Product ratings and public review lists include approved reviews only. Inventory adjustments are whole-number deltas with a required reason and cannot reduce available stock below zero.
