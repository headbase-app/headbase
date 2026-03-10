/**
 * Error identifiers
 */
export enum ErrorIdentifiers {
  // General Errors
  SYSTEM_UNEXPECTED = "system-unexpected-error",
	INVALID_OR_CORRUPTED_DATA = "invalid-or-corrupt-data",
	INVALID_PASSWORD_OR_KEY = "invalid-password-or-key",

  // Vault Errors
  VAULT_NOT_FOUND = "vault-not-found",
  VAULT_EXISTS = 'vault-exists',
}
