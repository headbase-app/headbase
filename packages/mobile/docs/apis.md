# Application APIs Reference
A reference of APIs used by the frontend web application.

## DeviceAPI
Get details about the current device context and environment.

### getIdentity
### getContext
### getEnvironment

## VaultsAPI
Query and manage vaults.

### create
### update
### delete
### get
### liveGet
### query
### liveQuery

## WorkspaceVaultAPI
Control the current vault opened by the application workspace.

### open
### openNewContext
### close
### get
### liveGet

## FilesAPI
Read and write to the filesystem.
All implementations MUST protect against arbitrary file access at the platform layer. The expectation is that this
relies on native permissions on mobile, and custom logic on desktop.

### tree
### ls
### mv
### cp
### rm
### mkdir
### read
### write
### checkPermissions
### requestPermissions
### liveLs
### liveTree
### liveRead

## FileQueryAPI
### query

## WorkspaceAPI
Manage open workspace panels.

### openPanel
### closePanel
### movePanel
### switchMode
