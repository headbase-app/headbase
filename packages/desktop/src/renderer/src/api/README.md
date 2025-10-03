# APIs
This folder contains API services used by the core application UI and plugins.
These are vanilla javascript services which then integrate with platform-specific code to provide functionality.

For this Electron application, the services integrate with each other and call `window.platformApi` which is exposed
via Electron in `src/main` and `src/preload` for accessing the desktop file system, native OS integrations etc

## Reference
- VaultsAPI
	- create
	- update
	- delete
  - get
	- query
  - liveGet
  - liveQuery
- CurrentVaultAPI
  - open
  - openNewWindow
  - get
  - close
  - liveGet
- DeviceAPI
  - getIdentity
  - getCurrentContext
  - getEnvironment
- FilesAPI
  - tree
  - ls
  - mkdir
  - mv
  - cp
  - rm
	- read
	- write
  - liveLs
  - liveTree
  - liveRead
- FilesQueryAPI
	- query
- HistoryAPI
  - get
  - query
  - delete
- ServerAPI
	- register
	- login
	- logout
	- getUser
	- updateUser
	- deleteUser
	- createVault
	- updateVault
	- deleteVault
	- getVaults
	- getServerInfo


- WorkspaceAPI
  - registerEditor
  - registerPanel

### Internal Services
- EncryptionService
- EventsApi
- StorageService
