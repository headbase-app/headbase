import { BaseError } from "./base.error.js";

/**
 * An unexpected error thrown by the application.
 *
 * This can be used when the error isn't expected
 * during normal operation.
 */
export class SystemError extends BaseError {}
