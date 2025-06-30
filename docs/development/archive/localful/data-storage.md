# Data Storage

## Content Basics
Every time you edit content a new versions is created. A version contains all data associated with that content, and a version can only be created or deleted.  

## Data Structure
Each entity is stored using the following structure:

- **Entity**
  - id
  - isDeleted
  - createdAt
  - localfulVersion
  - currentVersionId (local only)
 
- **Entity Version**
  - entityId
  - id
  - createdAt
  - data
  - schemaVersion
  - localfulVersion

## Version History and Deleted Data
- Databases can either be "local" or "cloud". A local database only exists on a single device, and cloud databases can be synced to the server and between devices.
- To delete a database, you must delete both the cloud database and manually delete the database from **all** devices.
- When entities are deleted, all version data is deleted and the `isDeleted` flag is set to true on the device. These same actions will then be performed by the server and other devices.
- An `isDeleted` flag is required as otherwise devices wouldn't be able to identity the difference between deleted data
  and data that just doesn't exist on the server yet.
 
