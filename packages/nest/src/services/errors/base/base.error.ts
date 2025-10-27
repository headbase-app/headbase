/**
 * Configuration to pass to all errors.
 */
export interface ErrorConfig {
	/** An optional identifier that can be used to specifically identify the error. */
	identifier?: string;

	/** The internal error message. */
	message?: string;

	/** An application-level message that can be exposed to the user. */
	userMessage?: string;

	/** The original error or context on why the error is being thrown. */
	cause?: any;
}

/**
 * The base error that all other errors inherit from.
 */
export class BaseError extends Error {
	identifier?: string;
	userMessage?: string;

	constructor(config?: ErrorConfig) {
		super(config?.message);

		this.identifier = config?.identifier;
		this.userMessage = config?.userMessage;
		this.cause = config?.cause;
	}
}
