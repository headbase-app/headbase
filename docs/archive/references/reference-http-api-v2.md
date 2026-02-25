# HTTP API Reference V2
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

## Authentication & Authorization
The server does not currently implement any authentication or authorisation, instead a static "server admin secret" is
used to grant access to all server actions and resources.

In future the plan is to support authentication by using public keys to identify bases and then public-private key encryption
for connecting devices to prove ownership of the given base.

## API Reference

### Root
- `/ [GET]`
- `/v1 [GET]`

### Server Management
- `/v1/info [GET]`
- `/v1/health [GET]`
- `/v1/settings [GET, PATCH]`

### Bases
- `/v1/bases [GET, POST]`
- `/v1/bases/:baseId [GET, PATCH, DELETE]`

### History
- `/v1/history/:baseId [GET, POST]`
- `/v1/history/:baseId/:versionId [GET, DELETE]`
