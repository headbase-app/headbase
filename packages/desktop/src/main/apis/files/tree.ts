import {readdir, stat as fsStat} from "node:fs/promises";
import {basename, join, sep} from "node:path";

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

export async function getDirectoryTree(folderPath: string) {
	return _getDirectoryTree(folderPath, folderPath)
}

export async function _getDirectoryTree(directoryPath: string, rootPath: string) {
	// todo: use recursive option to avoid manual recursion of _tree?
	// advantage of doing this is file structure remains intact
	const children = await readdir(directoryPath)

	const parentDirectory: FileSystemDirectory = {
		type: 'directory',
		name: basename(directoryPath),
		path: directoryPath.replace(rootPath, ''),
		children: []
	}

	for (const fileItem of children) {
		const filePath = join(directoryPath + sep + fileItem)
		const fileStats = await fsStat(filePath)
		if (fileStats.isDirectory()) {
			const childItem = await _getDirectoryTree(filePath, rootPath)
			parentDirectory.children.push(childItem)
		}
		else {
			parentDirectory.children.push({
				type: "file",
				name: basename(filePath),
				path: filePath.replace(rootPath, ''),
			})
		}
	}

	return parentDirectory
}
