import {readdir, readFile, stat as fsStat, writeFile, glob as fsGlob} from "node:fs/promises"
import {basename, join, sep} from "node:path"

// todo: should use shared types from library?
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

export async function glob(basePath: string, pattern: string): Promise<FileSystemFile[]> {
	const results: FileSystemFile[] = []
	for await (const file of fsGlob(pattern, {cwd: basePath})) {
		const fullPath = join(basePath, file)
		results.push({
			type: "file",
			path: fullPath,
			name: basename(file),
		})
	}
	return results
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
	const buffer = await readFile(path)
	const stats = await stat(path)

	return {
		buffer,
		stats
	}
}

export async function readAsText(path: string) {
	const text = await readFile(path, {encoding: 'utf8'})
	const stats = await stat(path)

	return {
		text,
		meta: stats
	}
}

export async function readAsUrl(path: string) {
	const encodedPath = encodeURIComponent(path)
	const url = `hb://${encodedPath}`
	const stats = await stat(path)

	return {
		url,
		meta: stats
	}
}

export async function stat(path: string) {
	const stats = await fsStat(path)

	return {
		size: stats.size,
		createdAt: new Date(stats.birthtime).toISOString(),
		updatedAt: new Date(stats.mtime).toISOString()
	}
}
