import {type OPFSDirectoryWithChildren, type OPFSFile, resolveDirectoryPath} from "../common.js";


/**
 * Recursively read the given path and return a tree structure of all directories and files.
 *
 * @param path
 * @param pathHandle
 */
export async function tree(
	path: string = "/",
	pathHandle?: FileSystemDirectoryHandle,
): Promise<OPFSDirectoryWithChildren> {
	// todo: assert path is valid (correct path format, not file etc)?

	const directoryHandle = pathHandle ?? await resolveDirectoryPath(path)

	const directory: OPFSDirectoryWithChildren = {
		kind: directoryHandle.kind,
		name: directoryHandle.name === "" ? "/" : directoryHandle.name,
		path,
		children: [],
		handle: directoryHandle,
	}

	const childrenPromises: Promise<OPFSDirectoryWithChildren|OPFSFile>[] = []

	// @ts-expect-error -- .values() does exist, see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values.
	const directoryIterator = directoryHandle.values() as IterableIterator<FileSystemDirectoryHandle|FileSystemFileHandle>;

	for await (const handle of directoryIterator) {
		if (handle.kind === 'file') {
			directory.children.push({
				kind: handle.kind,
				name: handle.name,
				path: `${path === "/" ? "" : path}/${handle.name}`,
				handle: handle
			})
		}
		else if (handle.kind === 'directory') {
			childrenPromises.push(
				tree(`${path}${handle.name}`, handle)
			)
		}
	}

	const resolvedChildren = await Promise.all(childrenPromises);
	directory.children.push(...resolvedChildren)
	return directory
}
