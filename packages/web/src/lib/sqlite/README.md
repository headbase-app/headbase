# SQLite (SQLite3MultipleCiphers)

This folder contains the Javascript for SQLite WASM, with added support for encrypted storage via https://github.com/utelle/SQLite3MultipleCiphers.

These files were copied from https://github.com/utelle/SQLite3MultipleCiphers/releases/tag/v1.9.0.

SQLite WASM is [released into the public domain](https://www.sqlite.org/copyright.html) and SQLite3MultipleCiphers (and these files) is [licensed under the MIT license](https://github.com/utelle/SQLite3MultipleCiphers/blob/main/LICENSE).

## WASM loading
The actual `sqlite3.wasm` file is located at `public/assets/sqlite3.wasm` and is copied into the build as-is.  
The `/assets/` folder is used to match the build output folder of Vite, and the WASM file is placed directly in the public
folder to bypass all build optimizations.  
When the WASM file was places in this source directory, it was getting transformed during build and I couldn't get any configuration working to prevent this.
