# OPFSX

Interact with the [Origin private file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) using paths and an API inspired by UNIX commands.

## Installation
```bash
npm install opfsx
```

## Usage
OPFSX provides "commands" which can be used on the main thread and within workers.  
A list of all available commands can be found below along with basic examples. For more example usages, see the [./examples](./examples) folder.

### Paths
For most commands it's obvious if a path should be interpreted as a directory or a file (`mkdir`, `ls`, `tree`, `create`, `read`), or the command may work on a file or directory (`cp`, `mv`, `rm`).  
In situations where there could be ambiguity, such as if you need to directly use the `resolve` function, a trailing slash is used to signal that the path is intended as a directory.

### `resolve`
Resolve the given path into a [FileSystemDirectoryHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) or [FileSystemFileHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle).  
A path with a trailing slash will resolve to a directory and paths without will resolve to a file.

The default behaviour is to throw an error if the directory/file doesn't exist, passing the `create: true` option will cause all required directories and the file itself to be created.

```ts
import * as opfs from "opfsx"

const fileHandle = await opfs.resolve("/example/path/test.txt")

// will cause any missing directories to be created, then return the handle for the 'yet' directory
const directoryHandle = await opfs.resolve("/example/not/create/yet/", {create: true})

// will resolve to file as there is no trailing slash
const fileHandle2 = await opfs.resolve("/example/path/test", {create: true})
```

The `resolve` command is useful if you wish to make use of the faster [FileSystemSyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) within a worker:
```ts
import * as opfs from "opfsx"

const fileHandle = opfs.resolve("/example/path/test.txt")
const syncAccessHandle = await fileHandle.createSyncAccessHandle();
```

### `write`
Write a string, Blob or File to the given file path. This command will recursively create any missing directories and the file itself if missing.

Write text content to a file:
```ts
import * as opfs from "opfsx"

await opfs.write("/example/path/test.txt", "hello world")
```

Write a file:
```ts
import * as opfs from "opfsx"

const markdownFile = new File(["# hello world \n this is some **example** markdown"], "hello.md", {type: "text/markdown"})
await opfs.write(`/example/path/hello.md`, markdownFile)
```

You are not limited to just text files, you could write things like images too:
```ts
import * as opfs from "opfsx"

// assuming an input accepting image files...
const profileImage = document.getElementById("profile-image").files[0];
await opfs.write(`/images/profile/${profileImage.name}`, profileImage)
```

### `read`
Read a file, returning the [File](https://developer.mozilla.org/en-US/docs/Web/API/File) instance retrieved from [FileSystemFileHandle.getFile()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/getFile).  
If you are writing code within a worker, you may want to consider fetching the handle via `resolve()` and using [FileSystemSyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) instead.

```ts
import * as opfs from "opfsx"

const file = await opfs.read("/example/path/hello.md")
const content = await file.text()
console.log(file.name) // hello.md
console.log(content) // hello world
```

Construct URL from an image file:
```ts
import * as opfs from "opfsx"

const file = await opfs.read("/images/example.png")
const url = URL.createObjectURL(file)
console.log(file.name) // example.png
console.log(url) // something like 'blob:https://example.com/7bf69880-a2d0-4a12-81a8-56637cc80b23' which you could now add to an <img/> element
```

### `ls`
List items in a directory. Only direct children are returned by default, but you can pass the `recursive: true` flag to also include all subdirectories and their files.  
This command always returns a flat array, even with the `recursive` options set. If you wish to list all content while preserving the directory structure, use the `tree()` command instead.  
In future this command may support some form on built-in filtering, but for now it will always return all files and directories.

```ts
import * as opfs from "opfsx"

// List files and directoreis at the given location
await opfs.ls("/example/path")

// List all .md files in a directory and all subdiretories
const items = await opfs.ls("/example/nested", {recursive: true})
const markdownFiles = items.filter(item => item.kind === 'file' && item.name.endsWith('.md'))
```

Recursive list .md files in a directory:
```ts
import * as opfs from "opfsx"

const items = await opfs.ls("/example", {recursive: true})
const markdownFiles = items.filter(item => item.kind === 'file' && item.name.endsWith('.md'))
```

### `tree`
Get the "tree" structure of a directory, recursively reading all subdirectories and files.

```ts
import * as opfs from "opfsx"

await opfs.tree("/example")
```

### `mkdir`
Create a directory, recursively creating any folders in the path that don't exist yet.

```ts
import * as opfs from "opfsx"

await opfs.mkdir("/example/nested/path")
```

### `rm`
Remove a file or directory. To remove a directory, you must pass the `recursive: true` option.

```ts
import * as opfs from "opfsx"

await opfs.rm("/example/hello.md")

// Pass 'recursive' option to delete a directory
await opfs.rm("/", {recursive: true})
```

### `cp`
Copy a file or directory to another location, will fail if any directory in destination path doesn't exist unless passing `create: true` option.  
In cases where the destination path could be interpreted as either a file or directory, a trailing slash is used to signal that the path is a directory.

Copy a file:
```ts
import * as opfs from "opfsx"

await opfs.cp("/example/hello.md", "/example2/hello.md")
```

Copy an entire directory:
```ts
import * as opfs from "opfsx"

// assuming /example2 doesn't exist yet, create option is required here
await opfs.cp("/example", "/example2/nested", {create: true})
```

Handling ambiguous paths:
```ts
import * as opfs from "opfsx"

// test.md would be copied to a file called 'nested' with no file extension:
await opfs.cp("/example/test.md", "/example2/nested")

// test.md would be copied into the directory called 'nested'. This requires the `create` option if the directory doesn't exist yet.
await opfs.cp("/example/test.md", "/example2/nested/", {create: true})

// would copy 'folder' into the 'nested' directory
await opfs.cp("/example/folder", "/example2/nested", {create: true})
```

### `mv`
OPFS has no concept of moving files, so this command just runs `cp()` then `rm()`.
The operation will fail if any directory in destination path doesn't exist unless passing `create: true` option.
Ambiguous paths are handled just like `cp()`, using a trailing slash to signal a directory.

```ts
import * as opfs from "opfsx"

await opfs.mv("/example/hello.md", "/example2/hello.md")

await opfs.mv("/example/nested/test1", "/example/new-folder", {create: true})
```

### `stat`

Get metadata about a given directory or file:
```ts
import * as opfs from "opfsx"

await opfs.stat("/example/nested/test1")
```

## Contributions
Feel free to suggest features, give feedback, suggest improvements, raise bugs, open PRs and anything else.

## License
This project is released under the [MIT license](./license.txt).
