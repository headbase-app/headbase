import {parse, sep as PATH_SEPARATOR} from "pathe"

export interface OPFSFile {
	kind: 'file'
	name: string
	path: string
	handle: FileSystemFileHandle
}

export interface OPFSDirectory {
	kind: 'directory',
	name: string
	path: string
	handle: FileSystemDirectoryHandle
}

export type OPFSItem = OPFSDirectory | OPFSFile

export interface OPFSDirectoryWithChildren extends OPFSDirectory {
	children: (OPFSDirectoryWithChildren|OPFSFile)[]
}

export interface ParsedFilePath {
	directory: string
	file: string
}

/**
 * Validate the given file path, returning the directory and filename and throwing if invalid.
 * @param path
 */
export function parseFilePath(path: string): ParsedFilePath {
	const parts = parse(path)
	if (!parts.base || !parts.ext) throw new Error("Invalid path, appears to be directory")

	return {
		directory: parts.dir,
		file: parts.base
	}
}

export interface ParsedDirectoryPath {
	name: string
	path: string
	parentPath: string
}

/**
 * Validate the given directory path, returning the path and its parent folder and throwing if invalid.
 * @param path
 */
export function parseDirectoryPath(path: string): ParsedDirectoryPath {
	const parts = parse(path)
	if (parts.base && parts.ext) throw new Error("Invalid path, appears to be file")

	return {
		name: parts.name,
		path: path,
		parentPath: parts.dir,
	}
}

/**
 * Parse the given path into its different parts.
 * @param path
 */
export function parsePath(path: string): ParsedDirectoryPath {
	const parts = parse(path)

	return {
		name: parts.base,
		path: path,
		parentPath: parts.dir,
	}
}

export interface ResolvePathOptions {
	create: boolean
}

/**
 * Resolve a file path into a handle.
 * Will throw if the supplied file or any directory don't exist, unless the create option is passed.
 *
 * @param path
 * @param options
 */
export async function resolveFilePath(path: string, options?: ResolvePathOptions): Promise<FileSystemFileHandle> {
	const parsedPath = parseFilePath(path)
	const parentDirectory = await resolveDirectoryPath(parsedPath.directory, {create: options?.create})

	return parentDirectory.getFileHandle(parsedPath.file, {create: options?.create})
}

export interface ResolveDirectoryOptions {
	create?: boolean
	directoryTree?: string[]
	parentHandle?: FileSystemDirectoryHandle
}


/**
 * Recursively resolve a path into a directory handle.
 * Will throw if any directory doesn't exist, unless the create option is passed.
 *
 * @param path
 * @param options
 */
export async function resolveDirectoryPath(path: string, options?: ResolveDirectoryOptions): Promise<FileSystemDirectoryHandle> {
	if (options?.directoryTree && options?.parentHandle) {
		const [currentDirectory, ...directoryTree] = options.directoryTree

		const currentDirectoryHandle = await options.parentHandle.getDirectoryHandle(currentDirectory, {create: options?.create})
		if (directoryTree.length === 0) {
			return currentDirectoryHandle
		}

		return resolveDirectoryPath(path, {create: options?.create, directoryTree: directoryTree, parentHandle: currentDirectoryHandle})
	}

	if (path === "/") {
		return navigator.storage.getDirectory()
	}

	const {path: directoryPath} = parseDirectoryPath(path)

	// filter to remove leading/trailing "" after splitting.
	const directoryTree = directoryPath.split(PATH_SEPARATOR).filter(Boolean)

	const parentHandle = options?.parentHandle ?? await navigator.storage.getDirectory()
	return resolveDirectoryPath(path, {create: options?.create, directoryTree, parentHandle})
}
