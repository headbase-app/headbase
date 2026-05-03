# Application Library
This folder contains the core web application library which is shared between all platforms (desktop, mobile and web).

The mobile and desktop projects import the library via the workspace package `@headbase-app/lib`, however the `web` project
imports directly from the `lib` directory using an alias.
This allows the web project to be used to develop and test the library without the need for any packaging, and desktop/mobile
then use the packaged version without any of the extra PWA code.

The application library is packaged by just copying the `packages/web/lib` folder into the `@headbase-app/lib` package.
