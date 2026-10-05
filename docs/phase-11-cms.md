# Phase 11: CMS foundations

Admins can create, schedule, reorder, edit, and disable storefront banners. The home hero reads the highest-priority active `home_hero` banner. Banner image URLs must use HTTPS, and CTA links are restricted to relative paths or HTTPS URLs.

Admins can draft, publish, edit, and unpublish slug-based information pages. Published pages are available to the storefront as plain text, avoiding unsafe HTML rendering. Footer privacy and terms links resolve to the CMS page route.

The implementation does not include rich text editing, page revision history, or upload management for CMS images. See the [API reference](api/README.md) for CMS endpoints.
