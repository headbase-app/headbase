# `@headbase-app/lib`
This folder contains the core Headbase web library which is shared between all device apps (web, desktop and mobile).

The package is developed as part of the desktop application in `/packages/desktop/lib` and is then copied and packaged separately in `pacakges/lib` for use in other device apps.
The web and desktop projects import the package via a local `./vendor/headbase-app-lib-x.y.z.tgx` file.
