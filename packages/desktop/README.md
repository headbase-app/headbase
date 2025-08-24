# `@headbase-app/desktop`

The desktop application for Headbase, built using [Electron](https://www.electronjs.org), [Electron Forge](https://www.electronforge.io) and [Vite](https://www.electronforge.io/config/plugins/vite).

## Prerequisites
- Node.js installed at latest LTS version
- If developing sync features, a Headbase server set up locally or on a hosting provider.

## Quick Start
1. Run `npm install`
2. Run `npm start` to start the app in dev mode
3. Run `npm run build` to [package and make]((https://www.electronforge.io/core-concepts/build-lifecycle)) the application
   - If you're using Linux, you may need to `sudo apt install rpm` or equivalent for make to

## Testing
Vitest is used for unit testing and Playwright is used for E2E testing.

### Setup
1. Run `npm run test:e2e:setup` to ensure Playwright is installed correctly.
  - If you're using Linux, you may also have to run `npx playwright install-deps`

### Usage
- `npm run test:unit` to run all unit tests
- `npm run test:e2e` to run headless E2E tests
- `npm run test:e2e:ui` to open E2E testing in the Playwright UI
- `npm run test:e2e:report` to open the latest Playwright report
