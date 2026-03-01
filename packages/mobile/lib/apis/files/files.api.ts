import type {Observable} from "rxjs";
import type {LiveQueryResult} from "../../control-flow.ts";

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
	// Vault files. todo: move to different API like vaults?
	isVaultLocationSelectable: () => boolean,
	selectVaultLocation: () => Promise<string|null>
	// Permission checks
	checkPermissions: () => Promise<boolean>
	requestPermissions: () => Promise<boolean>
	// Path formatting
	getFileName: (path: string) => string
	getPathDisplay: (path: string) => string
	// File system operations
	tree: (path: string) => Promise<IFileSystemTree|null>
	ls: (path: string) => Promise<IFileSystemItem[]>
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
	liveRead: (path: string) => Observable<LiveQueryResult<string>>
}
