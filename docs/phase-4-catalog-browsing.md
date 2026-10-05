# Phase 4: catalog browsing

Customer catalog filters now call the REST API for search, category, brand, price ceiling, rating, sort order, and page. The API returns a bounded page plus total counts. Available category and brand choices are loaded from persisted catalog data. Product details use stored image galleries, discount and variant prices, stock availability, saved specifications, related products, and purchase-verified reviews.

The current API keeps the earlier `image` and `price` fields available for existing records and storefront components. When no variants are selected, a valid discount price is used as the customer-facing price.
