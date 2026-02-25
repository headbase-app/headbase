# Plugins
The application provides a plugin system for extensibility. This system is used by built-in first-party tools and
allows you to add your own third-party tools too.

Plugins can:
- Register "editors" for given file patterns
- Read and write to the vault file system via the FileSystemAPI
- Use the MarkdownQueryAPI to run front-matter queries against markdown files in a given directory.
- Register custom application UI

## Built-in Plugins
- Application
  - File explorer
  - Search
  - AI Chat
  - History
  - Snapshot (view a specific snapshot of a file)
- Content Editors:
  - Text
  - Basic Markdown
  - Enhanced Markdown (includes UI for special front-matter fields)
  - Excalidraw
  - Canvas
  - Spreadsheet
  - Media Player
  - PDF Viewer
- Search & Query:
  - Gallery
  - List / Grid
  - Calendar
  - Kanban Board
  - Graph
