# Testing

The layered architecture approach used by Headbase allows for different types of testing for example:
- Web Application Layer
  - Unit testing using vitest, Playwright and Storybook
  - E2E testing using Playwright
- Platform layer
  - Unit testing using vitest
- Native device testing
  - End-to-end & unit testing using WebdriverIO


Idea for native unit testing:
- a special project at "native/testing" which is acts as a custom test harness
- it would be a separate capacitor app which implements tests of the platform code to be ran on the native/emulated devices
- it would likely not be fully automated and some manual setup and test steps would be required, but it allows real environment testing
