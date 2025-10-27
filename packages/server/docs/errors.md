# Error handling

NestJS provides built-in exception filters and provides base exceptions like [HttpException](https://docs.nestjs.com/exception-filters) and [WsException](https://docs.nestjs.com/websockets/exception-filters),
however this requires leaking controller level concerns (like HTTP status codes) to wherever you want to throw errors.

Most errors will be thrown in services which are not tied to any specific controller type, therefore custom exception filters and error hierarchy has been created instead which can be found in `@services/errors`.

## Errors
- All errors have an `identifier`, `message` (internal), `userMessage` (can be returned to users) and `cause` defined in `BaseError`.
- All errors inherit from `SystemError` which defines an unexpected error and `UserError` which defines an expected error like validation, authentication etc
