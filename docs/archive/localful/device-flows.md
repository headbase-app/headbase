# Device Flows
How Localful devices work

## Data Storage
- **Session Storage** - Short term storage like sessionStorage and in memory
  - Account:
    - `accessToken` - in memory only
  - Network:
    - `networkStatus` - `online` or `offline`
  - Application:
      - `currentVault` - vault id
- **Device Storage** - Persistent storage like IndexDB, localStorage etc
  - Server:
    - Server URL
    - Server Metadata - storage limits etc
  - Account:
    - Current User
    - Refresh Token
  - Application:
    - `hasOnboarded` - `true` or `false`/`undefined`
    - `hasStoragePermissions` - `true` or `false`/`undefined`
    - `currentCloudVaults` - list of known cloud vaults
  - Data:
    - Vaults
    - Content
    - Content SystemInfo



### Initial Setup
- go through initial setup
- set initialSetup flag in device storage
- ?

### Log In / Sign Up
- Retrieve account and auth tokens, set account in device storage.
- Move onto server init

### Expired Session
- re-authenticate user on login screen, set account in device storage
- move to server init

### Loading logged-in app
- Load account from device, refresh session
- go to server init

### Expired Session

### Server Init
- Sync user account
- Sync vaults
-

### Vault Sync
