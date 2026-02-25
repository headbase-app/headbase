<h1 align="center">Headbase</h1>

![](docs/screenshot.png)

<p align="center"><strong>Headbase</strong> is a personal management and productivity app which supercharges your local files with "content types" for easy editing features and "data sources" to create views like a list, table, kanban board, calendar, canvas or graph.</p>

<p align="center">
  <a href="/docs/install">Install</a> •
  <a href="/docs/user-guide">User Guide</a> •
  <a href="/docs/developer">Developer Docs</a> •
  <a href="https://github.com/headbase-app/headbase/issues">Feedback</a> •
  <a href="https://github.com/headbase-app/headbase/issues">Report Issue</a>
</p>

## About
> [!WARNING]
> This project is in active development and not ready for general use. You're welcome to explore at your own risk, but expect bugs, missing docs, incomplete features etc!

Headbase is an exploration of [local-first software](https://www.inkandswitch.com/essay/local-first) and [malleable systems](https://malleable.systems). The goal isn't to create a "notes app" or a "task management" app, but to develop primitives that users can build their own experience with while retaining control and agency
over their own data.

**SUPPORTED PLATFORMS**: The supported platforms are Linux, MacOS and Android. Windows and iOS support is planned, but not a current priority for testing.

**For users:**
- [Getting started](docs/user-guide/getting-started/README.md)
- [User guide](docs/user-guide/README.md)
- [FAQs](docs/user-guide/FAQs.md)
- [Feedback](https://github.com/headbase-app/headbase/issues)
- [Report issue](https://github.com/headbase-app/headbase/issues)

**For nerds:**
- [Architecture](docs/developer/architecture/README.md)
- [Build a plugin](docs/developer/plugins/README.md)
- [Local development](docs/developer/setup/README.md)

### Features

#### Vaults
Create vaults from device folders to separate your files.

#### Markdown first
Markdown files are the main supported way of creating content, however other file formats are supported such as viewing PDFs, images, videos and spreadsheets.

#### Content types
Content types allow you to define a structure for markdown file frontmatter which enables features such as...
- A specialised editing mode for markdown files which adds UI elements such as checkboxes, multiselect, scales etc.
- Quickly creating new files based on your content types.
- Enabling inline editing within views, and easily creating data sources based on your content types.

#### Views and data sources
Create filtered views of your files and data including in a list, table, kanban board, calendar, canvas or graph.

The data to display in views can come from different "data sources" such as:
- The content/frontmatter of markdown files, which is extra easy when using content types
- Rows of a CSV/TSV file

In future this may be expanded to integrate with "online" data sources such as:
- A HTTP endpoint
- An RSS feed

#### Workspace
Open files, folders and views within a tab-based tiling workspace and save/load different workspace states.

## Contributions
This project is currently open source, not open contribution.
This is a personal project in its early stages. You're welcome to try it out, ask questions, raise bug reports etc but
it wouldn't be practical to accept external code contributions or feature requests yet.

I'm open to this changing in the future once the project is more stable, collaboration is one of the great things about open source after all!

## Credits
Inspired by great tools such as [Obsidian](https://obsidian.md/), [Notion](https://www.notion.com/) and [Todoist](https://www.todoist.com/).

## License
Headbase is released under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) licence.
