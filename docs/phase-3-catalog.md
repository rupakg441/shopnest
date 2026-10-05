# Phase 3: category and product catalog

## Behavior

Catalog reads remain public and support search, category/brand/price/rating filters, sorting, and bounded pagination. Admin-only writes manage category hierarchy, active state, product pricing, variants, specifications, featured state, stock, and multiple images. Existing `category` names and `image` URLs remain readable for the current storefront while new fields are added compatibly.

Images are uploaded through an authenticated multipart endpoint, validated by MIME type and byte size, held in memory, then streamed to Cloudinary. The API returns Cloudinary URLs and public IDs for catalog records; Cloudinary credentials are server-only.

## Data model

Categories retain their unique display name and product count, adding a normalized slug, optional parent category reference, image, description, active flag, and display order. Products retain the existing string category and primary `image` for compatibility, adding SKU, additional image URLs, discount price, variant/specification arrays, featured flag, and active status. Compound indexes support active catalog filtering and featured products; SKU and slug are unique when present.

## Routes

- Public: `GET /api/categories`, `GET /api/products` and detail reads
- Admin: category and product create/update/delete
- Admin: `POST /api/uploads/products` and `/api/uploads/categories` with multipart `images` or `image` files
