# Technical Debt
A record of known technical debt.

## vi.mock seems to be picking up type of protected properties

## E2E Tests of WebSockets are flaky
- Can sometimes get different results when running full suite vs single test.
    - Should be ok due to not running parallel tests, but seems to not be the case.
    - Issues could potentially be caused by connection health check running at different times during the test?
    - Could try crating and closing server in each test, rather than in beforeEach/afterEach?
- expect helper functions call `ctx.expect.fail` but this doesn't seem to fail the test, instead the test passes and an unrejected error is returned later
- expect tests within promise/callbacks such as `inspectMessagesForDuration` require `expect.soft` to run. It is not entirely clear why this is the case.
