# Data Synchronisation

## Concurrent Edits

If two devices edit different pieces of content, new versions can be created and synced fine, but there are
potential issues when clients are concurrently editing the same content. In Localful, this situation is
handled right now by simply using "last write wins", for example:

Given `Device A` and `Device B` are both editing `Item 1` and both start online:
- `Device A` creates `version 1` and uploads this to the server.
- `Device B` is notified of the new version and downloads this.
- `Device B` now edits `version 1` and creates `version 2` and uploads this to the server, `Device A` will download this version.
- If both devices are online and concurrently edit `version 2` we will end up with `version 3a` and `version 3b`. These versions will be synced between devices
and both devices will use whichever version is newer, using the version `createdAt` timestamp.
- If `Device B` goes offline `Device A` may create versions `version 3a`, `version 4a` and `version 5a` but if a week later `Device B` creates `version 3b` and then comes back online, all versions will be synced and `version 3b` will be used by both devices.

**Important Notes**
- In reality versions are identified via a UUID, the sequential `version 3x` style above was just used to help the explanation.
- This system may appear to cause "data loss" in the example above as the content of `version 3a/4a/5a` is lost, however that data still exists in 
the version history that the user can access should this be required.

**Future Improvements**  
This "last write wins" system is very simplistic, which is both a big advantage and a weakness. Some potential future improvements are:
- Versions could be saved with a reference to the previous version, which could help to visualise the history or prioritise versions with more history.
- Localful could expose some form of "merge" feature to allow devices to handle new/conflicting versions.

## Vault States

Vaults can be backed up to the cloud and synchronised between devices by using a Localful server.

Vaults can exist in one of three states:
- Local device only
- Server only
- Synced between local device and server (and other devices)

There are three pieces of information which are used to determine what state a given vault is in:
- Presence on the server
- Presence on the local device
- If the "syncEnabled" flag is set on the local vault

The current state can then be derived like so:
- Present ONLY on the server = Server only
- Present ONLY on local device = Local only
- Present on local device AND "syncEnabled" = Sync with server, but initial sync hasn't happened yet
- Present on local device AND server AND "syncEnabled" = Sync to server
- Present on local device AND server, but NOT "syncEnabled" = Not a valid state

A vault can be transitioned between each state:
- Sync can be enabled for a local vault by setting "syncEnabled"
- A vault can be made local only by deleting the server vault AND unsetting "syncEnabled" ON ALL DEVICES
- A server vault can be added to a device for syncing by creating the vault locally with "syncEnabled" set
- A vault can be removed from the local device (but keeping it on server) by just deleting the local vault


## Storage Limits
- Devices may choose to automatically delete old content versions, for example to handle device storage limits.
- The server does manage its own storage limits, and when connecting to a server the device should ideally just sync with the server and let it manage deleting old versions.
- There are a number of limits the server can impose, not all of which are relevant for data sync:
  - Maximum number of vaults per user
  - Maximum item size (measured for each content version, defined as the size of the `protectedData` field)
  - Maximum version count per item
  - Maximum vault size (measured as the sum of all content)

## Sync Protocol
- Fetch the latest user info from `/v1/users/:id [GET]`
- Fetch all vaults from `/v1/vaults [GET]`
- Load all device vaults
- Compare local and remote vaults and then:
  - Upload any new vaults to the server
  - Fetch any new server from the server
- For each vault that now requires sync:
  - Fetch latest server snapshot from `/v1/vaults/:id/snapshot`
  - Load local snapshot
  - Compare local and remote snapshot to get the lists: `itemsToSync`, `itemsToDelete`, `itemsToUpload`
  - For each `itemsToDelete`, delete the item.
  - For each `itemsToSync`:
    - Compare local and remote versions (from snapshots) to get the lists: `versionsToDownload`, `versionToUpload`, `versionsToDelete`
    - For each `versionsToDelete`, delete the version.
    - For each `versionsToDownload`, download the version and update item latest version if required.
    - For each `versionToUpload`, upload the new version to the server.
  - For each `itemsToUpload`:
    - Upload the item to the server
    - Upload all versions to the server
- For each vault to upload
  - Upload to the server
  - Upload all items and item versions
