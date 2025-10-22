# Sync - v0.1
This document contains the `v0.1` specification for Headbase Sync, which is responsible for:
- Maintaining history as the user modifies the file system
- Synchronizing the file system and history between devices and a central backup server

## Requirements

- how to handle internet drop out, when is an "upload" finished
- should all chunks/history be persisted separately to files? would lead to at least 2n storage costs
- how to resume chunks? chunks point to version/file so can recreate again
- if file is edited before sync finished/started, no storage of chunks anymore so won't be able to persist version
- notify of changes external to application? handle file hashing to ensure version aren't created unless required?


## Summary
- The sync system will store **File Metadata**, **Chunk Metadata** and **Chunks**:
 - File Metadata: Stores file information including id, version id, path, name, timestamps, hash, chunk metadata
 - Chunk Metadata: Stores chunk information including version id, order,

- The **File Path** (for example `/path/to/example.md`) is not a reliable identifier of a file, and identifiers at an OS
level are not consistent, therefore an application level ID will be maintained for each file.
- File metadata is maintained as files/folders are changed.
- To sync/store files and file history, files are chunked and these chunks are


## Design

- file system watcher (or OPFSX) feeds into event service
- event service isn't called directly to avoid duplicate events
- sync service runs at application level (via service worker/seperate thread in future)
-
