# HTTP API Reference
An overview of the HTTP API.

## Errors
Any errors will be returned with the appropriate status code and the following JSON structure:

```json5
{
  "statusCode": 404, // a copy of the HTTP status code.
  "identifier": "resource-not-found", // an identifier for the specific error.
  "message": "An error occurred.", // a message explaining the error, for developers not users.
  "context": null // an optional property of any type which may contain extra information about why the error occurred.
}
```

## API Reference

### Base
- `/ [GET]`
- `/v1 [GET]`

### Server Management
- `/v1/server/info [GET]`
- `/v1/server/health [GET]`
- `/v1/server/settings [GET, PATCH]`

### Users
- `/v1/users [POST, GET]`
- `/v1/users/:userId [GET, PATCH, DELETE]`

### Authentication
- `/v1/auth/login [POST]`
- `/v1/auth/refresh [POST]`
- `/v1/auth/logout [POST]`
- `/v1/auth/check [GET]`
- `/v1/auth/verify-email [GET, POST]`
- `/v1/auth/change-email [GET, POST]`
- `/v1/auth/reset-password [GET, POST]`

### Vaults
- `/v1/vaults [GET, POST]`
- `/v1/vaults/:vaultId [GET, PATCH, DELETE]`
- `/v1/vaults/:vaultId/chunks [GET]`

### Files
- `/v1/files [GET, POST]`
- `/v1/files/:fileId [GET, DELETE]`
- `/v1/files/:fileId/commit [POST]`
- `/v1/files/:fileId/chunks [GET]`

### File Chunks
- `/v1/chunks/:vaultId/:hash [GET, POST]`
