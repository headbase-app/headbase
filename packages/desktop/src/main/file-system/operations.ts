import { readdir, stat as fsStat } from "node:fs/promises"
import { join, basename, sep } from "node:path"

export interface FileSystemDirectory {
	type: 'directory',
	name: string,
	path: string,
	children: TreeItem[]
}

export interface FileSystemFile {
	type: 'file',
	name: string,
	path: string,
}

type TreeItem = FileSystemDirectory | FileSystemFile

export async function tree(folderPath: string) {
	return _tree(folderPath)
}

export async function _tree(directoryPath: string) {
	// todo: use recursive option to avoid manual recursion of _tree?
	// advantage of doing this is file structure remains intact
	const children = await readdir(directoryPath)

	const parentDirectory: FileSystemDirectory = {
		type: 'directory',
		name: basename(directoryPath),
		path: directoryPath,
		children: []
	}

	for (const fileItem of children) {
		const filePath = join(directoryPath + sep + fileItem)
		const fileStats = await fsStat(filePath)
		if (fileStats.isDirectory()) {
			const childItem = await _tree(filePath)
			parentDirectory.children.push(childItem)
		}
		else {
			parentDirectory.children.push({
				type: "file",
				name: basename(filePath),
				path: filePath,
			})
		}
	}

	return parentDirectory
}

export function ls() {}

export function mkdir() {}

export function rm() {}

export function cp() {}

export function mv() {}

export function write() {}

export function read() {}

export function stat() {}
