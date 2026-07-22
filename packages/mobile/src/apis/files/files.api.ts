import {Capacitor} from "@capacitor/core";
import {Encoding, Filesystem} from "@capacitor/filesystem";
import {Observable} from "rxjs";
import {Minimatch} from "minimatch";

import {
	EventTypes, type IEventsService,
	type IFilesAPI,
	type IFileSystemFile,
	type IFileSystemItem,
	type IFileSystemTree,
	type IFileSystemTreeItem,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult, LiveQueryStatus,
	FileStats,
	IWorkspaceVaultAPI,
	ParsedPath,
	ReadFileBuffer,
	ReadFileText,
	ReadFileURL,
	ListOptions
} from "@headbase-app/lib";

interface PlatformPath {
	vaultDirectory: string
	vaultFilePath: string
	filePath: string
}


/**
 * The mobile implementation of the Files API.
 *
 * === WorkspaceVaultAPI & Vault Paths ====
 * The current vault on mobile is stores at the application layer, meaning nothing is persisted in native storage.
 * Most file system access is also done via third-party packages such as @capacitor/filesystem which has no concept of
 * "vaults".
 *
 * This means that on mobile, this app layer Files API implementation must do all "business logic" validation and processing
 * such as constructing the full path before sending onto the @capacitor/filesystem library. On desktop, vault paths
 * can be passed directly to the platform electron layer which handles this.
 *
 * === File Access & Security ===
 * Because most filesystem access is currently done via @capacitor/filesystem, the app relies on the permissions built-in
 * to the platform for security. This does mean it is technically possible for a running plugin to access files from other
 * vaults etc if it can find a way to access the Capacitor APIs.
 * This can hopefully be improved in the future via either a custom native files plugin, or maybe by running plugins
 * in a more sandboxed environment such as a worker if this does seem like an issue.
 */
export class FilesAPI implements IFilesAPI {
	constructor(
		private eventsService: IEventsService,
		// mobile-specific requirement due to vault business logic being done in the "application layer"
		private workspaceVaultAPI: IWorkspaceVaultAPI
	) {}

	parsePath(path: string): ParsedPath  {
		// todo: may not work across all platforms?
		const parts = path.split("/");
		const base = parts[parts.length - 1]

		const dir = parts.slice(0, parts.length - 1).join("")

		const extParts = base.split(".")
		const ext = extParts.slice(0, extParts.length - 1).join(".");

		return {
			base: base,
			dir: dir,
			ext: ext,
		}
	}

	async getPlatformPath(relativePath: string): Promise<PlatformPath> {
		// todo: could Workspace API be edited to allow for synchronous access to current vault?
		const currentVault = await this.workspaceVaultAPI.get()
		if (!currentVault) {
			throw new Error("Attempted to use FilesAPI when no vault open")
		}

		// todo: more robust and platform-specific method needed to join paths
		// adding / and removing // as quick hack to handle leading/trailing slashes.
		const fullPath = currentVault.path + "/" + relativePath
		const filePath = fullPath
			.replaceAll("///", "/")
			.replaceAll("//", "/")

		return {
			vaultDirectory: currentVault.path,
			vaultFilePath: relativePath,
			filePath
		}
	}

	getVaultPath(vaultPath: string, path: string) {
		return decodeURIComponent(path)
			.replaceAll("file://", "")
			.replaceAll(vaultPath, "")
			.replaceAll("///", "/")
			.replaceAll("//", "/")
	}

	async ls(path: string, options?: ListOptions): Promise<IFileSystemItem[]> {
		const platformPath = await this.getPlatformPath(path);
		const recursive = options?.recursive ?? false

		console.debug(`[files] ls - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		return this.#ls(platformPath.vaultDirectory, platformPath.filePath, {recursive})
	}

	async #ls(vaultDirectory: string, platformPath: string, options: ListOptions): Promise<IFileSystemItem[]> {
		const result = await Filesystem.readdir({path: platformPath})

		const children: IFileSystemItem[] = []
		for (const file of result.files) {
			if (file.type === 'file') {
				children.push({
					type: "file",
					name: file.name,
					path: this.getVaultPath(vaultDirectory, file.uri)
				})
			}
			else if (options?.recursive) {
				const nestedChildren = await this.#ls(vaultDirectory, file.uri, options)
				children.push(...nestedChildren)
			}
		}
		return children
	}

	async tree(path: string): Promise<IFileSystemTree> {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] tree - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)
		return this.#tree(platformPath.vaultDirectory, platformPath.filePath)
	}
	async #tree(vaultPath: string, directoryPath: string): Promise<IFileSystemTree> {
		const relativePath = this.getVaultPath(vaultPath, directoryPath)
		const result = await Filesystem.readdir({path: directoryPath})

		const children: IFileSystemTreeItem[] = []
		for (const file of result.files) {
			if (file.type === 'file') {
				children.push({
					type: "file",
					name: file.name,
					path: this.getVaultPath(vaultPath, file.uri)
				})
			}
			else {
				const nestedChildren = await this.#tree(vaultPath, file.uri)
				children.push(nestedChildren)
			}
		}

		return {
			type: "directory",
			name: this.parsePath(relativePath).base,
			path: relativePath,
			children,
		}
	}

	async glob(filePath: string, pattern: string): Promise<IFileSystemFile[]> {
		const platformPath = await this.getPlatformPath(filePath);
		console.debug(`[files] glob - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		// ls does its own path handling, so don't need to pass platformPath or handle mapping
		const files = await this.ls(filePath, {recursive: true})
		const mm = new Minimatch(pattern)
		return files
			.filter(file => file.type === 'file')
			.filter(file => mm.match(file.path))
	}

	async mv(sourcePath: string, destinationPath: string) {}

	async cp(sourcePath: string, destinationPath: string) {}

	async rm(path: string) {}

	async mkdir(path: string) {}

	async read(path: string): Promise<ReadFileBuffer> {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] read - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		const url = Capacitor.convertFileSrc(platformPath.filePath)
		const response = await fetch(url)
		const blob = await response.blob()
		const buffer = await blob.arrayBuffer()
		//const uint8array = new Uint8Array(buffer)

		const stats = await this.stat(path)

		return {
			buffer,
			meta: stats
		}
	}

	async readAsText(path: string): Promise<ReadFileText> {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] readAsText - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		const file = await Filesystem.readFile({path: platformPath.filePath, encoding: Encoding.UTF8})

		let text: string
		if (file.data instanceof Blob) {
			console.warn(`[filesystem] File '${path}' loaded as blob, converted via Blob.text()`)
			text = await file.data.text()
		} else {
			text = file.data
		}

		const stats = await this.stat(path)

		return {
			text,
			meta: stats
		}
	}

	async readAsUrl(path: string): Promise<ReadFileURL> {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] readAsUrl - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)
		const url = Capacitor.convertFileSrc(platformPath.filePath)
		const stats = await this.stat(path)

		return {
			url,
			meta: stats
		}
	}

	async stat(path: string): Promise<FileStats> {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] stat - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		const stats = await Filesystem.stat({path: platformPath.filePath})

		return {
			size: stats.size,
			createdAt: stats.ctime ? new Date(stats.ctime).toISOString() : new Date().toISOString(),
			updatedAt: new Date(stats.mtime).toISOString()
		}
	}

	async write(path: string, data: ArrayBuffer | Uint8Array) {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] write - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		// todo: blob should include mime type data where possible?
		// @ts-ignore -- UInt8Array type is fine here (https://github.com/microsoft/TypeScript/issues/62546)
		const blob = new Blob([data])
		await Filesystem.writeFile({path: platformPath.filePath, data: blob})
	}

	async writeText(path: string, data: string) {
		const platformPath = await this.getPlatformPath(path);
		console.debug(`[files] writeText - [${platformPath.vaultDirectory}] ${platformPath.vaultFilePath}`)

		await Filesystem.writeFile({path: platformPath.filePath, data, encoding: Encoding.UTF8})
	}

	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree>>(observer => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const result = await this.tree(path)
					observer.next({status: LiveQueryStatus.SUCCESS, result })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
				}
			}

			this.eventsService.subscribe(EventTypes.FILE_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.FILE_CHANGE, runQuery)
				}
			}
		})
	}

	liveLs(path: string) {
		return new Observable<LiveQueryResult<IFileSystemItem[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}

	liveRead(path: string) {
		return new Observable<LiveQueryResult<string>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}
}
