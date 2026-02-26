## Design

### File upload
- Device uploads file metadata to server, which includes chunks (`/v1/files [POST]`)
	- Server writes to `files` & `files_chunks` tables, file item set with `isCommitted` flag set to false.
	- Server queries object store for chunks that need to be uploaded.
	- Server response included chunk hashes that need to be uploaded.
- Device uploads all required chunks, fetching presigned URLs from `/v1/chunks/:vaultId/:hash [POST]` and uploading directly.
- Device commits the file using `/v1/files/:fileId/commit [POST]`.

### File and chunk storage limits
- Uncommitted expiry time - Period of time after which uncommitted file should be deleted, example 24 hrs.
- Version limit - Max number of versions allowed to be stored, example 50.
- Version retention limit - Period of time after which old versions should be deleted (if not most recent), example 6 months.
- Max vault size - max total size of vault (chunks stored), example 10GB
- Max chunk size - max size of individual chunk, example 4MB (DEVICE MUST KNOW BEFOREHAND OTHERWISE CHUNKING WILL BE WRONG)

### Object pruning
The database and object store may include files/chunks which aren't needed anymore:
- File might never have been committed.
- File might be beyond the retention policy.
- Chunks may be saved which are no longer required by any files

The server therefore runs a background/cron service to prune this old data for a given vault:
- Uncommitted files:
	- Load all uncommited files and delete it and related `files_chunks` if file is beyond **uncommitted expiry time**
- Version limit:
	- Load all unique `file_id` values
	- For each file:
		- If count is greater than version limit, delete all older versions and related `files_chunks`
- Old files:
	- Load all versions beyond the **version retention limit.**
	- If a newer version with the same `file_id` exists, delete it and all related `files_chunks`
- Orphaned chunks:
	- Load all stored chunks for the given vault
	- For each chunk:
		- Check if chunk is used by any `files_chunk` items
		- Delete from store if not

## Future
- Review if direct use of object store operations incur high costs. If so, will likely need a proxy table synced with object store
- Look at automatically updating file `committedAt` using callbacks from object store
