import {readdir, readFile, stat as fsStat, writeFile} from "node:fs/promises"
import {basename, join, sep} from "node:path"

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

export async function ls() {}

export async function mkdir() {}

export async function rm() {}

export async function cp() {}

export async function mv() {}

export async function write(path: string, data: ArrayBuffer|Uint8Array) {
	let buffer: Uint8Array;
	if (data instanceof ArrayBuffer) {
		buffer = new Uint8Array(data)
	} else {
		buffer = data
	}
	await writeFile(path, buffer)
}

export async function writeText(path: string, data: string) {
	await writeFile(path, data, {encoding: 'utf8'})
}

export async function read(path: string) {
	return await readFile(path)
}

export async function readAsText(path: string) {
	return await readFile(path, {encoding: 'utf8'})
}

export async function readAsUrl(path: string) {
	const encodedPath = encodeURIComponent(path)
	return `hb://${encodedPath}`
}

export function stat() {}
