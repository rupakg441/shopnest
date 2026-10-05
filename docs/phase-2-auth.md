# Phase 2: authentication and authorization

## Behavior

Registration creates a customer account and sends a one time email verification link; public registration cannot assign a privileged role. Configure SMTP in `be/.env`; local development prints verification and reset links to the backend console when SMTP is not configured. Customer and admin login share credential validation, with the admin endpoint additionally checking the account role. Access tokens are short lived and held in frontend memory. A rotating refresh JWT is returned only as an HTTP-only cookie; MongoDB stores its SHA-256 hash and expiry on the user record so sessions can be rotated and revoked. Logout clears the cookie and stored session hash. Password reset links expire after 30 minutes, and password changes revoke refresh sessions.

Protected API routes load the active user from MongoDB. Admin routes allow only `admin` and `superadmin`; existing `user` role values remain compatible as customer accounts. The React router protects account and admin layouts and sends unauthenticated visitors to login.

## Database changes

The existing `User` document remains the identity record. This phase adds the `customer`, `admin`, and `superadmin` role values, account enabled state, email-verification and password-reset token hash/expiry fields, and internal refresh-token hash/expiry fields. Existing `user` and `admin` documents remain valid. No raw refresh or one-time token is persisted.

## Routes

- `POST /api/auth/register`, `/login`, `/admin/login`
- `POST /api/auth/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/resend-verification`, `/verify-email`
- `GET /api/auth/me`
- Existing protected profile, cart, order, and admin routes continue to use bearer access tokens.
