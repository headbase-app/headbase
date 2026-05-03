import {Capacitor} from "@capacitor/core";
import {Encoding, Filesystem} from "@capacitor/filesystem";
import {Observable} from "rxjs";

import {
	EventTypes, type IEventsService,
	type IFilesAPI,
	type IFileSystemItem,
	type IFileSystemTree,
	type IFileSystemTreeItem,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult, LiveQueryStatus
} from "@headbase-app/lib";


export class FilesAPI implements IFilesAPI {
	constructor(
		private eventsService: IEventsService
	) {}

	getPathDisplay(path: string) {
		if (Capacitor.getPlatform() === "android") {
			if (path.startsWith("/storage/emulated/0/")){
				return path.replace("/storage/emulated/0/", "/")
			}
		}
		return path
	}

	getFileName(path: string): string {
		const parts = path.split("/")
		return parts[parts.length-1]
	}

	/**
	 * Return a nested tree structure of all files/directories from the given source.
	 *
	 * @param path
	 */
	async tree(path: string): Promise<IFileSystemTree> {
		return this.#tree(path, path)
	}
	async #tree(path: string, name?: string): Promise<IFileSystemTree> {
		console.debug(`[MobileFilesAPI] tree called for ${path}`)
		const result = await Filesystem.readdir({path})

		const children: IFileSystemTreeItem[] = []
		for (const file of result.files) {
			if (file.type === 'file') {
				children.push({
					type: "file",
					name: file.name,
					path: file.uri
				})
			}
			else {
				const nestedChildren = await this.#tree(file.uri, file.name)
				children.push(nestedChildren)
			}
		}

		return {
			type: "directory",
			name: name ?? path,
			path,
			children,
		}
	}

	async ls(path: string): Promise<IFileSystemItem[]> {
		const result = await Filesystem.readdir({path})

		return result.files.map((file) => ({
			type: "file",
			name: file.name,
			path: file.name,
		}))
	}

	async mv(sourcePath: string, destinationPath: string) {}

	async cp(sourcePath: string, destinationPath: string) {}

	async rm(path: string) {}

	async mkdir(path: string) {}

	async read(path: string): Promise<Uint8Array> {
		const url = Capacitor.convertFileSrc(path)
		const response = await fetch(url)
		const blob = await response.blob()
		const buffer = await blob.arrayBuffer()
		return new Uint8Array(buffer)
	}

	async readAsUrl(path: string): Promise<string> {
		return Capacitor.convertFileSrc(path)
	}

	async readAsText(path: string): Promise<string> {
		const file = await Filesystem.readFile({path, encoding: Encoding.UTF8})
		if (file.data instanceof Blob) {
			console.warn(`[filesystem] File '${path}' loaded as blob, converted via Blob.text()`)
			return await file.data.text()
		}
		return file.data
	}

	async write(path: string, data: ArrayBuffer | Uint8Array) {
		// todo: blob should include mime type data where possible?
		// @ts-ignore -- UInt8Array type is fine here (https://github.com/microsoft/TypeScript/issues/62546)
		const blob = new Blob([data])
		await Filesystem.writeFile({path, data: blob})
	}

	async writeText(path: string, data: string) {
		await Filesystem.writeFile({path, data, encoding: Encoding.UTF8})
	}

	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree>>(observer => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})

				try {
					const result = await this.tree(path)
					observer.next({status: LiveQueryStatus.SUCCESS, result })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
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
