# SQLite (SQLite3MultipleCiphers)

This folder contains the Javascript for SQLite WASM, with added support for encrypted storage via https://github.com/utelle/SQLite3MultipleCiphers.

These files were downloaded from https://github.com/utelle/SQLite3MultipleCiphers/releases/tag/v2.1.0.

SQLite WASM is [released into the public domain](https://www.sqlite.org/copyright.html) and SQLite3MultipleCiphers (and these files) is [licensed under the MIT license](https://github.com/utelle/SQLite3MultipleCiphers/blob/main/LICENSE).

## WASM loading
The `sqlite3.wasm` and `sqlite3-opfs-async-proxy.js` files have also been copied to `public/assets/`!  

These files are loaded as expected during dev mode, however when the app is built SQLite
requests these files from the `/assets/` public folder (the Vite build itself).
At that point they have been transformed and renamed by the Vite build tooling and so can't be found.  

Copying the file directly into the public assets fixes this issue, however long-term it would be better to find 
a way to stop these files being transformed, or find a way for SQLite to load the files with the Vite build hash.
