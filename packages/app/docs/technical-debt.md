# Technical Debt
A record of know technical debt, code smells, and temporary/workaround solutions that may need to be revisited in the future.

### `lucide-solid` - the app doesn't load at all and/or is very slow in dev mode
Vite does not tree-shake by default in dev mode and so ALL icons from `lucide-solid` are loaded.
This in itself causes a massive slowdown, but to add even more fun this includes loading the `fingerprint` icon which
can be caught by ad blocking software as a tracking script and blocked, breaking the entire app!

Thanks to https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server for a solution which fixes both
these issues, which is to configure custom path aliases for `lucide-solid` so icons can be individually imported.

References:
- https://github.com/lucide-icons/lucide/issues/2398
- https://github.com/vitejs/vite/issues/8237
- https://github.com/lucide-icons/lucide/issues/2398
