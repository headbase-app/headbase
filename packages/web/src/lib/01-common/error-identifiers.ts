/**
 * Error identifiers
 */
export enum ErrorIdentifiers {
  // General Errors
  SYSTEM_UNEXPECTED = "system-unexpected-error",
	INVALID_OR_CORRUPTED_DATA = "invalid-or-corrupt-data",
	INVALID_PASSWORD_OR_KEY = "invalid-password-or-key",

  // Database Errors
  DATABASE_NOT_FOUND = "database-not-found",
  DATABASE_EXISTS = 'database-exists',
}
