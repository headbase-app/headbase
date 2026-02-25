# Framework
This folder contains framework specific integrations for using API services in UI code.

The framework being used is currently React, so this folder contains:
- An IoC container context and hook (useDependency)
- Hooks which then expose the `live*` methods of APIs via hooks such as `useVault`, `useFile` etc.
