import {Observable} from "rxjs";

import {
	EventTypes, FileStats, type IEventsService,
	type IFilesAPI,
	type IFileSystemItem,
	type IFileSystemTree,
	type LiveQueryResult, LiveQueryStatus, ParsedPath
} from "@headbase-app/lib";


export class FilesAPI implements IFilesAPI {
	constructor(
		private eventsService: IEventsService
	) {}

	parsePath(path: string): ParsedPath {
		// todo: may not work across posix/windows?
		const parts = path.split("/");
		const base = parts[parts.length - 1]

		const dir =  parts.slice(0, parts.length - 1).join("/")

		const extParts = base.split(".")
		const ext = extParts.slice(0, extParts.length - 1).join(".");

		return {
			base: base,
			dir: dir,
			ext: ext,
		}
	}

	async ls(path: string) {
		const platformResponse = await window.platformAPI.files_ls(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async tree(path: string) {
		const platformResponse = await window.platformAPI.files_tree(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async glob(basePath: string, pattern: string) {
		const platformResponse = await window.platformAPI.files_glob(basePath, pattern)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async mv(sourcePath: string, destinationPath: string) {
		const platformResponse = await window.platformAPI.files_mv(sourcePath, destinationPath)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async cp(sourcePath: string, destinationPath: string) {
		const platformResponse = await window.platformAPI.files_cp(sourcePath, destinationPath)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async rm(path: string) {
		const platformResponse = await window.platformAPI.files_rm(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async mkdir(path: string) {
		const platformResponse = await window.platformAPI.files_mkdir(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async read(path: string) {
		const platformResponse = await window.platformAPI.files_read(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}
	async readAsText(path: string) {
		const platformResponse = await window.platformAPI.files_readAsText(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}
	async readAsUrl(path: string) {
		const platformResponse = await window.platformAPI.files_readAsUrl(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async stat(path: string): Promise<FileStats> {
		const platformResponse = await window.platformAPI.files_stat(path)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async write(path: string, data: ArrayBuffer | Uint8Array) {
		const platformResponse = await window.platformAPI.files_write(path, data)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async writeText(path: string, data: string) {
		const platformResponse = await window.platformAPI.files_writeText(path, data)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree | null>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const tree = await this.tree(path)
					observer.next({status: LiveQueryStatus.SUCCESS, result: tree })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null})
				}
			}

			this.eventsService.subscribe(EventTypes.FILE_CHANGE, runQuery)
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.FILE_CHANGE, runQuery)
			}
		})
	}

	liveLs(path: string) {
		return new Observable<LiveQueryResult<IFileSystemItem[]>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const list = await this.ls(path)
					observer.next({status: LiveQueryStatus.SUCCESS, result: list })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
				}
			}

			this.eventsService.subscribe(EventTypes.FILE_CHANGE, runQuery)
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.FILE_CHANGE, runQuery)
			}
		})
	}
}
