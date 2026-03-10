# Web Library
This folder contains the core web application library which is shared between all devices which is published as `@headbase-app/lib`.

The mobile and desktop projects import this directory via the package, however the web project (which this folder is within)
imports directory from the directory using an alias "@headbase-app/lib" rather than the actual package.
This allows the web app to be used to help develop and test the library, and other devices can then just us it.
