# Plugins
The application provides a plugin system for extensibility. This system is used by built-in first-party tools and
allows you to add your own third-party tools too.

Plugins can:
- Register "editors" for given file patterns
- Read and write to the vault file system via the FileSystemAPI
- Use the MarkdownQueryAPI to run front-matter queries against markdown files in a given directory.
- Register custom application UI

### Plugin Ideas
- Editors
  - Text
  - Basic Markdown
  - Enhanced Markdown
  - List / Grid
  - Calendar
  - Kanban Board
  - Canvas
  - Graph
  - Excalidraw
  - Spreadsheet
  - Gallery
  - Media Player
  - PDF Viewer
- Application
  - File explorer
  - Search
  - AI Chat
  - History
  - Table of contents / Outlines
