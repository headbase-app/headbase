/**
 * Error identifiers
 */
export enum ErrorIdentifiers {
  // General Errors
  NOT_FOUND = "not-found",
  SYSTEM_UNEXPECTED = "system-unexpected-error",
  REQUEST_INVALID = "request-invalid",

  // Access Errors
  ACCESS_UNAUTHORIZED = "access-unauthorized",
  ACCESS_FORBIDDEN = "access-forbidden",

  // Resource Errors
  RESOURCE_NOT_FOUND = "resource-not-found",
  RESOURCE_NOT_UNIQUE = "resource-not-unique",
  RESOURCE_RELATIONSHIP_INVALID = "resource-relationship-invalid",

  // Auth Errors
  AUTH_CREDENTIALS_INVALID = "auth-credentials-invalid",
  AUTH_TOKEN_INVALID = "auth-token-invalid",
  AUTH_NOT_VERIFIED = "auth-not-verified",
  AUTH_ALREADY_VERIFIED = "auth-already-verified",

  // User Errors
  USER_REGISTRATION_DISABLED = "user-registration-disabled",
  USER_EMAIL_EXISTS = "user-email-exists",
  USER_NOT_FOUND = "user-not-found",

  // Vault Errors
  VAULT_NOT_FOUND = "vault-not-found",
  VAULT_NAME_EXISTS = 'vault-name-exists',

	// Files and Chunks
	FILE_NOT_FOUND = "file-not-found",
	FILE_NOT_COMMITTED = "file-not-committed",
	FILE_ALREADY_COMMITTED = "file-already-committed",
	CHUNK_NOT_FOUND = "chunk-not-found",
}
