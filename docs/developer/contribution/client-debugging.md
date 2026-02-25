List all saved databases
```js
(async () => {
    const root = await navigator.storage.getDirectory()
    const directory = await root.getDirectoryHandle('headbase-v1')

    for await (const [key, value] of directory.entries()) {
        console.debug(key)
    }
})();
```

Delete a specific databases
```js
(async (databaseId = "374a5fca-5fd9-4d99-a8d2-dbab53b4d469") => {
    const root = await navigator.storage.getDirectory()
    const directory = await root.getDirectoryHandle('headbase-v1')
    await directory.removeEntry(`${databaseId}.sqlite3`)
})();
```

Delete all saved databases
```js
(async () => {
    const root = await navigator.storage.getDirectory()
    const directory = await root.getDirectoryHandle('headbase-v1')

    for await (const [key, value] of directory.entries()) {
        console.debug(key)
    }
})();
```
