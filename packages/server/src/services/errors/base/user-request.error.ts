import { BaseError } from "./base.error.js";

/**
 * An expected error thrown by the application.
 *
 * This can be used when the error could occur
 * during normal operation such as invalid input etc.
 */
export class UserRequestError extends BaseError {}
