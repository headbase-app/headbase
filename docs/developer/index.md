# Developer Documentation

## Basics
Headbase is developed using web technologies which allow for easy code reuse across all platforms.
The core architectural principle is to split code between the "application layer" and the "platform layer".

The "application layer" is the shared application and library code which runs on all platforms in a browser runtime.
This includes shared types, API interfaces, frontend components and most user-facing application functionality.
The "platform layer" is the platform specific bindings between the application and the underlying platform (desktop, mobile or web).
This includes things like filesystem access, app data storage, device access etc.

A shared set of generic API interfaces are defined in the application layer, then each platform creates its own application
and injects the platform specific implementations of these APIs.

## Project Structure
The project is a monorepo containing multiple packages/projects:
- `packages/web` (`@headbase-app/web`) - The demo web app, built using Vite.
- `packages/desktop` (`@headbase-app/desktop`) - The desktop platform, built using Electron. This is also where the shared "application layer" library code is developed.
- `packages/mobile` (`@headbase-app/mobile`) - The mobile platform, built using Capacitor.
- `packages/lib` (`@headbase-app/lib`) - The packaged application layer library extracted from the desktop project, used by the `web` and `mobile` platform projects.

## Way of Working
- The application is developed primarily in `packages/desktop`, including the shared "application layer" code.
- `packages/lib` then copies the library code from `packages/desktop` and exposes it for use by `packages/web` and `packages/mobile`.
- In future the plan is that the application layer development will likely shift to the `packages/web` project. Desktop is currently used as it's the easiest platform to create and edit test data on.

## Common Issues
- Ensure the application layer never leaks into the platform layer, for example SolidJS proxy objects should always be unwrapped when being passed to API methods.
- APIs should be considered across all platforms before being fully implemented. If in doubt, start with mobile as it generally has the most restrictive APIs.
