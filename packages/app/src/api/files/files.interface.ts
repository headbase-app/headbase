import type {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";

interface IFileBase {
	/**
	 * The filename, such as 'example.md'
	 */
	name: string
	/**
	 * The path relative to the vault root, such as '/path/to/example.md'
	 */
	path: string
	/**
	 * The parent folder path such as '/path/to' in '/path/to/example.md'
	 */
	parentPath: string
	/**
	 * The full platform path where the file is stored, such as '/home/example/documents/vault1/path/to/example.md'.
	 */
	_platformPath: string
}

export interface IFileBuffer extends IFileBase {
	/**
	 * The full file contents as an array buffer.
	 */
	buffer: ArrayBuffer
}

export interface IFileStream extends IFileBase {
	/**
	 * The URL where the stream can be accessed.
	 */
	url: string
}

export interface FileSystemDirectory extends IFileBase {
	type: 'directory',
	children: FileSystemItem[]
}
export interface FileSystemFile extends IFileBase {
	type: 'file',
}
export type FileSystemItem = FileSystemDirectory | FileSystemFile


export interface IFilesAPI {
	// Read / Write
	read: (vaultId: string, path: string) => Promise<IFileBuffer>
	readStream: (vaultId: string, path: string) => Promise<IFileStream>
	liveRead: (vaultId: string, path: string) => Promise<IFileBuffer>
	write: (vaultId: string, path: string, buffer: ArrayBuffer) => Promise<void>
	// Tree
	tree: (vaultId: string) => Promise<FileSystemDirectory | null>
	liveTree: (vaultId: string, subscriber: LiveQuerySubscriber<FileSystemDirectory | null>) => LiveQuerySubscription
	// File System Operations
	rm: (vaultId: string, path: string) => Promise<void>
	mv: (vaultId: string, sourcePath: string, targetPath: string) => Promise<void>
	cp: (vaultId: string, sourcePath: string, targetPath: string) => Promise<void>
	// Open
	openExternal: (vaultId: string, path: string) => Promise<void>
}
