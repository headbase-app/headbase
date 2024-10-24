# Migrations

Migrations may be required in the following situations:
- Upgrades to the encryption spec such as the KDF function or encryption method used.
- Rotating encryption keys.

## ⚠️ Migration Risk ⚠️
All the migrations described here are potentially destructive actions and have the ability to cause data corruption, data lost and devices becoming out of sync.  
It is suggested that all these migrations need to be manual triggered user actions, and it would be up to the user to manage some of the risks involved
in such migrations by exporting content, ensuring only one device is in active use etc before performing any migrations with guidance from the app itself.

How applications manage stale content after migrations or out of date keys is not a solved problem for Localful yet,
this would have to be decided and handled on an app specific basis.

## Resource & Change Migrations
To combat the number of resource changes stored continually growing, which will affect performance over time, the suggestion
is to migrate to a new resource.  
On the client device, a new resource can be created and the old resource can then be copied over with a minimal number of changes.

## Encryption Key Rotation
To rotate just the `master key`, the device can generate a new one and submit an updated `protected master key`, also re-encrypting and updating all `resource encryption keys`.  

To rotate a `resource encryption key`, because changes are not editable, the device must create a new resource with a new `resource encryption key` and migrate all changes from the old resource, encrypting them with the new `resource encryption key`.

## KDF and Encryption Updates
The user's `protected master key` and `protected resource keys` are stored with metadata which includes the encryption spec used.  
In the event of a KDF or encryption spec update, clients can implement version detection and handle the change as required.

For a KDF change, the user must already be authenticated to the server, then they can update/retype their password and a new `protected master encryption key` and `server password` can be generated and submitted to the server.

For a resource encryption change, it is suggested that a resource migrations is done where a new resource version is created with the updated encryption method.

For a key encryption (wrapping) change, it is suggested that keys can be re-encrypted and uploaded to the server, the same method used for KDF changes or key rotations.
