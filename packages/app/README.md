# `@headbase-app/app`

The cross-platform Headbase app deploying to [headbase.app](https://headbase.app), Android and iOS.

The core web application is built using [Vite](https://vitejs.dev/) and [Solid](https://www.solidjs.com/), with [Capacitor](https://capacitorjs.com/docs/basics/workflow) to provide cross-platform support.

## Prerequisites
- Node.js/NPM installed at the latest LTS version
- iOS and Android development tools as per [Capacitor's environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) (Xcode & Xcode Command Line Tools, CocaPods, Android Studio, Android SDK)
- If developing sync features, a Headbase server set up locally or on a hosting provider (see [`packages/server`](../server)).

## Quick Start
- Run `npm install`
- Run `npm start` to start the web app dev server
- Run `npm run build` and `npm run preview` to build and preview the production web app build
- Run `npm run start:android` and/or `npm run start:ios` to run the native apps (using the Capacitor CLI)
- Run `npx cap` to directly access the [Capacitor CLI](https://capacitorjs.com/docs/cli/commands/run)

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
