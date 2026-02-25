# Data Model

## Basics

### File History
vault_id

id (PK)
previous_id

file_id
parent_file_id
is_directory
name

created_at
created_by
updated_at
updated_by
deleted_at
deleted_by

data_hash
data_size

### File Chunks
version_id
hash

## Pseudo Code
- Encounter file creation or change
  - Resolve file path from versions
  - if found:
    - get existing file_id
  - if not found:
    - create new file_id
  - create new version id
  - process file into chunks, for each chunk:
    - write chunk to file system (.headbase/chunks/)
    - write chunk to database
  - write file version to history
  - trigger server sync
- Encounter delete
	- Select from file history where path matches, order by most recent, limit 1.
  - if exists
    - delete all versions with matching file_id
- Encounter rename
  - Select old path from file history where path matches, order by most recent, limit 1.
  - delete all versions with matching file_id
    -
    -
