import {parsePath, resolveDirectoryPath} from "./common.ts";
import {ls} from "./ls.ts";

export interface RemoveOptions {
	recursive: boolean
}

export async function rm(path: string, options?: RemoveOptions) {
	// Special handling for root, as need to list and recursively delete children
	if (path === "/") {
		if (!options?.recursive) throw Error("Attempted to delete root without recursive option")

		const items = await ls(path)
		const root = await navigator.storage.getDirectory()
		for (const item of items) {
			await root.removeEntry(item.name, {recursive: true})
		}
		return
	}

	const { parentPath, name } = parsePath(path)
	const parentDirectoryHandle = await resolveDirectoryPath(parentPath)
	console.debug(name)
	await parentDirectoryHandle.removeEntry(name, options)
}
