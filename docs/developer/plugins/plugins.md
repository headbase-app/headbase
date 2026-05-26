# Plugins
The application is built using a plugin system for extensibility.
This same plugin system is used to supply the built-in Headbase functionality and allow you to add your own third-party tools too.

Plugins types include:
- **Editors** which provide the ability to view and edit different file types.
- **Views** which provide ways to query, view and manage files
- **Actions?** which provide actions a user can trigger (search, rename/move, create etc)
- **Shortcuts** which provide keyboard shortcuts (on supported platforms)
- **Application?** which provide app level functionality such as search, file explorer etc

The application is split into multiple "ui areas" which application plugins can add to:
workspace - is main area use opens content too
shelf - positioned over the workspace, is where menus/tools are accessed from
panel - item added to the workspace, can have children tabs (BETTER WORD LINKED TO PHYSICAL WORLD?: node, block, item)
tabs - opened within a panel

## Built-in Plugins
- Application
  - File explorer
  - Search
  - AI Chat
  - History
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

## Implementation
The foundation of the plugin system is a set of abstract classes.
To create a plugin, these classes can be extended and their methods implemented.

Plugin classes are then registered with the application, where a combination of the base class used and a special static meta
property provides configuration for the intended plugin behaviour (such as supported file types for editors).

The abstract classes do not contain any functionality themselves, but define the API interfaces/properties
the plugin will receive at runtime. When a registered plugin class is instantiated by the application, the actual
implementations of APIs/properties are then injected.
