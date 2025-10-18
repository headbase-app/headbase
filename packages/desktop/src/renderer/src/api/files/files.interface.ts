import {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";
import {FileSystemDirectory} from "@/main/apis/files/operations";

interface IFileBase {
	/**
	 * The filename such as 'example.md' in '/path/to/example.md'
	 */
	fileName: string
	/**
	 * The folder path such as 'example.md' in '/path/to'
	 */
	folderPath: string
	/**
	 * The full platform path such as '/home/example/documents/vault1/path/to/example.md'
	 */
	platformPath: string
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

export interface IFilesAPI {
	// Read / Write
	read: (path: string) => Promise<IFileBuffer>
	readStream: (path: string) => Promise<IFileStream>
	write: (path: string, buffer: ArrayBuffer) => Promise<void>
	liveRead: (path: string) => Promise<IFileBuffer>
	// Tree
	tree: () => Promise<FileSystemDirectory | null>
	liveTree: (subscriber: LiveQuerySubscriber<FileSystemDirectory | null>) => LiveQuerySubscription
	// File System Operations
	rm: (path: string) => Promise<void>
	mv: (sourcePath: string, targetPath: string) => Promise<void>
	cp: (sourcePath: string, targetPath: string) => Promise<void>
}
