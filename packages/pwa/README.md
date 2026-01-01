# `@headbase-app/pwa`

The Headbase progressive web app (PWA) deploying to [headbase.app](https://headbase.app), built using [Vite](https://vitejs.dev/) and [Solid](https://www.solidjs.com/).

## Prerequisites
- Node.js/NPM installed at the latest LTS version
- If developing sync features, a server set up locally or on a hosting provider (see [`packages/server`](../server)).

## Quick Start
- Run `npm install`
- Run `npm start` to start the web app dev server
- Run `npm run build` and `npm run preview` to build and preview the production web app build

## Testing
Vitest is used for unit testing and Playwright is used for E2E browser testing.

### Setup
1. Run `npm run test:e2e:setup` to ensure Playwright is installed correctly.
	- If you're using Linux, you may also have to run `npx playwright install-deps`

### Usage
- `npm run test:unit` to run all unit tests
- `npm run test:e2e` to run headless E2E tests
- `npm run test:e2e:ui` to open E2E testing in the Playwright UI
- `npm run test:e2e:report` to open the latest Playwright report
