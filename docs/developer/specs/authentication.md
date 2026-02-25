# Server Authentication
Server authentication is done via access and refresh tokens. Here's a basic overview:

1. A user's login details are sent to `/auth/login`. If correct an access token and refresh token pair are returned.
2. The access token is short-lived and can be used as a bearer token to authorize API requests.
3. The refresh token is long-lived and can be used to retrieve a new access token from `/auth/refresh` when the old one expires.
    - When a client requests a new access token they also receive a new refresh token and their old refresh and access tokens can no longer be used.
4. If a user wishes to log out, their current refresh token can be sent to `/auth/logout` and their tokens will be blacklisted until they expire.

The rotation of refresh tokens as soon as they're used reduces the risk of having long-lived tokens while still
allowing for a convenient user experience where users don't have to constantly re-authenticate.

## Implementation Details
When the server creates a token pair for the first time (access and refresh token) it does two important things:
- generates a random "session id" value which is added to both tokens as the "sid" claim.
- sets a "counter id" value of 1, adds it to both tokens as the "cid" claim, and then persists this counter on the server.

### Request Validation
When validating the requests bearer token, in addition to checking the token is valid (signed correctly and not expired) the system will also check:
- the session ID (sid claim) of the token should not be blacklisted
- the counter ID (cid claim) of the token should match the currently stored counter ID for that token group

### Refresh Token Rotation
When a user requests a new access token they also receive a new refresh token and their old refresh token is blacklisted.  
Storing every blacklisted token would quickly become unmanageable as refresh tokens are long-lived. This problem is solved
by incrementing the counter ID value stored on the server and adding this updated value to the counter ID (cid) claims of the refreshed tokens.  
This means that if an attempt is made to re-use any previous tokens, the counter ID will be old and therefore the request will be rejected.  
The session ID (cid claim) remains the same between the old and new token pair.

### Token Revocation
In order to facilitate immediate logout the server can blacklist tokens. It does this by blacklisting the "session id" value
of the given token pair which will blacklist all access and refresh tokens at the same time.

## Potential Improvements
- Storing a blacklist flag and counter ID on the server effectively makes the JWT no longer stateless. Given this is the case, could a form of server managed sessions just be used instead?
- Right now these tokens are returned to the user as JSON responses and will be stored in local storage/regular cookies by web applications. Should HTTP only cookies be used instead?
  - If the tokens are saved in HTTP only cookies they will be sent on every request, which seems to defeat the purpose of having a refresh token as it will always be sent anyway?
