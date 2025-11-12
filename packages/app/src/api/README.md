# APIs
This folder contains internal and external services used by the application and plugins.
These are "vanilla" javascript services which are then separately integrated with framework-specific code.

The naming convention pattern used is "<x>Service" for internal services and "<x>API" for services exposed to plugins.

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
