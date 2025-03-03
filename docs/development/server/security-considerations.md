# Server Security
- bcrypt is used for password hashing on the server
- Account verification via user `email` is required before users can use any server features.
- **Future** 2FA support, goal is for TOTP and WebAuthn
- **Future** rate limiting protection
- All functionality has extensive E2E test coverage, including authentication logic.
