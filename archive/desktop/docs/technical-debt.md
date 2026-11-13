# Technical Debt

## NPM config allow-git=all required at root to allow
Electron Forge uses `@electron/rebuild` which installs `@electron/node-gyp` via git (@electron/node-gyp@git+https://github.com/electron/node-gyp.git#06b29aafb7708acef8b3669835c8a7857ebc92d2).
This isn't ideal, especially as with the NPM workspace setup it seems to require setting this for all packages.

In future, consider learning more about and picking Electron tools which fit

## `@headbase-app/lib` types/schemas must be imported via direct reference within native Electron code
In order to prevent web only code/dependencies like pdfjs-dist being loaded within Node.js and causing issues, within
native Electron code (main/preload) it is required to directly import types/schemas like so: `@headbase-app/lib/dist/02-apis/vaults/vault.ts`.
This skips the main package index file which also exports SolidJS components and web-only functionality.

In future consider cleanly splitting `@headbase-app/lib` to allow access to common types/schemas without web only code.
This could perhaps be done via different packages or separate entry points within the library package.
