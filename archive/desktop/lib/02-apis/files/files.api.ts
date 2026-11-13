import type {Observable} from "rxjs";
import type {LiveQueryResult} from "../../01-common/control-flow.js";

export interface IFileSystemFile {
	type: 'file',
	name: string,
	path: string,
}
export interface IFileSystemDirectory {
	type: 'directory',
	name: string,
	path: string,
}
export type IFileSystemItem = IFileSystemDirectory | IFileSystemFile

export interface IFileSystemDirectoryTree extends IFileSystemDirectory {
	children: IFileSystemTreeItem[]
}
export type IFileSystemTreeItem = IFileSystemDirectoryTree | IFileSystemFile

export interface IFileSystemTree {
	type: 'directory',
	name: string
	path: string
	children: IFileSystemTreeItem[]
}

export interface ParsedPath {
	dir: string
	base: string // base matches Node.js API, it is the filename with extension.
	ext: string
}

export interface FileStats {
	size: number
	createdAt: string
	updatedAt: string
}

export interface ReadFileBuffer {
	buffer: ArrayBuffer
	meta: FileStats
}
export interface ReadFileText {
	text: string
	meta: FileStats
}
export interface ReadFileURL {
	url: string
	meta: FileStats
}

export interface ListOptions {
	recursive?: boolean
}

export interface IFilesAPI {
	// Path formatting
	parsePath: (path: string) => ParsedPath
	// File system operations
	tree: (path: string) => Promise<IFileSystemTree|null>
	ls: (path: string, options?: ListOptions) => Promise<IFileSystemItem[]>
	/**
	 * @param {string} pabasePathth - The base path to search from.
	 * @param {string} pattern - A glob pattern, see https://www.npmjs.com/package/minimatch.
	 */
	glob: (basePath: string, patten: string) => Promise<IFileSystemFile[]>
	mv: (sourcePath: string, destinationPath: string) => Promise<void>
	cp: (sourcePath: string, destinationPath: string) => Promise<void>
	rm: (path: string) => Promise<void>
	mkdir: (path: string) => Promise<void>
	read: (path: string) => Promise<ReadFileBuffer>
	readAsText: (path: string) => Promise<ReadFileText>
	readAsUrl: (path: string) => Promise<ReadFileURL>
	stat: (path: string) => Promise<FileStats>
	write: (path: string, data: ArrayBuffer|Uint8Array) => Promise<void>
	writeText: (path: string, data: string) => Promise<void>
	// Observable operations
	liveTree: (path: string) => Observable<LiveQueryResult<IFileSystemTree|null>>
	liveLs: (path: string) => Observable<LiveQueryResult<IFileSystemItem[]>>
	// todo: live file reading?
}
