# Server Testing
The main type of testing used for the API right now is End to End (E2E) testing, meaning I'm not testing
individual units of the application, instead I'm testing the API functionality itself via HTTP requests & responses.  
Some unit tests are also used where E2E tests are harder to implement such as websocket functionality.

This approach means tests focus on the **functionality itself** rather than implementation details, which makes
them more resilient to internal refactoring, and ensures testing focuses on how real users interact with the system.

All tests should follow these rough guidelines:
- Every test should be able to be run independently. In practice this means not relying on database content
  created by other tests.
- Tests should be written against public interfaces not internals where possible (basically, favour E2E tests).

## Test File Locations
Test files follow the pattern `<name>.e2e.test.ts` or `<name>.unit.test.ts` and should be located near the code
that they test rather than being seperated in a `tests` folder or similar.

## Tooling and Helpers
[Jest](https://jestjs.io/) is the testing framework used, with [supertest](https://github.com/ladjs/supertest) being used for interacting with the API.  
A test helper exists in `./test-utils/test-helper.ts` which handles bootstrapping the server, setting up and
tearing down the db content before each test and mocking the JWKS validation.  

An E2E test template is available at `./tests-utils/test-template-e2e.ts` which includes all the setup required to write an E2E tests file.

### Test Data
Test data is populated in `tests/test-data.ts`.

#### Seed Data
`seedProfiles` and `seedChanges` data is reset in the database after each test,
meaning each test can rely on this data already existing in the database as defined.  

#### Test Case Data
`testCaseProfiles` and `testCaseChanges` data is removed if present in the database after each test, but will
not be added automatically, meaning this data can be used to test things like creating content.
