import {type OPFSDirectory, type OPFSFile, type OPFSItem, resolveDirectoryPath} from "./common.ts";

export interface ListOptions {
	recursive: boolean
	currentDirectory?: FileSystemDirectoryHandle
}


/**
 * List all items in a given directory, with support for recursion.
 *
 * @param path
 * @param options
 */
export async function ls(
	path: string = "/",
	options?: ListOptions,
): Promise<OPFSItem[]> {
	const directoryHandle = options?.currentDirectory ?? await resolveDirectoryPath(path)
	const items: OPFSItem[] = []

	const childrenPromises: Promise<OPFSItem[]>[] = []

	// @ts-expect-error -- .values() does exist, see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values.
	const directoryIterator = directoryHandle.values() as IterableIterator<FileSystemDirectoryHandle|FileSystemFileHandle>;

	for await (const handle of directoryIterator) {
		if (handle.kind === 'file') {
			const file: OPFSFile = {
				kind: handle.kind,
				name: handle.name,
				path: `${path === "/" ? "" : path}/${handle.name}`,
				handle: handle
			}
			items.push(file)
		}
		else if (handle.kind === 'directory') {
			const directory: OPFSDirectory = {
				kind: handle.kind,
				name: handle.name,
				path: `${path === "/" ? "" : path}/${handle.name}`,
				handle: handle
			}
			items.push(directory)

			if (options?.recursive) {
				childrenPromises.push(
					ls(`${path}${handle.name}`, {recursive: options?.recursive, currentDirectory: handle})
				)
			}
		}
	}

	const resolvedChildren = await Promise.all(childrenPromises);
	const flattenedItems = resolvedChildren.flat(Infinity) as OPFSItem[];
	items.push(...flattenedItems)
	return items
}
