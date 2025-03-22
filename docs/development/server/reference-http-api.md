	# HTTP API Reference
An overview of the HTTP API.

## Errors
Any errors will be returned with the appropriate status code and the following JSON data:

```json5
{
  "statusCode": 404, // a copy of the HTTP status code.
  "identifier": "resource-not-found", // an identifier for the specific error.
  "message": "An error occurred.", // a message explaining the error.
  "context": null // an optional property of any type which may contain extra information about why the error occurred.
}
```

## API Reference

### Base
- `/ [GET]`
- `/v1 [GET]`

### Server
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
- `/v1/vaults/:vaultId/snapshot [GET]`

### Object Versions
- `/v1/versions [GET, POST]`
- `/v1/versions/:versionId [GET, DELETE]`
