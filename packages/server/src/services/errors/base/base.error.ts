/**
 * Configuration to pass to all errors.
 */
export interface ErrorConfig {
  /** An optional identifier that can be used to identify the error. */
  identifier?: string;

  /** The internal error message. */
  message?: string;

  /** An application message that can be exposed to the user. */
  applicationMessage?: string;
  // todo: rename this to userMessage to be clearer?

  /** The original error thrown if applicable. */
  originalError?: any;
}


/**
 * The base error that all other errors inherit from.
 */
export class BaseError extends Error {
  identifier?: string;
  applicationMessage?: string;
  originalError?: any;

  constructor(config?: ErrorConfig) {
    super(config?.message);

    this.identifier = config?.identifier;
    this.applicationMessage = config?.applicationMessage;
    this.originalError = config?.originalError;
  }
}
