# File based system

## Basics
Use regular files (.md etc) rather than an application database in the name of longevity and interoperability.

- Markdown files are read and written via OPFS in the browser, user can manage like regular filesystem.
- Filesystem is the source of truth, and is where reads/writes occur.
- Known data for files is path, filename, content hash, maybe timestamp/s
- On write, a version is created in a database (maybe IndexedDB in browser or SQLite everywhere?)
- Versions in database include extra metadata like id, timestamps etc
- Versions synced between client/s and server
- Versions can then be applied back files in the filesystem

Questions:
- how to handle moves/renames in filesystem?
  - cause deletion of old data and creation of new?
  - could the version history be maintained
  - do files need some stable id added, or indirectly tracked?
  - external changes on desktop could cause issues where app looses track of file
- would performance be ok for complex querying of files?
  - initial tests using frontmatter based fields seem positive
- encryption at rest?
  - encryption at rest feels a bit like vendor lock-in, especially for desktop
  - bare text files feel like the best option for longevity
  - file content or fields could be encrypted at rest on individual basis by the user
  - all content would still be client-side encrypted for sync 
- privacy
  - should the server know file paths and names? should the path be hashed?