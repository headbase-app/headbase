import type {IEventsService} from "@api/events/events.interface";
import {EventTypes} from "@api/events/events";
import {LiveQueryStatus, type LiveQuerySubscriber, type LiveQuerySubscription} from "@contracts/query";
import type {FileSystemDirectory, IFileBuffer, IFilesAPI} from "@api/files/files.interface";
import * as opfsx from "opfsx";
import {processTree} from "@api/files/process-tree.ts";

// todo: add to opfsx
function join(...pathParts: string[]) {
	return pathParts.join("/")
}

export class FilesAPI implements IFilesAPI {
	constructor(
		private readonly eventsService: IEventsService
	) {
		window.opfsx = opfsx
		window.platformAPI?.files_on_change((event: string, path: string) => {
			this.eventsService.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
				context: {
					id: ""
				},
				data: {
					vaultId: '',
					// @ts-ignore -- todo: fix type issue
					action: event,
					path: path,
				}
			})
		})
	}

	#getVaultPath(vaultId: string) {
		return `/headbase-v1/vaults/${vaultId}/files/`;
	}

	async tree(vaultId: string) {
		const vaultPath = this.#getVaultPath(vaultId)

		// Ensure the base directory exists as tree will fail without it
		await opfsx.mkdir(vaultPath)

		const tree = await opfsx.tree(vaultPath)
		return processTree(tree)
	}

	liveTree(vaultId: string, subscriber: LiveQuerySubscriber<FileSystemDirectory | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const result = await this.tree(vaultId)
				subscriber({status: LiveQueryStatus.SUCCESS, result: result })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_OPEN, handleEvent)
		this.eventsService.subscribe(EventTypes.DATABASE_CLOSE, handleEvent)
		this.eventsService.subscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_OPEN, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_CLOSE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)
			}
		}
	}

	async read(vaultId: string, path: string) {
		const parsedPath = opfsx.parsePath(path)
		const platformPath = join( this.#getVaultPath(vaultId), path)

		const file = await opfsx.read(platformPath)
		const buffer = await file.arrayBuffer()

		return {
			name: parsedPath.name,
			path: parsedPath.path,
			parentPath: parsedPath.parentPath,
			_platformPath: platformPath,
			buffer
		}
	}

	/**
	 * Return a "stream" for the given file.
	 * Note that currently this doesn't actually use streams for the web implementation, it loads
	 * the full array buffer and creates a URL.
	 *
	 * @param vaultId
	 * @param path
	 */
	async readStream(vaultId: string, path: string) {
		const parsedPath = opfsx.parsePath(path)
		const platformPath = join( this.#getVaultPath(vaultId), path)

		const file = await opfsx.read(platformPath)
		const buffer = await file.arrayBuffer()
		const blob = new Blob([buffer])
		const url = URL.createObjectURL(blob)

		return {
			name: parsedPath.name,
			path: parsedPath.path,
			parentPath: parsedPath.parentPath,
			_platformPath: platformPath,
			url
		}
	}

	async write(vaultId: string, path: string, data: ArrayBuffer) {
		const platformPath = join( this.#getVaultPath(vaultId), path)

		// todo: this doesn't support binary files, can remove TextDecoder once opfsx supports binary data.
		const content = new TextDecoder().decode(data)
		await opfsx.write(platformPath, content)
	}

	async openExternal(vaultId: string, path: string) {
		const platformPath = join( this.#getVaultPath(vaultId), path)
		console.debug("open external triggered for:", platformPath)
	}

	// @ts-ignore
	cp(sourcePath: string, targetPath: string): Promise<void> {
		return Promise.resolve(undefined);
	}

	// @ts-ignore
	liveRead(path: string): Promise<IFileBuffer> {
		// @ts-ignore
		return Promise.resolve(undefined);
	}

	// @ts-ignore
	mv(sourcePath: string, targetPath: string): Promise<void> {
		return Promise.resolve(undefined);
	}

	// @ts-ignore
	rm(path: string): Promise<void> {
		return Promise.resolve(undefined);
	}
}
