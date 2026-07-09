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

export interface IFilesAPI {
	// Path formatting
	getFileName: (path: string) => string
	getPathDisplay: (path: string) => string
	// File system operations
	tree: (path: string) => Promise<IFileSystemTree|null>
	ls: (path: string) => Promise<IFileSystemItem[]>
	/**
	 * @param {string} pabasePathth - The base path to search from.
	 * @param {string} pattern - A glob pattern, see https://www.npmjs.com/package/minimatch.
	 */
	glob: (basePath: string, patten: string) => Promise<IFileSystemFile[]>
	mv: (sourcePath: string, destinationPath: string) => Promise<void>
	cp: (sourcePath: string, destinationPath: string) => Promise<void>
	rm: (path: string) => Promise<void>
	mkdir: (path: string) => Promise<void>
	read: (path: string) => Promise<Uint8Array>
	readAsText: (path: string) => Promise<string>
	readAsUrl: (path: string) => Promise<string>
	write: (path: string, data: ArrayBuffer|Uint8Array) => Promise<void>
	writeText: (path: string, data: string) => Promise<void>
	// Observable operations
	liveTree: (path: string) => Observable<LiveQueryResult<IFileSystemTree|null>>
	liveLs: (path: string) => Observable<LiveQueryResult<IFileSystemItem[]>>
	// todo: live file reading?
}
