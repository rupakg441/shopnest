# Phase 5: cart, wishlist, and addresses

## Behavior

Signed-in customers keep carts, wishlists, and saved addresses in MongoDB. Cart items reference products and store only quantity and selected options; displayed prices and totals are derived from current catalog values, never accepted as trusted client totals. Guest cart state remains local and can be used until the customer signs in. Address records belong to one user and support default shipping/billing selection.

## Data model

`Cart` remains one document per user with product references and selected variant values. A unique `Wishlist` document per user contains product references. `Address` stores owner, recipient, contact, postal address, address type, and default flag, with an index for user/default lookups.

## Endpoints

- `GET/DELETE /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/:productId`
- `GET /api/wishlist`, `POST /api/wishlist/items`, `DELETE /api/wishlist/items/:productId`
- `GET/POST/PUT/DELETE /api/addresses`

The account dashboard manages multiple saved addresses and a default address. Authenticated cart and wishlist state hydrate into the customer UI from the API; guests retain a local cart. Cart/order variant matching requires the exact selected size and color combination.
