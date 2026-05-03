# `@headbase-app/lib`
This folder contains the core Headbase web library which is shared between the web app, desktop and mobile.

The package is developed as part of the web application in `/packages/web/lib` and is then copied and packaged separately for use on other platforms.
The mobile and desktop projects import the package via a local `./vendor/headbase-app-lib-x.y.z.tgx` file.
