# API Authentication
Authentication and user management is not handled by the server itself,
instead the server validates tokens supplied by a third party identify provider
such as [Logto](https://logto.io/).

**IMPORTANT NOTE:** Although in theory the server should support any provider that supplies
a valid JWT and has a JWKS endpoint, it is only actively developed and tested using [Logto](https://logto.io/) at this time.

The server expects the supplied JWT token to have:
- The `sub` (subject) claim, which is used as the `userId` value of the requesting user.
- The `scope` claim which controls what resources and actions the user is capable of (see below).
- The `iss` (issuer) and `aud` (audience) claims, which are validated alongside the token itself.

## Scopes / Permissions
The server expects the identity provider to be using Role-Based Access Control (RBAC) or similar, where each role is assigned
a list of scopes/permissions.  
It is expected that the scopes/permissions for the user will be included within the access token in the `scope` claim like so:
`"scope": "profiles:create:self profiles:retrieve:self..."`.  

The scopes used by the API for access control are as follows:

| Scope             | Description                 |
|-------------------|-----------------------------|
| `profiles:create:self` | Create own profile          |
| `profiles:retrieve:self` | Retrieve own profile        |
| `profiles:update:self` | Update own profile          |
| `profiles:delete:self` | Delete own profile          |
| `profiles:create` | Create any profile          |
| `profiles:retrieve` | Retrieve any profile        |
| `profiles:update` | Update any profile          |
| `profiles:delete` | Delete any profile          |
| `changes:create:self` | Create own changes          |
| `changes:retrieve:self` | Retrieve own changes        |
| `changes:delete:self` | Delete own changes          |
| `changes:create` | Create changes for anyone   |
| `changes:retrieve` | Retrieve changes for anyone |
| `changes:delete` | Delete changes for anyone             |

The suggested roles (although the server only actually cares about the scopes) are as follows:

| Role          | Scopes                                                    |
|---------------|-----------------------------------------------------------|
| Regular User  | All `:self` restricted scopes                             |
| Administrator | All `:self` restricted scopes AND all unrestricted scopes |
