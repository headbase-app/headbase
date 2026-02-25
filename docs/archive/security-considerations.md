# Local Security

## Localful Features
- Never persisting unencrypted data - Encryption keys and content are stored encrypted in localStorage and/or IndexDB, so the user `passcode` or user `password` is required to load content into memory when the app loads.

## Recommended App Features
- HTTPS - ANy web apps should be served over HTTPS (required by the Web Crypto API anyway).
- Content Security Policy (CSP) Headers - These should be used to prevent untrusted scripts and resources loading and/or executing on the page.
- Subresource Integrity (SRI)? - TODO
- Not using any CDN, analytics or monitoring service - Apps should avoid using external dependencies or CDN services.
- Local-first PWA - A PWA approach can be used to caches assets and allow for offline use. This means the app is not loaded from the server every time.
- A password strength tool ([zxcvbn](https://www.npmjs.com/package/zxcvbn)) is used to encourage strong passwords when setting up the app.
