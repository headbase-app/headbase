# Database Spec

## Principles
- Data storage & querying is a separate concern to sync/backup/history.
- From a "standard API" perspective you should be able to perform regular CRUD operations
  on documents and not care about the underlying sync/storage implementation.
- Ideally build as much as possible on a trigger/database level so other standard tools and
  apps can interact with the database and versions are still updated.

## Storage
Actors perform CRUD operations on documents
Operations are applied to versions via triggers

Versions are immutable (apart from deleted tombstone) and so can be compared and synced between devices easily via id.
The documents table can be derived from the version table consistently, meaning given the same version records all peers converge on the same documents state.

```
documents
- id (pk)
- vid
- type
- data
- blob
- createdAt
- updatedAt
- deleted

versions
- id
- vid (pk)
- type
- data
- blob
- createdAt
- updatedAt
- deleted
```

## Data Operations

### Documents

On document create
- data including id and vid supplied by actor
- createdAt/updatedAt generated
- document record created
- version record created

On document update (when type/data/blob)
- new data including new vid supplied by actor
- updatedAt generated
- document record updated
- version record created
- Don't allow update when deleted flag set?

On document update (when full record including hid, conceptually a "replace")
- assumed to be applying latest version
- document record updated
- no additional actions
- Don't allow older version to be applied?

On document delete (via tombstone update)
- new vid supplied by actor
- updatedAt generated
- document record updated to set deleted, updatedAt and remove data
- version record created
- Not SQLite DELETE as actors can't supply vid.

### Versions

On version create
- all data supplied by actor
- version record created
- replace current document if newer

On version update (when anything but deleted tombstone)
- denied update, versions are immutable

On version delete (via tombstone update)
- deleted set on version
Don't allow when version is current document version?
If current document version, update document to set deleted tombstone?

On version delete (via SQLite DELETE, conceptually a "purge")
- version deleted
Don't allow when version is current document version?

## Syncing
- Load all current versions (id, vid, updatedAt, deleted)
- Request same data from peers
- Combine and compare to create sync actions to apply:
    - Versions to create
    - Versions to delete
- Apply actions in the following order:
    - Delete first starting with newest
    - Create first starting with newest

## Purging
- Tombstone based deletion allows for propagation between peers but does
  not remove data meaning storage would always grow.
- A peer purging (fully deleting) versions while other peers still have them would result in the data being created again on the next sync.

- This isn't solved directly at the storage layer. Instead peers should agree on a shared "retention period" for deleted data.
- If a document is deleted and the updatedAt is older than the retention period, all peers should then purge the document (and therefore all versions) to permanently delete it.
- If a version is deleted and the updatedAt is older than the retention period,
  all peers should purge that version.

This method has limitations:
- It relies on peers having the same retention period.
- An old version would be immediately purged.

These are tradeoffs to allow permanent deletion, otherwise peers would have to do something like keep a permanent record of purged version ids in case of very outdated peers. If the "retention period" consistency is enforced at a protocol level though, such as when exchanging version data, this can be mitigated.
