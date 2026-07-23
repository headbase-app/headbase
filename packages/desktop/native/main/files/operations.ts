import {readdir, readFile, stat as fsStat, writeFile, glob as fsGlob, mkdir as fs_mkdir} from "node:fs/promises"
import {basename, join, sep, parse as path_parse} from "node:path"
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

function formatVaultFilePath(vaultPath: string, path: string) {
	const filePath = path.replaceAll(vaultPath, "")
	return filePath.startsWith("/") ? filePath : `/${filePath}`
}

export async function tree(basePath: string, vaultPath: string) {
	return _tree(basePath, vaultPath)
}

export async function _tree(vaultPath: string, directoryPath: string) {
	// todo: use recursive option to avoid manual recursion of _tree?
	// advantage of doing this is file structure remains intact
	const children = await readdir(directoryPath)

	const parentDirectory: FileSystemDirectory = {
		type: 'directory',
		name: basename(directoryPath),
		path: formatVaultFilePath(vaultPath, directoryPath),
		children: []
	}

	for (const fileItem of children) {
		const filePath = join(directoryPath + sep + fileItem)
		const fileStats = await fsStat(filePath)
		if (fileStats.isDirectory()) {
			const childItem = await _tree(vaultPath, filePath)
			parentDirectory.children.push(childItem)
		}
		else {
			parentDirectory.children.push({
				type: "file",
				name: basename(filePath),
				path: formatVaultFilePath(vaultPath, filePath),
			})
		}
	}

	return parentDirectory
}

export async function glob(vaultPath: string, directoryPath: string, pattern: string): Promise<FileSystemFile[]> {
	const fullVaultPath = join(vaultPath, directoryPath)

	const results: FileSystemFile[] = []
	for await (const filePath of fsGlob(pattern, {cwd: fullVaultPath})) {
		results.push({
			type: "file",
			path: formatVaultFilePath(vaultPath, filePath),
			name: basename(filePath),
		})
	}
	return results
}

export async function ls() {}

export interface MkdirOptions {
	recursive?: boolean
}
export async function mkdir(path: string, options?: MkdirOptions) {
	await fs_mkdir(path, { recursive: options?.recursive })
}

export async function rm() {}

export async function cp() {}

export async function mv() {}

export async function write(path: string, data: ArrayBuffer|Uint8Array) {
	const parsedPath = path_parse(path);
	await mkdir(parsedPath.dir, {recursive: true});

	let buffer: Uint8Array;
	if (data instanceof ArrayBuffer) {
		buffer = new Uint8Array(data)
	} else {
		buffer = data
	}
	await writeFile(path, buffer)
}

export async function writeText(path: string, data: string) {
	const parsedPath = path_parse(path);
	await mkdir(parsedPath.dir, {recursive: true});

	await writeFile(path, data, {encoding: 'utf8'});
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
