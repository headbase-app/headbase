# OPFSX

Work with the [Origin private file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
using paths and an API inspired by UNIX commands. 

## Installation
```bash
npm install opfsx
```

## Usage
```ts
import * as opfs from "opfsx"

// Write to a file
await opfs.write("/example/path/test.text", "hello world")

// Read a file
const file = await opfs.read("/example/path/test.text") // Returns File instance
const content = await file.text()
console.log(file.name) // test.txt
console.log(content) // hello world

// Make a directory
await opfs.mkdir("/example/nested/test-folder")

// List items in a directory
await opfs.ls("/example/nested")

// List all .md files in a directory and all subdiretories
const items = await opfs.ls("/example/nested", {recursive: true})
const markdownFiles = items.filter(item => item.kind === 'file' && item.name.endsWith('.md'))

// Get a tree structure of a directory, recursively reading all directories and files.
await opfs.tree("/example/nested")

// Remove directory and files
await opfs.rm("/example/path/test.text")
await opfs.rm("/example", {recursive: true})
```

## Contributions
Feel free to suggest features, give feedback, suggest improvements, raise bugs, open PRs and anything else.

## License
This project is released under the [MIT license](./license.txt).
